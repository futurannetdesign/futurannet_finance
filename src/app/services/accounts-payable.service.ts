import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuditService } from './audit.service';
import { LogService } from './log.service';
import { ErrorService } from './error.service';
import { CacheService } from './cache.service';
import { AccountPayable } from '../models/customer.model';
import { calculateAccountStatus } from '../utils/account-status.util';

@Injectable({
  providedIn: 'root'
})
export class AccountsPayableService {
  private readonly CACHE_KEY_ALL = 'accounts_payable:all';
  private readonly CACHE_KEY_PREFIX = 'accounts_payable:';
  private readonly CACHE_TTL = 3 * 60 * 1000; // 3 minutos (mais curto pois dados mudam com frequência)

  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
    private logService: LogService,
    private errorService: ErrorService,
    private cacheService: CacheService
  ) {}

  async getAll(): Promise<AccountPayable[]> {
    // Verificar cache primeiro
    const cached = this.cacheService.get<AccountPayable[]>(this.CACHE_KEY_ALL);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await this.supabase.client
        .from('accounts_payable')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        this.logService.error('Erro do Supabase ao buscar contas a pagar:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      // Calcular status para cada conta usando função compartilhada
      const accounts = (data || []).map(account => ({
        ...account,
        status: calculateAccountStatus(account.due_date, account.paid_date)
      }));
      
      // Armazenar no cache
      this.cacheService.set(this.CACHE_KEY_ALL, accounts, this.CACHE_TTL);
      
      return accounts;
    } catch (err: any) {
      this.logService.error('Erro ao carregar contas a pagar:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async getById(id: string): Promise<AccountPayable | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    
    // Verificar cache primeiro
    const cached = this.cacheService.get<AccountPayable>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await this.supabase.client
        .from('accounts_payable')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logService.error('Erro ao buscar conta a pagar por ID:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      if (data) {
        const account = {
          ...data,
          status: calculateAccountStatus(data.due_date, data.paid_date)
        };
        // Armazenar no cache
        this.cacheService.set(cacheKey, account, this.CACHE_TTL);
        return account;
      }
      
      return null;
    } catch (err: any) {
      this.logService.error('Erro ao buscar conta a pagar:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async create(account: Partial<AccountPayable>): Promise<AccountPayable> {
    try {
      this.logService.log('Criando conta a pagar:', account);
      
      const cleanAccount: any = {
        description: account.description,
        amount: parseFloat(account.amount?.toString() || '0'),
        due_date: account.due_date,
        paid_date: account.paid_date || null,
        is_recurring: account.is_recurring !== undefined ? account.is_recurring : false,
        category: account.category || null
      };

      this.logService.log('Dados limpos para inserção:', cleanAccount);

      const { data, error } = await this.supabase.client
        .from('accounts_payable')
        .insert([cleanAccount])
        .select()
        .single();

      if (error) {
        this.logService.error('Erro do Supabase ao criar conta a pagar:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }

      this.logService.log('Conta a pagar criada com sucesso:', data);
      
      const result = {
        ...data,
        status: calculateAccountStatus(data.due_date, data.paid_date)
      };
      
      // Invalidar cache
      this.invalidateCache();
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('CREATE', 'accounts_payable', result.id, null, result).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
      
      return result;
    } catch (err: any) {
      this.logService.error('Erro ao criar conta a pagar:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async update(id: string, account: Partial<AccountPayable>): Promise<AccountPayable> {
    try {
      // Buscar dados antigos para auditoria
      const oldData = await this.getById(id).catch(() => null);
      
      const { data, error } = await this.supabase.client
        .from('accounts_payable')
        .update(account)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logService.error('Erro ao atualizar conta a pagar:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      const result = {
        ...data,
        status: calculateAccountStatus(data.due_date, data.paid_date)
      };
      
      // Invalidar cache
      this.invalidateCache();
      this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${id}`);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('UPDATE', 'accounts_payable', id, oldData, result).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
      
      return result;
    } catch (err: any) {
      this.logService.error('Erro ao atualizar conta a pagar:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async markAsPaid(id: string, paidDate: string, isRecurring: boolean): Promise<AccountPayable> {
    try {
      const account = await this.getById(id);
      if (!account) {
        throw new Error('Conta não encontrada');
      }

      const updateData: any = {
        paid_date: paidDate
      };

      // Se for recorrente, criar próxima conta
      if (isRecurring) {
        const dueDate = new Date(account.due_date);
        const nextMonth = new Date(dueDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        // Criar próxima conta
        await this.create({
          description: account.description,
          amount: account.amount,
          due_date: nextMonth.toISOString().split('T')[0],
          is_recurring: true,
          category: account.category
        });
      }

      const { data, error } = await this.supabase.client
        .from('accounts_payable')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logService.error('Erro ao marcar conta como paga:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      const result = {
        ...data,
        status: calculateAccountStatus(data.due_date, data.paid_date)
      };
      
      // Invalidar cache
      this.invalidateCache();
      this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${id}`);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('UPDATE', 'accounts_payable', id, account, result).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
      
      return result;
    } catch (err: any) {
      this.logService.error('Erro ao marcar como pago:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Buscar dados para auditoria antes de excluir
      const oldData = await this.getById(id).catch(() => null);
      
      const { error } = await this.supabase.client
        .from('accounts_payable')
        .delete()
        .eq('id', id);

      if (error) {
        this.logService.error('Erro ao excluir conta a pagar:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      // Invalidar cache
      this.invalidateCache();
      this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${id}`);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('DELETE', 'accounts_payable', id, oldData, null).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
    } catch (err: any) {
      this.logService.error('Erro ao excluir conta a pagar:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  /**
   * Invalida o cache de contas a pagar
   */
  private invalidateCache(): void {
    this.cacheService.delete(this.CACHE_KEY_ALL);
    this.cacheService.invalidatePattern(this.CACHE_KEY_PREFIX);
  }
}

