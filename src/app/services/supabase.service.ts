import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase.config';
import { Customer } from '../models/customer.model';
import { LogService } from './log.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(
    private logService: LogService,
    private errorService: ErrorService
  ) {
    this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async getProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        this.logService.error('Erro ao buscar perfil:', error);
        return null;
      }
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao buscar perfil:', err);
      return null;
    }
  }

  async getAllProfiles() {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        this.logService.error('Erro ao buscar perfis:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao buscar perfis:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async createProfile(userId: string, email: string, role: 'admin' | 'manager' | 'viewer' = 'viewer') {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .insert([{
          id: userId,
          email,
          role
        }])
        .select()
        .single();
      
      if (error) {
        this.logService.error('Erro ao criar perfil:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao criar perfil:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async updateProfileRole(userId: string, role: 'admin' | 'manager' | 'viewer') {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        this.logService.error('Erro ao atualizar perfil:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao atualizar perfil:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }
}

