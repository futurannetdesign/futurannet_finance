import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Profile } from './models/customer.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="app-container">
      <header *ngIf="!isLoginPage" class="app-header">
        <div class="header-left">
          <h1>Futurannet Finance</h1>
          <nav>
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/customers" routerLinkActive="active">Clientes</a>
            <a routerLink="/accounts-receivable" routerLinkActive="active">Contas a Receber</a>
            <a routerLink="/accounts-payable" routerLinkActive="active">Contas a Pagar</a>
            <a *ngIf="isAdminUser" routerLink="/users" routerLinkActive="active">Usuários</a>
            <a *ngIf="isAdminUser" routerLink="/audit-log" routerLinkActive="active">Auditoria</a>
          </nav>
        </div>
        <div class="header-right">
          <div class="user-info" *ngIf="currentProfile">
            <div class="user-details">
              <span class="user-name">{{ currentProfile.email }}</span>
              <span class="user-role">{{ getRoleLabel(currentProfile.role) }}</span>
            </div>
            <button class="btn-logout" (click)="logout()" title="Sair">
              Sair
            </button>
          </div>
          <div class="datetime-display">
            <div class="date">{{ currentDate }}</div>
            <div class="time">{{ currentTime }}</div>
          </div>
        </div>
      </header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <footer *ngIf="!isLoginPage" class="app-footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Futurannet Finance</h4>
            <p>Sistema de gestão financeira</p>
          </div>
          <div class="footer-section">
            <h4>Contato</h4>
            <p>Telefone: (00) 0000-0000</p>
            <p>Email: contato&#64;futurannet.com.br</p>
          </div>
          <div class="footer-section">
            <h4>Redes Sociais</h4>
            <div class="social-links">
              <a href="#" target="_blank" title="Instagram">Instagram</a>
              <a href="#" target="_blank" title="Facebook">Facebook</a>
              <a href="#" target="_blank" title="WhatsApp">WhatsApp</a>
            </div>
          </div>
          <div class="footer-section">
            <h4>Versão</h4>
            <p>v1.0.0</p>
            <p>&copy; 2024 Futurannet</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }

    .header-left {
      flex: 1;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .app-header h1 {
      margin: 0 0 15px 0;
      font-size: 24px;
    }

    nav {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    nav a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    nav a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    nav a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 8px 16px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
    }

    .user-role {
      font-size: 12px;
      opacity: 0.9;
    }

    .btn-logout {
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .btn-logout:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .datetime-display {
      text-align: right;
      padding: 8px 16px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      min-width: 200px;
    }

    .date {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .time {
      font-size: 20px;
      font-weight: 700;
      font-family: 'Courier New', monospace;
    }

    .main-content {
      flex: 1;
      padding: 20px;
      min-height: calc(100vh - 200px);
    }

    .app-footer {
      background-color: #2d3748;
      color: white;
      padding: 30px 20px;
      margin-top: auto;
      width: 100%;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }

    .footer-section h4 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 600;
      color: #a0aec0;
    }

    .footer-section p {
      margin: 8px 0;
      font-size: 14px;
      color: #cbd5e0;
    }

    .social-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .social-links a {
      color: #cbd5e0;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .social-links a:hover {
      color: #667eea;
    }

    @media (max-width: 768px) {
      .app-header {
        flex-direction: column;
      }

      .header-right {
        width: 100%;
        justify-content: space-between;
      }

      .datetime-display {
        min-width: auto;
      }

      .user-info {
        flex-direction: column;
        align-items: flex-start;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Futurannet Finance';
  currentDate = '';
  currentTime = '';
  currentProfile: Profile | null = null;
  isLoginPage = false;
  isAdminUser = false;
  private timeInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.updateDateTime();
    this.timeInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);

    // Subscrever ao perfil atual
    this.authService.currentProfile$.subscribe(profile => {
      this.currentProfile = profile;
      this.isAdminUser = profile?.role === 'admin';
      console.log('Perfil atualizado:', profile);
      console.log('É admin?', this.isAdminUser);
    });

    // Subscrever ao role atual
    this.authService.currentRole$.subscribe(role => {
      this.isAdminUser = role === 'admin';
      console.log('Role atualizado:', role);
      console.log('É admin?', this.isAdminUser);
    });

    // Verificar se está na página de login
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.url === '/login' || event.urlAfterRedirects === '/login';
      });

    // Verificar rota inicial
    this.isLoginPage = this.router.url === '/login';
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  updateDateTime() {
    const now = new Date();
    
    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const dayOfWeek = daysOfWeek[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    this.currentDate = `${dayOfWeek}, ${day} de ${month} de ${year}`;
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'viewer': 'Visualizador'
    };
    return labels[role] || role;
  }

  isAdmin(): boolean {
    return this.isAdminUser || this.authService.isAdmin();
  }

  async logout() {
    await this.authService.signOut();
  }
}
