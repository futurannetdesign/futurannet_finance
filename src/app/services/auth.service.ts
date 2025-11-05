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

  public currentUser$ = this.currentUserSubject.asObservable();
  public currentProfile$ = this.currentProfileSubject.asObservable();
  public currentRole$ = this.currentRoleSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private logService: LogService,
    private errorService: ErrorService
  ) {
    this.initAuth();
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        this.loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        this.clearUser();
      }
    });
  }

  private async initAuth() {
    const user = await this.supabase.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
      await this.loadUserProfile();
    } else {
      this.clearUser();
    }
  }

  private async loadUserProfile() {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) {
        this.clearUser();
        return;
      }

      this.currentUserSubject.next(user);
      
      const profile = await this.supabase.getProfile(user.id);
      this.logService.log('Perfil carregado do banco:', profile);
      
      if (profile) {
        this.currentProfileSubject.next(profile);
        this.currentRoleSubject.next(profile.role);
        this.logService.log('Perfil atualizado no serviço. Role:', profile.role);
      } else {
        this.logService.warn('Perfil não encontrado para o usuário:', user.id);
        this.clearUser();
      }
    } catch (error) {
      this.logService.error('Erro ao carregar perfil:', error);
      this.clearUser();
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
    return this.currentUserSubject.value;
  }

  async getCurrentProfile(): Promise<Profile | null> {
    return this.currentProfileSubject.value;
  }

  async getCurrentUserRole(): Promise<'admin' | 'manager' | 'viewer' | null> {
    return this.currentRoleSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
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

