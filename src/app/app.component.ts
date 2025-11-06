import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { LogService } from './services/log.service';
import { Profile } from './models/customer.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-top">
          <div class="header-left">
            <h1>Futurannet Finance</h1>
            <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
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
        </div>
        <nav class="main-nav" [class.mobile-open]="mobileMenuOpen">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMobileMenu()">Dashboard</a>
          <a routerLink="/customers" routerLinkActive="active" (click)="closeMobileMenu()">Clientes</a>
          <a routerLink="/accounts-receivable" routerLinkActive="active" (click)="closeMobileMenu()">Contas a Receber</a>
          <a routerLink="/accounts-payable" routerLinkActive="active" (click)="closeMobileMenu()">Contas a Pagar</a>
          <a *ngIf="isAdminUser" routerLink="/users" routerLinkActive="active" (click)="closeMobileMenu()">Usuários</a>
          <a *ngIf="isAdminUser" routerLink="/audit-log" routerLinkActive="active" (click)="closeMobileMenu()">Auditoria</a>
        </nav>
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

    .app-container > * {
      flex-shrink: 0;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      gap: 20px;
    }

    .header-left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .app-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 5px;
      width: 30px;
      height: 30px;
      justify-content: center;
    }

    .mobile-menu-toggle span {
      display: block;
      width: 100%;
      height: 3px;
      background: white;
      border-radius: 2px;
      transition: all 0.3s;
    }

    .main-nav {
      display: flex;
      gap: 10px;
      padding: 0 20px 15px 20px;
      flex-wrap: wrap;
    }

    .main-nav a {
      color: white;
      text-decoration: none;
      padding: 10px 16px;
      border-radius: 6px;
      transition: background-color 0.2s;
      font-size: 14px;
      white-space: nowrap;
    }

    .main-nav a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .main-nav a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }

    .user-role {
      font-size: 11px;
      opacity: 0.9;
    }

    .btn-logout {
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.2s;
      white-space: nowrap;
    }

    .btn-logout:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .btn-logout:active {
      transform: scale(0.95);
    }

    .datetime-display {
      text-align: right;
      padding: 8px 12px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      min-width: 150px;
    }

    .date {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 4px;
      white-space: nowrap;
    }

    .time {
      font-size: 18px;
      font-weight: 700;
      font-family: 'Courier New', monospace;
    }

    .main-content {
      flex: 1 0 auto;
      padding: 15px;
      padding-bottom: 100px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .main-content .container {
      flex: 1;
    }


    .app-footer {
      background-color: #2d3748;
      color: white;
      padding: 20px;
      margin-top: 40px;
      width: 100%;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
      height: auto;
      min-height: 120px;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .footer-section h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #a0aec0;
    }

    .footer-section p {
      margin: 4px 0;
      font-size: 12px;
      color: #cbd5e0;
    }

    .social-links {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .social-links a {
      color: #cbd5e0;
      text-decoration: none;
      font-size: 12px;
      transition: color 0.2s;
    }

    .social-links a:hover {
      color: #667eea;
    }

    /* Tablet */
    @media (max-width: 1024px) {
      .app-header h1 {
        font-size: 20px;
      }

      .main-nav {
        gap: 8px;
      }

      .main-nav a {
        padding: 8px 12px;
        font-size: 13px;
      }

      .datetime-display {
        min-width: 140px;
      }

      .date {
        font-size: 11px;
      }

      .time {
        font-size: 16px;
      }
    }

    /* Mobile */
    @media (max-width: 768px) {
      .header-top {
        padding: 12px 15px;
      }

      .app-header h1 {
        font-size: 18px;
      }

      .mobile-menu-toggle {
        display: flex;
      }

      .main-nav {
        display: none;
        flex-direction: column;
        padding: 0 15px 15px 15px;
        gap: 5px;
        background-color: rgba(0, 0, 0, 0.1);
        margin-top: 10px;
      }

      .main-nav.mobile-open {
        display: flex;
      }

      .main-nav a {
        width: 100%;
        padding: 12px 15px;
        text-align: left;
        border-radius: 6px;
      }

      .header-right {
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        width: auto;
      }

      .user-info {
        flex-direction: row;
        align-items: center;
        padding: 6px 10px;
        width: 100%;
        max-width: 200px;
      }

      .user-name {
        max-width: 120px;
        font-size: 12px;
      }

      .user-role {
        font-size: 10px;
      }

      .btn-logout {
        padding: 5px 10px;
        font-size: 12px;
        margin-left: auto;
      }

      .datetime-display {
        min-width: auto;
        width: 100%;
        text-align: center;
        padding: 6px 10px;
      }

      .date {
        font-size: 10px;
      }

      .time {
        font-size: 14px;
      }

      .main-content {
        padding: 10px;
        padding-bottom: 80px;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }

    /* Mobile pequeno */
    @media (max-width: 480px) {
      .header-top {
        padding: 10px 12px;
      }

      .app-header h1 {
        font-size: 16px;
      }

      .user-info {
        max-width: 100%;
        flex-wrap: wrap;
      }

      .user-name {
        max-width: 100px;
      }

      .datetime-display {
        width: 100%;
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
  mobileMenuOpen = false;
  private timeInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private logService: LogService
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
      this.logService.log('Perfil atualizado:', profile);
      this.logService.log('É admin?', this.isAdminUser);
    });

    // Subscrever ao role atual
    this.authService.currentRole$.subscribe(role => {
      this.isAdminUser = role === 'admin';
      this.logService.log('Role atualizado:', role);
      this.logService.log('É admin?', this.isAdminUser);
    });

    // Verificar se está na página de login
    this.checkLoginPage();
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLoginPage();
      });
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  checkLoginPage() {
    const url = this.router.url;
    this.isLoginPage = url === '/login' || url.startsWith('/login');
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

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
