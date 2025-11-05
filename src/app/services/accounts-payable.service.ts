import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuditService } from './audit.service';
import { AccountPayable } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsPayableService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService
  ) {}

  async getAll(): Promise<AccountPayable[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('accounts_payable')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(error.message || 'Erro ao buscar contas a pagar');
      }
      
      // Calcular status para cada conta
      return (data || []).map(account => {
        const status = this.calculateStatus(account.due_date, account.paid_date);
        console.log(`Conta ${account.description}:`, {
          due_date: account.due_date,
          paid_date: account.paid_date,
          paid_date_type: typeof account.paid_date,
          status_calculado: status
        });
        return {
          ...account,
          status
        };
      });
    } catch (err: any) {
      console.error('Erro ao carregar contas a pagar:', err);
      throw err;
    }
  }

  async getById(id: string): Promise<AccountPayable | null> {
    const { data, error } = await this.supabase.client
      .from('accounts_payable')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (data) {
      return {
        ...data,
        status: this.calculateStatus(data.due_date, data.paid_date)
      };
    }
    
    return null;
  }

  private calculateStatus(dueDate: string, paidDate?: string | null): 'verde' | 'amarelo' | 'vermelho' {
    // Verificar se tem data de pagamento válida
    // Verificar se não é null, undefined, string vazia, ou string "null"/"undefined"
    const hasPaidDate = paidDate && 
                       typeof paidDate === 'string' && 
                       paidDate.trim() !== '' && 
                       paidDate !== 'null' && 
                       paidDate !== 'undefined';
    
    if (hasPaidDate) {
      console.log('Conta marcada como PAGO - paid_date:', paidDate);
      return 'verde'; // Pago
    }

    // Se não tem data de pagamento, calcular baseado na data de vencimento
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`Calculando status: vencimento=${dueDate}, hoje=${today.toISOString()}, diffDays=${diffDays}, paidDate=${paidDate}`);

    if (diffDays < 0) {
      return 'vermelho'; // Atrasado (vencido e não pago)
    } else if (diffDays <= 5) {
      return 'amarelo'; // Próximo do vencimento (até 5 dias)
    } else {
      return 'verde'; // Em dia (mais de 5 dias antes do vencimento) - mas não está pago
    }
  }

  async create(account: Partial<AccountPayable>): Promise<AccountPayable> {
    try {
      console.log('Criando conta a pagar:', account);
      
      const cleanAccount: any = {
        description: account.description,
        amount: parseFloat(account.amount?.toString() || '0'),
        due_date: account.due_date,
        paid_date: account.paid_date || null,
        is_recurring: account.is_recurring !== undefined ? account.is_recurring : false,
        category: account.category || null
      };

      console.log('Dados limpos para inserção:', cleanAccount);

      const { data, error } = await this.supabase.client
        .from('accounts_payable')
        .insert([cleanAccount])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase ao criar:', error);
        throw new Error(error.message || 'Erro ao criar conta a pagar');
      }

      console.log('Conta a pagar criada com sucesso:', data);
      
      const result = {
        ...data,
        status: this.calculateStatus(data.due_date, data.paid_date)
      };
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('CREATE', 'accounts_payable', result.id, null, result).catch(err => 
        console.warn('Erro ao registrar auditoria:', err)
      );
      
      return result;
    } catch (err: any) {
      console.error('Erro ao criar conta a pagar:', err);
      throw err;
    }
  }

  async update(id: string, account: Partial<AccountPayable>): Promise<AccountPayable> {
    // Buscar dados antigos para auditoria
    const oldData = await this.getById(id).catch(() => null);
    
    const { data, error } = await this.supabase.client
      .from('accounts_payable')
      .update(account)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    const result = {
      ...data,
      status: this.calculateStatus(data.due_date, data.paid_date)
    };
    
    // Registrar auditoria (não bloquear se falhar)
    await this.auditService.logAction('UPDATE', 'accounts_payable', id, oldData, result).catch(err => 
      console.warn('Erro ao registrar auditoria:', err)
    );
    
    return result;
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

      if (error) throw error;
      
      const result = {
        ...data,
        status: this.calculateStatus(data.due_date, data.paid_date)
      };
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('UPDATE', 'accounts_payable', id, account, result).catch(err => 
        console.warn('Erro ao registrar auditoria:', err)
      );
      
      return result;
    } catch (err: any) {
      console.error('Erro ao marcar como pago:', err);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    // Buscar dados para auditoria antes de excluir
    const oldData = await this.getById(id).catch(() => null);
    
    const { error } = await this.supabase.client
      .from('accounts_payable')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Registrar auditoria (não bloquear se falhar)
    await this.auditService.logAction('DELETE', 'accounts_payable', id, oldData, null).catch(err => 
      console.warn('Erro ao registrar auditoria:', err)
    );
  }
}

