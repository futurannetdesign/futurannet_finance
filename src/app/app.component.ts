import { Component, OnInit, inject, computed } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="min-h-screen bg-[#F0F2F5] flex flex-col md:flex-row font-sans text-[#334155]">
      
      <!-- Lado Esquerdo: Sidebar Asaas (Deep Navy) -->
      <aside class="hidden md:flex flex-col w-56 bg-[#001E3C] text-white fixed h-full z-50">
        <div class="px-6 py-8">
          <div class="flex items-center gap-2 mb-8">
            <span class="text-2xl font-black tracking-tighter text-white">AS<span class="text-[#00A868] italic underline transition-all">X</span>AS</span>
          </div>

          <button routerLink="/accounts-receivable/new" 
            class="w-full bg-[#0040D2] hover:bg-[#0036B2] text-white py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-between transition-all active:scale-95 shadow-lg group">
            <span>Criar cobrança</span>
            <span class="material-icons-outlined text-sm group-hover:rotate-180 transition-transform">expand_more</span>
          </button>
        </div>

        <nav class="flex-1 px-2 space-y-0.5 mt-2">
          <a routerLink="/dashboard" routerLinkActive="bg-[#103154] border-l-4 border-[#00A868] text-white" 
            class="flex items-center px-4 py-3 text-[13px] font-semibold text-slate-300 transition-all hover:bg-[#103154]/50 group">
            <span class="material-icons-outlined mr-3 text-lg opacity-60 group-hover:opacity-100">home</span>
            Início
          </a>
          
          <div class="py-2 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-4">Gestão</div>
          
          <a routerLink="/customers" routerLinkActive="bg-[#103154] border-l-4 border-[#00A868] text-white" 
            class="flex items-center px-4 py-3 text-[13px] font-semibold text-slate-300 transition-all hover:bg-[#103154]/50 group">
            <span class="material-icons-outlined mr-3 text-lg opacity-60 group-hover:opacity-100">person_search</span>
            Meus Clientes
          </a>
          
          <a routerLink="/accounts-receivable" routerLinkActive="bg-[#103154] border-l-4 border-[#00A868] text-white" 
            class="flex items-center px-4 py-3 text-[13px] font-semibold text-slate-300 transition-all hover:bg-[#103154]/50 group">
            <span class="material-icons-outlined mr-3 text-lg opacity-60 group-hover:opacity-100">receipt_long</span>
            Cobranças
          </a>

          <a routerLink="/accounts-payable" routerLinkActive="bg-[#103154] border-l-4 border-[#00A868] text-white" 
            class="flex items-center px-4 py-3 text-[13px] font-semibold text-slate-300 transition-all hover:bg-[#103154]/50 group">
            <span class="material-icons-outlined mr-3 text-lg opacity-60 group-hover:opacity-100">payments</span>
            Pagamentos
          </a>

          <div *ngIf="auth.isAdmin()" class="pt-6 mt-4 border-t border-slate-800/50">
             <div class="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sistema</div>
             <a routerLink="/users" routerLinkActive="bg-[#103154] border-l-4 border-[#00A868] text-white" 
                class="flex items-center px-4 py-3 text-[13px] font-semibold text-slate-300 transition-all hover:bg-[#103154]/50 group">
                <span class="material-icons-outlined mr-3 text-lg opacity-60 group-hover:opacity-100">manage_accounts</span>
                Usuários
             </a>
             <a routerLink="/audit" routerLinkActive="bg-[#103154] border-l-4 border-[#00A868] text-white" 
                class="flex items-center px-4 py-3 text-[13px] font-semibold text-slate-300 transition-all hover:bg-[#103154]/50 group">
                <span class="material-icons-outlined mr-3 text-lg opacity-60 group-hover:opacity-100">history</span>
                Auditoria
             </a>
          </div>
        </nav>

        <div class="p-4 border-t border-slate-800/50">
          <button (click)="auth.logout()" class="flex items-center w-full px-4 py-2 text-[13px] text-slate-400 hover:text-white transition-all">
            <span class="material-icons-outlined mr-3">logout</span>
            Sair
          </button>
        </div>
      </aside>

      <!-- Área de Conteúdo à Direita -->
      <div class="flex-1 md:ml-56 flex flex-col min-h-screen">
        
        <!-- Top Balance Bar Asaas (Sticky) -->
        <header class="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-40 transition-all">
          <div class="flex items-center gap-6">
             <!-- Mobile Menu Toggle -->
             <button class="md:hidden p-2 text-slate-400"><span class="material-icons-outlined">menu</span></button>
             
             <div class="flex flex-col">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo em conta</span>
                <div class="flex items-center gap-2">
                   <span class="text-lg font-black text-[#00A868]">R$ {{ (summary$ | async)?.balance | number:'1.2-2' }}</span>
                   <span class="material-icons-outlined text-slate-300 text-sm cursor-pointer hover:text-slate-400">visibility</span>
                </div>
             </div>
          </div>

          <div class="flex items-center gap-5">
             <button class="text-slate-400 hover:text-slate-600 relative">
                <span class="material-icons-outlined">notifications</span>
                <span class="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
             <div class="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div class="flex flex-col items-end hidden sm:flex">
                   <span class="text-[12px] font-bold text-slate-700 leading-none">{{ userEmail }}</span>
                   <span class="text-[10px] text-slate-400">{{ (auth.currentProfile())?.role || 'Membro' }}</span>
                </div>
                <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-[#001E3C] font-black group cursor-pointer hover:bg-slate-200 transition-colors">
                   {{ userInitial }}
                </div>
             </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <main class="flex-1 p-6 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Navbar (Bottom) - Only for Mobile -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50">
        <a routerLink="/dashboard" routerLinkActive="text-[#0040D2]" class="flex flex-col items-center">
          <span class="material-icons-outlined">home</span>
          <span class="text-[10px] font-bold">Início</span>
        </a>
        <a routerLink="/customers" routerLinkActive="text-[#0040D2]" class="flex flex-col items-center">
          <span class="material-icons-outlined">person_search</span>
          <span class="text-[10px] font-bold">Clientes</span>
        </a>
        <a routerLink="/accounts-receivable" routerLinkActive="text-[#0040D2]" class="flex flex-col items-center">
          <span class="material-icons-outlined">receipt_long</span>
          <span class="text-[10px] font-bold">Cobranças</span>
        </a>
        <button (click)="auth.logout()" class="flex flex-col items-center">
          <span class="material-icons-outlined">logout</span>
          <span class="text-[10px] font-bold">Sair</span>
        </button>
      </nav>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .router-link-active { 
      background-color: #103154 !important; 
      border-left-width: 4px;
      border-color: #00A868;
      color: white !important;
    }
  `]
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  dashboardService = inject(DashboardService);

  summary$ = this.dashboardService.getSummary$();
  
  userEmail = computed(() => this.auth.currentUser()?.email || 'usuário@exemplo.com');
  userInitial = computed(() => this.userEmail().charAt(0).toUpperCase());

  ngOnInit() {
    console.log('AppComponent initialized with Asaas 2.0 Layout');
  }
}
