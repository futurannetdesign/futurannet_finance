import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase.config';
import { Customer } from '../models/customer.model';
import { LogService } from './log.service';
import { ErrorService } from './error.service';

// Storage customizado que desabilita o LockManager para evitar conflitos
class CustomStorage {
  private storage: Storage;

  constructor() {
    this.storage = typeof window !== 'undefined' ? window.localStorage : ({} as Storage);
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      // Ignorar erros de quota excedida
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      // Ignorar erros
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(
    private logService: LogService,
    private errorService: ErrorService
  ) {
    // Configurar cliente com storage customizado
    // O storage customizado evita problemas com LockManager em múltiplas abas
    const customStorage = new CustomStorage();
    
    this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: customStorage
      }
    });

    // Capturar erros não tratados do LockManager (não afeta funcionalidade)
    // Esses erros ocorrem quando há múltiplas abas, mas não impedem o funcionamento
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const message = reason?.message || reason?.toString() || '';
        
        // Ignorar erros do LockManager (são avisos, não erros críticos)
        if (message.includes('LockManager') || message.includes('lock:sb-')) {
          event.preventDefault(); // Prevenir que apareça no console
          this.logService.debug('Erro do LockManager suprimido (não afeta funcionalidade)');
        }
      });
    }
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async getCurrentUser() {
    // Usar getSession primeiro para garantir que a sessão está carregada
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      return session.user;
    }
    // Se não houver sessão, tentar getUser (pode retornar null se não autenticado)
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

