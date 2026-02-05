import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      <!-- Desktop Sidebar -->
      <aside class="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-40">
        <div class="p-8">
          <h1 class="text-xl font-extrabold tracking-tighter font-display">
            FUTURANNET <span class="text-emerald-500 font-medium">FINANCE</span>
          </h1>
        </div>

        <nav class="flex-1 px-4 space-y-2 mt-4">
          <a routerLink="/dashboard" routerLinkActive="bg-slate-800 text-emerald-400 border-l-4 border-emerald-500" 
            class="flex items-center px-4 py-3 text-sm font-medium transition-all hover:bg-slate-800 group">
            <span class="material-icons-outlined mr-4 text-slate-500 group-hover:text-white">dashboard</span>
            Dashboard
          </a>
          <a routerLink="/customers" routerLinkActive="bg-slate-800 text-emerald-400 border-l-4 border-emerald-500" 
            class="flex items-center px-4 py-3 text-sm font-medium transition-all hover:bg-slate-800 group">
            <span class="material-icons-outlined mr-4 text-slate-500 group-hover:text-white">groups</span>
            Clientes
          </a>
          <a routerLink="/accounts-receivable" routerLinkActive="bg-slate-800 text-emerald-400 border-l-4 border-emerald-500" 
            class="flex items-center px-4 py-3 text-sm font-medium transition-all hover:bg-slate-800 group">
            <span class="material-icons-outlined mr-4 text-slate-500 group-hover:text-white">trending_up</span>
            A Receber
          </a>
          <a routerLink="/accounts-payable" routerLinkActive="bg-slate-800 text-emerald-400 border-l-4 border-emerald-500" 
            class="flex items-center px-4 py-3 text-sm font-medium transition-all hover:bg-slate-800 group">
            <span class="material-icons-outlined mr-4 text-slate-500 group-hover:text-white">trending_down</span>
            A Pagar
          </a>
          
          <div *ngIf="auth.isAdmin()" class="pt-6 mt-6 border-t border-slate-800">
            <span class="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">Administrativo</span>
             <a routerLink="/users" routerLinkActive="bg-slate-800 text-emerald-400 border-l-4 border-emerald-500" 
                class="flex items-center px-4 py-3 text-sm font-medium transition-all hover:bg-slate-800 group">
                <span class="material-icons-outlined mr-4 text-slate-500 group-hover:text-white">manage_accounts</span>
                Usuários
             </a>
             <a routerLink="/audit" routerLinkActive="bg-slate-800 text-emerald-400 border-l-4 border-emerald-500" 
                class="flex items-center px-4 py-3 text-sm font-medium transition-all hover:bg-slate-800 group">
                <span class="material-icons-outlined mr-4 text-slate-500 group-hover:text-white">list_alt</span>
                Auditoria
             </a>
          </div>
        </nav>

        <div class="p-6 border-t border-slate-800 bg-slate-900/50">
          <button (click)="auth.logout()" class="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95">
            <span class="material-icons-outlined mr-4">logout</span>
            Encerrar Sessão
          </button>
        </div>
      </aside>

      <!-- Main Content Container -->
      <main class="flex-1 md:pl-64 min-h-screen pb-20 md:pb-0 relative">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Navbar (Bottom) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50">
        <a routerLink="/dashboard" routerLinkActive="text-emerald-600 border-t-2 border-emerald-600 shadow-[0_-4px_0_0_rgba(16,185,129,0.1)]" 
          class="flex flex-col items-center justify-center w-full h-full text-slate-400 transition-all">
          <span class="material-icons-outlined text-xl">dashboard</span>
          <span class="text-[9px] font-bold uppercase mt-1 tracking-tighter">Início</span>
        </a>
        <a routerLink="/accounts-receivable" routerLinkActive="text-emerald-600 border-t-2 border-emerald-600 shadow-[0_-4px_0_0_rgba(16,185,129,0.1)]" 
          class="flex flex-col items-center justify-center w-full h-full text-slate-400 transition-all">
          <span class="material-icons-outlined text-xl">payments</span>
          <span class="text-[9px] font-bold uppercase mt-1 tracking-tighter">Receitas</span>
        </a>
        <a routerLink="/accounts-payable" routerLinkActive="text-emerald-600 border-t-2 border-emerald-600 shadow-[0_-4px_0_0_rgba(16,185,129,0.1)]" 
          class="flex flex-col items-center justify-center w-full h-full text-slate-400 transition-all">
          <span class="material-icons-outlined text-xl">receipt_long</span>
          <span class="text-[9px] font-bold uppercase mt-1 tracking-tighter">Despesas</span>
        </a>
        <a routerLink="/customers" routerLinkActive="text-emerald-600 border-t-2 border-emerald-600 shadow-[0_-4px_0_0_rgba(16,185,129,0.1)]" 
          class="flex flex-col items-center justify-center w-full h-full text-slate-400 transition-all">
          <span class="material-icons-outlined text-xl">people</span>
          <span class="text-[9px] font-bold uppercase mt-1 tracking-tighter">Clientes</span>
        </a>
        <button (click)="auth.logout()" class="flex flex-col items-center justify-center w-full h-full text-slate-400 active:scale-90 transition-transform">
          <span class="material-icons-outlined text-xl font-bold">logout</span>
          <span class="text-[9px] font-bold uppercase mt-1 tracking-tighter">Sair</span>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .font-display { font-family: 'Montserrat', sans-serif; }
  `]
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);

  ngOnInit() {
    console.log('AppComponent initialized with Firebase Auth');
  }
}
