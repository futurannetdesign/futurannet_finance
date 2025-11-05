import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
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
    private router: Router
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
      console.log('Perfil carregado do banco:', profile);
      
      if (profile) {
        this.currentProfileSubject.next(profile);
        this.currentRoleSubject.next(profile.role);
        console.log('Perfil atualizado no serviço. Role:', profile.role);
      } else {
        console.warn('Perfil não encontrado para o usuário:', user.id);
        this.clearUser();
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      this.clearUser();
    }
  }

  private clearUser() {
    this.currentUserSubject.next(null);
    this.currentProfileSubject.next(null);
    this.currentRoleSubject.next(null);
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    await this.loadUserProfile();
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) throw error;
    
    this.clearUser();
    this.router.navigate(['/login']);
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

