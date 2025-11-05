import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuditLog } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Registra uma ação no audit log
   */
  async logAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    tableName: string,
    recordId: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        console.warn('Usuário não autenticado, não é possível registrar auditoria');
        return;
      }

      const auditData: Partial<AuditLog> = {
        user_id: user.id,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        new_data: newData ? JSON.parse(JSON.stringify(newData)) : null
      };

      const { error } = await this.supabase.client
        .from('audit_log')
        .insert([auditData]);

      if (error) {
        console.error('Erro ao registrar auditoria:', error);
        // Não lançar erro para não quebrar o fluxo principal
      }
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
      // Não lançar erro para não quebrar o fluxo principal
    }
  }

  /**
   * Busca todos os logs de auditoria
   */
  async getAllLogs(): Promise<AuditLog[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Limitar a 1000 registros mais recentes

      if (error) {
        console.error('Erro ao buscar logs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      throw error;
    }
  }

  /**
   * Busca logs por tabela
   */
  async getLogsByTable(tableName: string): Promise<AuditLog[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('audit_log')
        .select('*')
        .eq('table_name', tableName)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Erro ao buscar logs por tabela:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs por tabela:', error);
      throw error;
    }
  }

  /**
   * Busca logs por usuário
   */
  async getLogsByUser(userId: string): Promise<AuditLog[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Erro ao buscar logs por usuário:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar logs por usuário:', error);
      throw error;
    }
  }
}

