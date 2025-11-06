import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { LogService } from './log.service';
import { ErrorService } from './error.service';
import { Profile } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  private currentProfileSubject = new BehaviorSubject<Profile | null>(null);
  private currentRoleSubject = new BehaviorSubject<'admin' | 'manager' | 'viewer' | null>(null);
  private authInitialized = false;
  private authInitPromise: Promise<void>;

  public currentUser$ = this.currentUserSubject.asObservable();
  public currentProfile$ = this.currentProfileSubject.asObservable();
  public currentRole$ = this.currentRoleSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private logService: LogService,
    private errorService: ErrorService
  ) {
    // Configurar listener ANTES de inicializar
    this.setupAuthListener();
    this.authInitPromise = this.initAuth();
  }

  private setupAuthListener() {
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      this.logService.log('Auth state changed:', event, session?.user?.email || 'sem usuário');
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          this.logService.log('Usuário autenticado no listener:', session.user.email, 'Evento:', event);
          this.currentUserSubject.next(session.user);
          // Carregar perfil sem bloquear se falhar
          this.loadUserProfile().catch(err => 
            this.logService.error('Erro ao carregar perfil no listener:', err)
          );
        } else if (event === 'INITIAL_SESSION') {
          // INITIAL_SESSION sem sessão pode ser normal durante inicialização
          this.logService.log('INITIAL_SESSION sem sessão - aguardando inicialização completa');
        }
      } else if (event === 'SIGNED_OUT') {
        this.logService.log('Usuário deslogado explicitamente');
        this.clearUser();
      } else {
        this.logService.log('Evento de auth não tratado:', event);
      }
    });
  }

  private async initAuth() {
    try {
      // Aguardar um pouco para garantir que o listener está configurado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar localStorage diretamente para debug
      if (typeof window !== 'undefined' && window.localStorage) {
        const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
        this.logService.log('Chaves do Supabase no localStorage:', supabaseKeys);
        supabaseKeys.forEach(key => {
          const value = localStorage.getItem(key);
          this.logService.log(`  ${key}:`, value ? (value.substring(0, 50) + '...') : 'null');
        });
      }
      
      // Verificar sessão atual do Supabase (usa localStorage automaticamente)
      const { data: { session }, error } = await this.supabase.client.auth.getSession();
      
      if (error) {
        this.logService.error('Erro ao obter sessão:', error);
        // Verificar se há sessão válida mesmo com erro
        const user = await this.supabase.getCurrentUser();
        if (user) {
          this.logService.log('Usuário encontrado apesar do erro:', user.email);
          this.currentUserSubject.next(user);
          await this.loadUserProfile();
        } else {
          this.logService.log('Nenhum usuário encontrado após erro');
          this.clearUser();
        }
        return;
      }
      
      if (session?.user) {
        const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
        const isExpired = expiresAt ? expiresAt < new Date() : false;
        
        this.logService.log('Sessão encontrada ao inicializar:', {
          email: session.user.email,
          expiresAt: expiresAt?.toISOString(),
          isExpired,
          accessToken: session.access_token ? (session.access_token.substring(0, 20) + '...') : 'null'
        });
        
        if (isExpired) {
          this.logService.warn('Sessão expirada, tentando renovar...');
          // Tentar renovar token
          const { data: refreshData, error: refreshError } = await this.supabase.client.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            this.logService.error('Erro ao renovar sessão:', refreshError);
            this.clearUser();
            return;
          }
          this.currentUserSubject.next(refreshData.session.user);
        } else {
          this.currentUserSubject.next(session.user);
        }
        
        // Carregar perfil sem bloquear a autenticação se falhar
        try {
          await this.loadUserProfile();
        } catch (profileError) {
          this.logService.error('Erro ao carregar perfil na inicialização, mas mantendo autenticação:', profileError);
          // Manter usuário autenticado mesmo se perfil falhar
        }
      } else {
        this.logService.log('Nenhuma sessão encontrada no localStorage');
        this.clearUser();
      }
    } catch (error) {
      this.logService.error('Erro ao inicializar auth:', error);
      // Tentar recuperar usuário antes de limpar
      try {
        const user = await this.supabase.getCurrentUser();
        if (user) {
          this.logService.log('Usuário recuperado após erro:', user.email);
          this.currentUserSubject.next(user);
        } else {
          this.clearUser();
        }
      } catch {
        this.clearUser();
      }
    } finally {
      this.authInitialized = true;
      const isAuth = this.currentUserSubject.value !== null;
      this.logService.log('Auth inicializado. Usuário autenticado:', isAuth, isAuth ? this.currentUserSubject.value.email : '');
    }
  }

  async waitForAuthInit(): Promise<void> {
    if (!this.authInitialized) {
      await this.authInitPromise;
    }
  }

  private async loadUserProfile() {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        this.logService.warn('Nenhum usuário encontrado ao carregar perfil');
        this.clearUser();
        return;
      }

      // Manter o usuário autenticado mesmo se o perfil não for encontrado
      this.currentUserSubject.next(user);
      
      const profile = await this.supabase.getProfile(user.id);
      this.logService.log('Perfil carregado do banco:', profile);
      
      if (profile) {
        this.currentProfileSubject.next(profile);
        this.currentRoleSubject.next(profile.role);
        this.logService.log('Perfil atualizado no serviço. Role:', profile.role);
      } else {
        // Não limpar o usuário se ele estiver autenticado, apenas não definir perfil
        // Isso permite que o usuário continue autenticado mesmo se o perfil não existir
        this.logService.warn('Perfil não encontrado para o usuário:', user.id, '- Mantendo autenticação');
        // Não chamar clearUser() aqui - manter o usuário autenticado
      }
    } catch (error) {
      this.logService.error('Erro ao carregar perfil:', error);
      // Só limpar se realmente não houver usuário autenticado
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        this.clearUser();
      }
    }
  }

  private clearUser() {
    this.currentUserSubject.next(null);
    this.currentProfileSubject.next(null);
    this.currentRoleSubject.next(null);
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.logService.error('Erro ao fazer login:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      await this.loadUserProfile();
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao fazer login:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.client.auth.signOut();
      if (error) {
        this.logService.error('Erro ao fazer logout:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      this.clearUser();
      this.router.navigate(['/login']);
    } catch (err: any) {
      this.logService.error('Erro ao fazer logout:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async getCurrentUser() {
    // Garantir que a inicialização terminou
    await this.waitForAuthInit();
    return this.currentUserSubject.value;
  }

  async getCurrentProfile(): Promise<Profile | null> {
    return this.currentProfileSubject.value;
  }

  async getCurrentUserRole(): Promise<'admin' | 'manager' | 'viewer' | null> {
    return this.currentRoleSubject.value;
  }

  async isAuthenticated(): Promise<boolean> {
    // Aguardar inicialização se necessário
    await this.waitForAuthInit();
    
    // Verificar BehaviorSubject primeiro (mais rápido)
    if (this.currentUserSubject.value !== null) {
      this.logService.log('Usuário autenticado (BehaviorSubject):', this.currentUserSubject.value.email);
      return true;
    }
    
    // Se não houver no BehaviorSubject, verificar diretamente no Supabase
    try {
      const { data: { session }, error } = await this.supabase.client.auth.getSession();
      
      if (error) {
        this.logService.error('Erro ao obter sessão em isAuthenticated:', error);
        // Tentar getUser como fallback
        const user = await this.supabase.getCurrentUser();
        if (user) {
          this.logService.log('Usuário encontrado via fallback:', user.email);
          this.currentUserSubject.next(user);
          // Tentar carregar perfil sem bloquear
          this.loadUserProfile().catch(err => 
            this.logService.error('Erro ao carregar perfil em isAuthenticated:', err)
          );
          return true;
        }
        return false;
      }
      
      if (session?.user) {
        this.logService.log('Sessão encontrada no Supabase:', session.user.email);
        // Se encontrou sessão mas não está no BehaviorSubject, atualizar
        this.currentUserSubject.next(session.user);
        // Tentar carregar perfil sem bloquear a autenticação
        this.loadUserProfile().catch(err => 
          this.logService.error('Erro ao carregar perfil em isAuthenticated:', err)
        );
        return true;
      }
      
      this.logService.log('Nenhuma sessão encontrada');
    } catch (error) {
      this.logService.error('Erro ao verificar autenticação:', error);
    }
    
    return false;
  }

  canEdit(): boolean {
    const role = this.currentRoleSubject.value;
    return role === 'admin' || role === 'manager';
  }

  canDelete(): boolean {
    return this.currentRoleSubject.value === 'admin';
  }

  isAdmin(): boolean {
    return this.currentRoleSubject.value === 'admin';
  }

  isManager(): boolean {
    return this.currentRoleSubject.value === 'manager';
  }

  isViewer(): boolean {
    return this.currentRoleSubject.value === 'viewer';
  }
}

