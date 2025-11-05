import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuditService } from './audit.service';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService
  ) {}

  async getAll(): Promise<Customer[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(error.message || 'Erro ao buscar clientes');
      }
      
      return data || [];
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      throw err;
    }
  }

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await this.supabase.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(customer: Partial<Customer>): Promise<Customer> {
    try {
      console.log('Criando cliente:', customer);
      
      // Remover campos undefined/null para evitar problemas
      const cleanCustomer: any = {
        name: customer.name,
        phone: customer.phone || null,
        plan_value: parseFloat(customer.plan_value?.toString() || '0'),
        plan_description: customer.plan_description || null,
        is_active: customer.is_active !== undefined ? customer.is_active : true
      };

      console.log('Dados limpos para inserção:', cleanCustomer);

      const { data, error } = await this.supabase.client
        .from('customers')
        .insert([cleanCustomer])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase ao criar:', error);
        console.error('Código do erro:', error.code);
        console.error('Detalhes:', error.details);
        console.error('Hint:', error.hint);
        
        // Mensagem de erro mais clara
        let errorMessage = 'Erro ao criar cliente. ';
        if (error.code === '42P01') {
          errorMessage = 'Tabela não encontrada! Execute o script SQL no Supabase para criar a tabela.';
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Verifique o console para mais detalhes.';
        }
        
        throw new Error(errorMessage);
      }

      console.log('Cliente criado com sucesso:', data);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('CREATE', 'customers', data.id, null, data).catch(err => 
        console.warn('Erro ao registrar auditoria:', err)
      );
      
      return data;
    } catch (err: any) {
      console.error('Erro ao criar cliente:', err);
      throw err;
    }
  }

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    // Buscar dados antigos para auditoria
    const oldData = await this.getById(id).catch(() => null);
    
    const { data, error } = await this.supabase.client
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Registrar auditoria (não bloquear se falhar)
    await this.auditService.logAction('UPDATE', 'customers', id, oldData, data).catch(err => 
      console.warn('Erro ao registrar auditoria:', err)
    );
    
    return data;
  }

  async delete(id: string): Promise<void> {
    // Buscar dados para auditoria antes de excluir
    const oldData = await this.getById(id).catch(() => null);
    
    const { error } = await this.supabase.client
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Registrar auditoria (não bloquear se falhar)
    await this.auditService.logAction('DELETE', 'customers', id, oldData, null).catch(err => 
      console.warn('Erro ao registrar auditoria:', err)
    );
  }
}

