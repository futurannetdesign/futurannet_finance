import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen pb-24 md:pb-6 font-sans text-[#334155] animate-fade-in">
      
      <main class="max-w-7xl mx-auto space-y-8 mt-4">
        
        <!-- Welcome Section -->
        <div>
          <h1 class="text-2xl font-bold text-[#001E3C] tracking-tight">Olá, {{ userName() }}</h1>
        </div>

        <!-- Charging Situation Header -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-lg font-bold text-slate-700">Situação das cobranças</h2>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 text-xs text-slate-500 mr-4">
              <div class="w-8 h-4 bg-slate-200 rounded-full relative">
                <div class="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full transition-all"></div>
              </div>
              <span>Versão gráfico</span>
            </div>
            <button class="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <span class="material-icons-outlined text-sm">calendar_today</span>
              Este mês
              <span class="material-icons-outlined text-sm">expand_more</span>
            </button>
            <button class="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <span class="material-icons-outlined text-sm">tune</span>
              Filtros
              <span class="material-icons-outlined text-sm">expand_more</span>
            </button>
          </div>
        </div>

        <!-- Metric Cards Grid -->
        <div *ngIf="metrics$ | async as metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Recebidas -->
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-56 transition-all hover:shadow-md cursor-default group">
            <div class="flex justify-between items-start">
              <span class="text-sm font-semibold text-slate-600">Recebidas</span>
              <span class="material-icons-outlined text-slate-300 text-sm cursor-help">info</span>
            </div>
            <div class="mt-4 flex flex-col">
              <span class="text-2xl font-black text-[#00A868] tracking-tight">R$ {{ metrics.recebidas.amount | number:'1.2-2' }}</span>
              <span class="text-[10px] text-slate-400 font-medium">R$ {{ metrics.recebidas.amount * 0.97 | number:'1.2-2' }} líquido</span>
            </div>
            <div class="mt-auto pt-6 space-y-4">
              <!-- Progress Bar -->
              <div class="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <div class="h-full bg-[#00A868] w-full"></div>
              </div>
              <!-- Stats Links -->
              <div class="flex flex-col gap-1.5">
                <a routerLink="/customers" class="flex items-center justify-between text-xs text-[#00A868] font-semibold group-hover:translate-x-1 transition-transform">
                  <div class="flex items-center gap-2">
                    <span class="material-icons-outlined text-sm">people_outline</span>
                    <span>{{ metrics.recebidas.count }} {{ metrics.recebidas.count === 1 ? 'cliente' : 'clientes' }}</span>
                  </div>
                  <span class="material-icons-outlined text-sm">chevron_right</span>
                </a>
                <a routerLink="/accounts-receivable" class="flex items-center justify-between text-xs text-[#00A868] font-semibold group-hover:translate-x-1 transition-transform">
                  <div class="flex items-center gap-2">
                    <span class="material-icons-outlined text-sm">receipt_long</span>
                    <span>{{ metrics.recebidas.count }} {{ metrics.recebidas.count === 1 ? 'cobrança' : 'cobranças' }}</span>
                  </div>
                  <span class="material-icons-outlined text-sm">chevron_right</span>
                </a>
              </div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-56 transition-all hover:shadow-md cursor-default group">
            <div class="flex justify-between items-start">
              <span class="text-sm font-semibold text-slate-600">Confirmadas</span>
              <span class="material-icons-outlined text-slate-300 text-sm">info</span>
            </div>
            <div class="mt-4 flex flex-col">
               <span class="text-2xl font-black text-[#6366F1] tracking-tight">R$ {{ metrics.confirmadas.amount | number:'1.2-2' }}</span>
               <span class="text-[10px] text-slate-400 font-medium">R$ {{ metrics.confirmadas.amount * 0.97 | number:'1.2-2' }} líquido</span>
            </div>
            <div class="mt-auto pt-6 space-y-4">
               <div class="h-2 w-full bg-indigo-50 relative overflow-hidden rounded-full">
                  <div class="absolute inset-0 striped-bg w-full"></div>
               </div>
               <div class="flex flex-col gap-1.5">
                  <a routerLink="/accounts-receivable" class="flex items-center justify-between text-xs text-[#6366F1] font-semibold group-hover:translate-x-1 transition-transform">
                    <div class="flex items-center gap-2">
                      <span class="material-icons-outlined text-sm">person_outline</span>
                      <span>{{ metrics.confirmadas.count }} {{ metrics.confirmadas.count === 1 ? 'cliente' : 'clientes' }}</span>
                    </div>
                    <span class="material-icons-outlined text-sm">chevron_right</span>
                  </a>
                  <a routerLink="/accounts-receivable" class="flex items-center justify-between text-xs text-[#6366F1] font-semibold group-hover:translate-x-1 transition-transform">
                    <div class="flex items-center gap-2">
                       <span class="material-icons-outlined text-sm">credit_card</span>
                       <span>{{ metrics.confirmadas.count }} {{ metrics.confirmadas.count === 1 ? 'cobrança' : 'cobranças' }}</span>
                    </div>
                    <span class="material-icons-outlined text-sm">chevron_right</span>
                  </a>
               </div>
            </div>
          </div>

          <!-- Aguardando pagamento -->
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-56 transition-all hover:shadow-md cursor-default group">
            <div class="flex justify-between items-start">
              <span class="text-sm font-semibold text-slate-600">Aguardando pag...</span>
              <span class="material-icons-outlined text-slate-300 text-sm cursor-help">info</span>
            </div>
            <div class="mt-4 flex flex-col">
              <span class="text-2xl font-black text-[#F47500] tracking-tight">R$ {{ metrics.aguardando.amount | number:'1.2-2' }}</span>
              <span class="text-[10px] text-slate-400 font-medium">R$ {{ metrics.aguardando.amount * 0.97 | number:'1.2-2' }} líquido</span>
            </div>
            <div class="mt-auto pt-6 space-y-4">
              <div class="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <div class="h-full bg-[#F47500] w-full"></div>
              </div>
              <div class="flex flex-col gap-1.5">
                <a routerLink="/customers" class="flex items-center justify-between text-xs text-[#F47500] font-semibold group-hover:translate-x-1 transition-transform">
                  <div class="flex items-center gap-2">
                    <span class="material-icons-outlined text-sm">people_outline</span>
                    <span>{{ metrics.aguardando.count }} {{ metrics.aguardando.count === 1 ? 'cliente' : 'clientes' }}</span>
                  </div>
                  <span class="material-icons-outlined text-sm">chevron_right</span>
                </a>
                <a routerLink="/accounts-receivable" class="flex items-center justify-between text-xs text-[#F47500] font-semibold group-hover:translate-x-1 transition-transform">
                  <div class="flex items-center gap-2">
                    <span class="material-icons-outlined text-sm">receipt_long</span>
                    <span>{{ metrics.aguardando.count }} {{ metrics.aguardando.count === 1 ? 'cobrança' : 'cobranças' }}</span>
                  </div>
                  <span class="material-icons-outlined text-sm">chevron_right</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Vencidas -->
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-56 transition-all hover:shadow-md cursor-default group">
            <div class="flex justify-between items-start">
              <span class="text-sm font-semibold text-slate-600">Vencidas</span>
              <span class="material-icons-outlined text-slate-300 text-sm cursor-help">info</span>
            </div>
            <div class="mt-4 flex flex-col">
              <span class="text-2xl font-black text-[#E11D48] tracking-tight">R$ {{ metrics.vencidas.amount | number:'1.2-2' }}</span>
              <span class="text-[10px] text-slate-400 font-medium">R$ {{ metrics.vencidas.amount * 0.97 | number:'1.2-2' }} líquido</span>
            </div>
            <div class="mt-auto pt-6 space-y-4">
              <div class="h-2 w-full bg-rose-50 relative overflow-hidden rounded-full">
                <div class="absolute inset-0 striped-bg-red w-full"></div>
              </div>
              <div class="flex flex-col gap-1.5">
                <a routerLink="/customers" class="flex items-center justify-between text-xs text-[#E11D48] font-semibold group-hover:translate-x-1 transition-transform">
                  <div class="flex items-center gap-2">
                    <span class="material-icons-outlined text-sm">people_outline</span>
                    <span>{{ metrics.vencidas.count }} {{ metrics.vencidas.count === 1 ? 'cliente' : 'clientes' }}</span>
                  </div>
                  <span class="material-icons-outlined text-sm">chevron_right</span>
                </a>
                <a routerLink="/accounts-receivable" class="flex items-center justify-between text-xs text-[#E11D48] font-semibold group-hover:translate-x-1 transition-transform">
                  <div class="flex items-center gap-2">
                    <span class="material-icons-outlined text-sm">receipt_long</span>
                    <span>{{ metrics.vencidas.count }} {{ metrics.vencidas.count === 1 ? 'cobrança' : 'cobranças' }}</span>
                  </div>
                  <span class="material-icons-outlined text-sm">chevron_right</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        <!-- Float Action Buttons for Speed -->
        <div class="fixed bottom-24 right-6 md:bottom-8 flex flex-col gap-3 group z-40">
           <button routerLink="/customers/new" class="w-12 h-12 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:scale-110 active:scale-95 transition-all">
             <span class="material-icons-outlined">person_add</span>
           </button>
           <button routerLink="/accounts-receivable/new" class="w-14 h-14 bg-[#00A868] rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all">
             <span class="material-icons-outlined text-2xl">add</span>
           </button>
        </div>

      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .striped-bg {
      background: repeating-linear-gradient(
        45deg,
        #E0E7FF,
        #E0E7FF 10px,
        #C7D2FE 10px,
        #C7D2FE 20px
      );
      opacity: 1;
    }

    .striped-bg-red {
      background: repeating-linear-gradient(
        45deg,
        #FFE4E6,
        #FFE4E6 10px,
        #FECDD3 10px,
        #FECDD3 20px
      );
      opacity: 1;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  
  metrics$: Observable<DashboardSummary> = this.dashboardService.getSummary$();
  
  userName = computed(() => this.authService.currentProfile()?.email?.split('@')[0] || 'Usuário');
  userInitial = computed(() => this.userName().charAt(0).toUpperCase());

  ngOnInit() {}
}
