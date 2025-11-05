import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuditService } from './audit.service';
import { LogService } from './log.service';
import { ErrorService } from './error.service';
import { CacheService } from './cache.service';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly CACHE_KEY_ALL = 'customers:all';
  private readonly CACHE_KEY_PREFIX = 'customers:';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
    private logService: LogService,
    private errorService: ErrorService,
    private cacheService: CacheService
  ) {}

  async getAll(): Promise<Customer[]> {
    // Verificar cache primeiro
    const cached = this.cacheService.get<Customer[]>(this.CACHE_KEY_ALL);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await this.supabase.client
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        this.logService.error('Erro do Supabase ao buscar clientes:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      const customers = data || [];
      
      // Armazenar no cache
      this.cacheService.set(this.CACHE_KEY_ALL, customers, this.CACHE_TTL);
      
      return customers;
    } catch (err: any) {
      this.logService.error('Erro ao carregar clientes:', err);
      // Se já for um Error com mensagem do ErrorService, apenas relançar
      if (err instanceof Error && err.message) {
        throw err;
      }
      // Caso contrário, transformar em mensagem amigável
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async getById(id: string): Promise<Customer | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    
    // Verificar cache primeiro
    const cached = this.cacheService.get<Customer>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await this.supabase.client
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logService.error('Erro ao buscar cliente por ID:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      if (data) {
        // Armazenar no cache
        this.cacheService.set(cacheKey, data, this.CACHE_TTL);
      }
      
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao buscar cliente:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async create(customer: Partial<Customer>): Promise<Customer> {
    try {
      this.logService.log('Criando cliente:', customer);
      
      // Remover campos undefined/null para evitar problemas
      const cleanCustomer: any = {
        name: customer.name,
        phone: customer.phone || null,
        plan_value: parseFloat(customer.plan_value?.toString() || '0'),
        plan_description: customer.plan_description || null,
        is_active: customer.is_active !== undefined ? customer.is_active : true
      };

      this.logService.log('Dados limpos para inserção:', cleanCustomer);

      const { data, error } = await this.supabase.client
        .from('customers')
        .insert([cleanCustomer])
        .select()
        .single();

      if (error) {
        this.logService.error('Erro do Supabase ao criar:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }

      this.logService.log('Cliente criado com sucesso:', data);
      
      // Invalidar cache
      this.invalidateCache();
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('CREATE', 'customers', data.id, null, data).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
      
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao criar cliente:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      // Buscar dados antigos para auditoria
      const oldData = await this.getById(id).catch(() => null);
      
      const { data, error } = await this.supabase.client
        .from('customers')
        .update(customer)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logService.error('Erro ao atualizar cliente:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      // Invalidar cache
      this.invalidateCache();
      this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${id}`);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('UPDATE', 'customers', id, oldData, data).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
      
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao atualizar cliente:', err);
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
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        this.logService.error('Erro ao excluir cliente:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      // Invalidar cache
      this.invalidateCache();
      this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${id}`);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('DELETE', 'customers', id, oldData, null).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
    } catch (err: any) {
      this.logService.error('Erro ao excluir cliente:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  /**
   * Invalida o cache de clientes
   */
  private invalidateCache(): void {
    this.cacheService.delete(this.CACHE_KEY_ALL);
    this.cacheService.invalidatePattern(this.CACHE_KEY_PREFIX);
  }
}

