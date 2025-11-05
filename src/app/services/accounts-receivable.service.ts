import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuditService } from './audit.service';
import { AccountReceivable } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsReceivableService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService
  ) {}

  async getAll(): Promise<AccountReceivable[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('accounts_receivable')
        .select(`
          *,
          customers (
            id,
            name,
            phone
          )
        `)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(error.message || 'Erro ao buscar contas a receber');
      }
      
      // Calcular status para cada conta
      return (data || []).map(account => ({
        ...account,
        status: this.calculateStatus(account.due_date, account.paid_date)
      }));
    } catch (err: any) {
      console.error('Erro ao carregar contas a receber:', err);
      throw err;
    }
  }

  async getByCustomerId(customerId: string): Promise<AccountReceivable[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('accounts_receivable')
        .select(`
          *,
          customers (
            id,
            name,
            phone
          )
        `)
        .eq('customer_id', customerId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(error.message || 'Erro ao buscar contas a receber');
      }
      
      return (data || []).map(account => ({
        ...account,
        status: this.calculateStatus(account.due_date, account.paid_date)
      }));
    } catch (err: any) {
      console.error('Erro ao carregar contas a receber:', err);
      throw err;
    }
  }

  async getById(id: string): Promise<AccountReceivable | null> {
    const { data, error } = await this.supabase.client
      .from('accounts_receivable')
      .select(`
        *,
        customers (
          id,
          name,
          phone
        )
      `)
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
    // Verificar se tem data de pagamento válida (não nula, não vazia, não é apenas espaços)
    if (paidDate && paidDate.trim() !== '' && paidDate !== 'null' && paidDate !== 'undefined') {
      return 'verde'; // Pago
    }

    // Se não tem data de pagamento, calcular baseado na data de vencimento
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'vermelho'; // Atrasado (vencido e não pago)
    } else if (diffDays <= 5) {
      return 'amarelo'; // Próximo do vencimento (até 5 dias)
    } else {
      return 'verde'; // Em dia (mais de 5 dias antes do vencimento) - mas não está pago
    }
  }

  async create(account: Partial<AccountReceivable>): Promise<AccountReceivable> {
    try {
      console.log('Criando conta a receber:', account);
      
      const cleanAccount: any = {
        customer_id: account.customer_id,
        amount: parseFloat(account.amount?.toString() || '0'),
        due_date: account.due_date,
        paid_date: account.paid_date || null,
        is_recurring: account.is_recurring !== undefined ? account.is_recurring : false
      };

      console.log('Dados limpos para inserção:', cleanAccount);

      const { data, error } = await this.supabase.client
        .from('accounts_receivable')
        .insert([cleanAccount])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase ao criar:', error);
        throw new Error(error.message || 'Erro ao criar conta a receber');
      }

      console.log('Conta a receber criada com sucesso:', data);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('CREATE', 'accounts_receivable', data.id, null, data).catch(err => 
        console.warn('Erro ao registrar auditoria:', err)
      );
      
      return data;
    } catch (err: any) {
      console.error('Erro ao criar conta a receber:', err);
      throw err;
    }
  }

  async update(id: string, account: Partial<AccountReceivable>): Promise<AccountReceivable> {
    // Buscar dados antigos para auditoria
    const oldData = await this.getById(id).catch(() => null);
    
    const { data, error } = await this.supabase.client
      .from('accounts_receivable')
      .update(account)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Registrar auditoria (não bloquear se falhar)
    await this.auditService.logAction('UPDATE', 'accounts_receivable', id, oldData, data).catch(err => 
      console.warn('Erro ao registrar auditoria:', err)
    );
    
    return data;
  }

  async markAsPaid(id: string, paidDate: string, isRecurring: boolean): Promise<AccountReceivable> {
    try {
      const account = await this.getById(id);
      if (!account) {
        throw new Error('Conta não encontrada');
      }

      const updateData: any = {
        paid_date: paidDate
      };

      // Se for recorrente, criar próxima conta
      if (isRecurring && account.customer_id) {
        const dueDate = new Date(account.due_date);
        const nextMonth = new Date(dueDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        // Criar próxima conta
        await this.create({
          customer_id: account.customer_id,
          amount: account.amount,
          due_date: nextMonth.toISOString().split('T')[0],
          is_recurring: true
        });
      }

      const { data, error } = await this.supabase.client
        .from('accounts_receivable')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('UPDATE', 'accounts_receivable', id, account, data).catch(err => 
        console.warn('Erro ao registrar auditoria:', err)
      );
      
      return data;
    } catch (err: any) {
      console.error('Erro ao marcar como pago:', err);
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    // Buscar dados para auditoria antes de excluir
    const oldData = await this.getById(id).catch(() => null);
    
    const { error } = await this.supabase.client
      .from('accounts_receivable')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Registrar auditoria (não bloquear se falhar)
    await this.auditService.logAction('DELETE', 'accounts_receivable', id, oldData, null).catch(err => 
      console.warn('Erro ao registrar auditoria:', err)
    );
  }
}

