import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Futurannet Finance</h1>
          <p>Faça login para continuar</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              class="form-control"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="seu@email.com">
            <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error-message">
              Email é obrigatório
            </div>
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              class="form-control"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              placeholder="••••••••">
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-message">
              Senha é obrigatória
            </div>
          </div>

          <div *ngIf="error" class="alert alert-error">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block"
            [disabled]="loginForm.invalid">
            Entrar
          </button>
        </form>

        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>Entrando...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    @media (max-width: 768px) {
      .login-container {
        padding: 15px;
        align-items: flex-start;
        padding-top: 40px;
      }

      .login-card {
        padding: 30px 25px;
        max-width: 100%;
      }
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 10px;
        padding-top: 30px;
      }

      .login-card {
        padding: 25px 20px;
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h1 {
      color: #667eea;
      margin: 0 0 10px 0;
      font-size: 28px;
    }

    .login-header p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .login-header h1 {
        font-size: 24px;
      }

      .login-header p {
        font-size: 13px;
      }
    }

    @media (max-width: 480px) {
      .login-header h1 {
        font-size: 20px;
      }

      .login-header {
        margin-bottom: 25px;
      }
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .btn-block {
      width: 100%;
    }

    .loading {
      text-align: center;
      padding: 40px 0;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .alert-error {
      background-color: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit() {
    // Aguardar inicialização da autenticação
    await this.authService.waitForAuthInit();
    
    // Se já estiver autenticado, redireciona (isAuthenticated agora é async)
    const isAuthenticated = await this.authService.isAuthenticated();
    if (isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      await this.authService.signIn(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Erro ao fazer login. Verifique suas credenciais.';
      console.error('Erro no login:', err);
    } finally {
      this.loading = false;
    }
  }
}

