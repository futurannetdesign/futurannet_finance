import { Injectable, inject } from '@angular/core';
import { combineLatest, map, Observable, firstValueFrom } from 'rxjs';
import { AccountsReceivableService } from './accounts-receivable.service';
import { AccountsPayableService } from './accounts-payable.service';
import { CustomerService } from './customer.service';

export interface DashboardMetricBucket {
  amount: number;
  count: number;
}

export interface DashboardSummary {
  recebidas: DashboardMetricBucket;
  confirmadas: DashboardMetricBucket;
  aguardando: DashboardMetricBucket;
  vencidas: DashboardMetricBucket;
  balance: number;
  activeCustomers: number;
  statusCounts: {
    receivable: { verde: number; amarelo: number; vermelho: number };
    payable: { verde: number; amarelo: number; vermelho: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private recService = inject(AccountsReceivableService);
  private payService = inject(AccountsPayableService);
  private custService = inject(CustomerService);

  getSummary$(): Observable<DashboardSummary> {
    return combineLatest([
      this.recService.getAll$(),
      this.payService.getAll$(),
      this.custService.getCustomers$(true)
    ]).pipe(
      map(([receivables, payables, customers]) => {
        // Recebidas (Todas as pagas)
        const recebidasAccs = receivables.filter(r => r.paid_date);
        const recebidas: DashboardMetricBucket = {
          amount: recebidasAccs.reduce((sum, r) => sum + r.amount, 0),
          count: recebidasAccs.length
        };

        // Confirmadas (Pagas hoje)
        const today = new Date().toISOString().split('T')[0];
        const confirmadasAccs = receivables.filter(r => r.paid_date === today);
        const confirmadas: DashboardMetricBucket = {
          amount: confirmadasAccs.reduce((sum, r) => sum + r.amount, 0),
          count: confirmadasAccs.length
        };

        // Aguardando Pagamento (Não pagas e NÃO vencidas)
        const aguardandoAccs = receivables.filter(r => !r.paid_date && r.status !== 'vermelho');
        const aguardando: DashboardMetricBucket = {
          amount: aguardandoAccs.reduce((sum, r) => sum + r.amount, 0),
          count: aguardandoAccs.length
        };

        // Vencidas (Não pagas e vencidas)
        const vencidasAccs = receivables.filter(r => !r.paid_date && r.status === 'vermelho');
        const vencidas: DashboardMetricBucket = {
          amount: vencidasAccs.reduce((sum, r) => sum + r.amount, 0),
          count: vencidasAccs.length
        };

        const totalPaid = payables
          .filter(p => p.paid_date)
          .reduce((sum, p) => sum + p.amount, 0);

        const balance = recebidas.amount - totalPaid;
        const activeCustomers = customers.length;

        const receivableStatusCounts = {
          verde: receivables.filter(r => r.status === 'verde').length,
          amarelo: receivables.filter(r => r.status === 'amarelo').length,
          vermelho: receivables.filter(r => r.status === 'vermelho').length
        };

        const payableStatusCounts = {
          verde: payables.filter(p => p.status === 'verde').length,
          amarelo: payables.filter(p => p.status === 'amarelo').length,
          vermelho: payables.filter(p => p.status === 'vermelho').length
        };

        return {
          recebidas,
          confirmadas,
          aguardando,
          vencidas,
          balance,
          activeCustomers,
          statusCounts: {
            receivable: receivableStatusCounts,
            payable: payableStatusCounts
          }
        };
      })
    );
  }

  async getSummary(): Promise<DashboardSummary> {
    return firstValueFrom(this.getSummary$());
  }

  // Simplified for transition
  async getUpcomingAccounts() {
     const receivables = await this.recService.getAll();
     const payables = await this.payService.getAll();
     return {
       receivables: receivables.filter(r => r.status === 'amarelo' && !r.paid_date).slice(0, 10),
       payables: payables.filter(p => p.status === 'amarelo' && !p.paid_date).slice(0, 10)
     };
  }

  async getOverdueAccounts() {
    const receivables = await this.recService.getAll();
    const payables = await this.payService.getAll();
    return {
      receivables: receivables.filter(r => r.status === 'vermelho' && !r.paid_date).slice(0, 10),
      payables: payables.filter(p => p.status === 'vermelho' && !p.paid_date).slice(0, 10)
    };
 }
}
