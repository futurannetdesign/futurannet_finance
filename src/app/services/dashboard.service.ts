import { Injectable } from '@angular/core';
import { AccountsReceivableService } from './accounts-receivable.service';
import { AccountsPayableService } from './accounts-payable.service';
import { CustomerService } from './customer.service';

export interface DashboardSummary {
  totalReceivable: number;
  totalPayable: number;
  balance: number;
  activeCustomers: number;
  overdueReceivable: number;
  overduePayable: number;
  upcomingReceivable: number;
  upcomingPayable: number;
  statusCounts: {
    receivable: { verde: number; amarelo: number; vermelho: number };
    payable: { verde: number; amarelo: number; vermelho: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private accountsReceivableService: AccountsReceivableService,
    private accountsPayableService: AccountsPayableService,
    private customerService: CustomerService
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    try {
      const [receivables, payables, customers] = await Promise.all([
        this.accountsReceivableService.getAll(),
        this.accountsPayableService.getAll(),
        this.customerService.getAll()
      ]);

      // Calcular totais
      const totalReceivable = receivables
        .filter(r => !r.paid_date)
        .reduce((sum, r) => sum + r.amount, 0);

      const totalPayable = payables
        .filter(p => !p.paid_date)
        .reduce((sum, p) => sum + p.amount, 0);

      const balance = totalReceivable - totalPayable;

      // Contar clientes ativos
      const activeCustomers = customers.filter(c => c.is_active).length;

      // Contar vencidas
      const overdueReceivable = receivables.filter(r => r.status === 'vermelho' && !r.paid_date).length;
      const overduePayable = payables.filter(p => p.status === 'vermelho' && !p.paid_date).length;

      // Contar próximas do vencimento (amarelo)
      const upcomingReceivable = receivables.filter(r => r.status === 'amarelo' && !r.paid_date).length;
      const upcomingPayable = payables.filter(p => p.status === 'amarelo' && !p.paid_date).length;

      // Contar por status
      const receivableStatusCounts = {
        verde: receivables.filter(r => r.status === 'verde' && r.paid_date).length,
        amarelo: receivables.filter(r => r.status === 'amarelo' && !r.paid_date).length,
        vermelho: receivables.filter(r => r.status === 'vermelho' && !r.paid_date).length
      };

      const payableStatusCounts = {
        verde: payables.filter(p => p.status === 'verde' && p.paid_date).length,
        amarelo: payables.filter(p => p.status === 'amarelo' && !p.paid_date).length,
        vermelho: payables.filter(p => p.status === 'vermelho' && !p.paid_date).length
      };

      return {
        totalReceivable,
        totalPayable,
        balance,
        activeCustomers,
        overdueReceivable,
        overduePayable,
        upcomingReceivable,
        upcomingPayable,
        statusCounts: {
          receivable: receivableStatusCounts,
          payable: payableStatusCounts
        }
      };
    } catch (err: any) {
      console.error('Erro ao calcular resumo do dashboard:', err);
      throw err;
    }
  }

  async getUpcomingAccounts(days: number = 5) {
    try {
      const [receivables, payables] = await Promise.all([
        this.accountsReceivableService.getAll(),
        this.accountsPayableService.getAll()
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const limitDate = new Date(today);
      limitDate.setDate(limitDate.getDate() + days);

      const upcomingReceivables = receivables
        .filter(r => {
          if (r.paid_date) return false;
          const due = new Date(r.due_date);
          due.setHours(0, 0, 0, 0);
          return due >= today && due <= limitDate;
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 10);

      const upcomingPayables = payables
        .filter(p => {
          if (p.paid_date) return false;
          const due = new Date(p.due_date);
          due.setHours(0, 0, 0, 0);
          return due >= today && due <= limitDate;
        })
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 10);

      return {
        receivables: upcomingReceivables,
        payables: upcomingPayables
      };
    } catch (err: any) {
      console.error('Erro ao buscar contas próximas:', err);
      throw err;
    }
  }

  async getOverdueAccounts() {
    try {
      const [receivables, payables] = await Promise.all([
        this.accountsReceivableService.getAll(),
        this.accountsPayableService.getAll()
      ]);

      const overdueReceivables = receivables
        .filter(r => r.status === 'vermelho' && !r.paid_date)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 10);

      const overduePayables = payables
        .filter(p => p.status === 'vermelho' && !p.paid_date)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 10);

      return {
        receivables: overdueReceivables,
        payables: overduePayables
      };
    } catch (err: any) {
      console.error('Erro ao buscar contas atrasadas:', err);
      throw err;
    }
  }
}

