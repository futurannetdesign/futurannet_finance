import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../models/customer.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Gerenciamento de Usuários</h2>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" (click)="loadProfiles()" title="Atualizar lista">
              🔄 Atualizar Lista
            </button>
            <button class="btn btn-primary" (click)="showCreateForm = true" *ngIf="!showCreateForm">
              Novo Usuário
            </button>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          Carregando usuários...
        </div>

        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <div *ngIf="success" class="alert alert-success">
          {{ success }}
        </div>

        <!-- Formulário de criação -->
        <div *ngIf="showCreateForm" class="create-form">
          <h3>Novo Usuário</h3>
          <div class="alert alert-info" style="margin-bottom: 20px; background-color: #e3f2fd; color: #1976d2; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3;">
            <strong>📝 Como criar usuário:</strong>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Acesse o <strong>Supabase Dashboard</strong></li>
              <li>Vá em <strong>Authentication > Users</strong></li>
              <li>Clique em <strong>"Add User"</strong> ou <strong>"Create User"</strong></li>
              <li>Preencha email e senha</li>
              <li>Marque <strong>"Auto Confirm User"</strong></li>
              <li>Clique em <strong>"Create User"</strong></li>
              <li>O perfil será criado automaticamente com role "Visualizador"</li>
              <li>Volte aqui e atualize o perfil na lista abaixo se necessário</li>
            </ol>
            <p style="margin: 10px 0 0 0;"><strong>💡 Dica:</strong> Após criar no Supabase, clique em "Atualizar Lista" abaixo para ver o novo usuário.</p>
          </div>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email"
                class="form-control"
                placeholder="usuario@email.com">
              <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="error-message">
                Email é obrigatório e deve ser válido
              </div>
            </div>

            <div class="form-group">
              <label for="password">Senha</label>
              <input 
                type="password" 
                id="password" 
                formControlName="password"
                class="form-control"
                placeholder="Mínimo 6 caracteres">
              <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="error-message">
                Senha deve ter no mínimo 6 caracteres
              </div>
            </div>

            <div class="form-group">
              <label for="role">Perfil</label>
              <select id="role" formControlName="role" class="form-control">
                <option value="viewer">Visualizador</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || creating">
                {{ creating ? 'Criando...' : 'Criar Usuário' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="cancelCreate()">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de usuários -->
        <table *ngIf="!loading && profiles.length > 0" class="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Perfil</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let profile of profiles">
              <td>{{ profile.email }}</td>
              <td>
                <select 
                  [value]="profile.role" 
                  (change)="updateRole(profile.id, $event)"
                  class="role-select"
                  [disabled]="isCurrentUser(profile.id)">
                  <option value="viewer">Visualizador</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador</option>
                </select>
              </td>
              <td>{{ formatDate(profile.created_at) }}</td>
              <td>
                <button 
                  *ngIf="!isCurrentUser(profile.id)"
                  class="btn btn-danger btn-sm" 
                  (click)="deleteUser(profile.id)">
                  Excluir
                </button>
                <span *ngIf="isCurrentUser(profile.id)" class="badge">Você</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && profiles.length === 0" class="empty-state">
          <p>Nenhum usuário encontrado.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .create-form {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .create-form h3 {
      margin-top: 0;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
    }

    .role-select {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      background-color: #667eea;
      color: white;
      border-radius: 4px;
      font-size: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class UsersComponent implements OnInit {
  profiles: Profile[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  showCreateForm = false;
  creating = false;
  userForm: FormGroup;
  currentUserId: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['viewer', Validators.required]
    });
  }

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
    }
    await this.loadProfiles();
  }

  async loadProfiles() {
    this.loading = true;
    this.error = null;

    try {
      this.profiles = await this.supabase.getAllProfiles();
    } catch (err: any) {
      this.error = 'Erro ao carregar usuários: ' + (err.message || 'Erro desconhecido');
      console.error('Erro ao carregar perfis:', err);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.userForm.invalid) {
      return;
    }

    this.creating = true;
    this.error = null;
    this.success = null;

    try {
      const { email, password, role } = this.userForm.value;

      // Usar signUp ao invés de admin.createUser (não requer Service Role Key)
      // Nota: Em produção, você pode precisar desabilitar confirmação de email no Supabase
      // ou usar uma Edge Function para criar usuários sem confirmação
      const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login',
          data: {
            role: role // Guardar role nos metadados temporariamente
          }
        }
      });

      if (authError) {
        // Verificar se é erro de usuário já existente
        if (authError.message?.includes('already registered') || authError.message?.includes('already exists')) {
          throw new Error('Este email já está cadastrado no sistema.');
        }
        
        // Verificar se é erro de permissão
        if (authError.message?.includes('permission') || authError.message?.includes('unauthorized') || authError.message?.includes('User not allowed')) {
          throw new Error(
            '⚠️ Não foi possível criar o usuário automaticamente.\n\n' +
            '📋 SOLUÇÃO: Crie o usuário manualmente no Supabase Dashboard:\n\n' +
            '1. Acesse: Authentication > Users\n' +
            '2. Clique em "Add User" ou "Create User"\n' +
            '3. Preencha email e senha\n' +
            '4. Marque "Auto Confirm User"\n' +
            '5. Clique em "Create User"\n' +
            '6. Volte aqui e atualize o perfil na lista abaixo\n\n' +
            '💡 Depois de criar no Supabase, o usuário aparecerá na lista abaixo e você poderá ajustar o perfil (viewer/manager/admin).\n\n' +
            'Erro técnico: ' + authError.message
          );
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário criado mas não foi possível obter os dados.');
      }

      // Criar perfil na tabela profiles
      await this.supabase.createProfile(authData.user.id, email, role);

      this.success = 'Usuário criado com sucesso! O usuário pode fazer login imediatamente.';
      this.userForm.reset({ role: 'viewer' });
      this.showCreateForm = false;
      await this.loadProfiles();
    } catch (err: any) {
      this.error = 'Erro ao criar usuário: ' + (err.message || 'Erro desconhecido');
      console.error('Erro ao criar usuário:', err);
    } finally {
      this.creating = false;
    }
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.userForm.reset({ role: 'viewer' });
    this.error = null;
    this.success = null;
  }

  async updateRole(userId: string, event: any) {
    const newRole = event.target.value;
    this.error = null;
    this.success = null;

    try {
      await this.supabase.updateProfileRole(userId, newRole);
      this.success = 'Perfil atualizado com sucesso!';
      await this.loadProfiles();
      
      setTimeout(() => {
        this.success = null;
      }, 3000);
    } catch (err: any) {
      this.error = 'Erro ao atualizar perfil: ' + (err.message || 'Erro desconhecido');
      await this.loadProfiles(); // Recarregar para reverter visualmente
    }
  }

  async deleteUser(userId: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    this.error = null;
    this.success = null;

    try {
      // Excluir perfil primeiro
      const { error: profileError } = await this.supabase.client
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // ⚠️ IMPORTANTE: auth.admin.deleteUser() requer Service Role Key
      // Tentar excluir do Auth, mas não bloquear se falhar (perfil já foi excluído)
      try {
        const { error: authError } = await this.supabase.client.auth.admin.deleteUser(userId);
        
        if (authError) {
          // Se for erro de permissão, mostrar aviso mas não bloquear
          if (authError.message?.includes('permission') || authError.message?.includes('unauthorized')) {
            console.warn('Aviso: Não foi possível excluir o usuário do sistema de autenticação devido a permissões. ' +
                        'O perfil foi removido do sistema. Consulte docs/CONFIGURAR-GERENCIAMENTO-USUARIOS.md');
            this.success = 'Perfil excluído com sucesso! Nota: Exclusão do Auth requer configuração especial.';
          } else {
            console.warn('Erro ao excluir usuário do Auth:', authError);
            this.success = 'Perfil excluído com sucesso!';
          }
        } else {
          this.success = 'Usuário excluído com sucesso!';
        }
      } catch (authErr: any) {
        // Se falhar ao excluir do Auth, ainda assim considerar sucesso (perfil foi excluído)
        console.warn('Não foi possível excluir do Auth:', authErr);
        this.success = 'Perfil excluído com sucesso!';
      }

      await this.loadProfiles();
      
      setTimeout(() => {
        this.success = null;
      }, 5000); // Aumentar tempo para mensagens de aviso
    } catch (err: any) {
      this.error = 'Erro ao excluir usuário: ' + (err.message || 'Erro desconhecido');
      console.error('Erro ao excluir usuário:', err);
    }
  }

  isCurrentUser(userId: string): boolean {
    return userId === this.currentUserId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
}

