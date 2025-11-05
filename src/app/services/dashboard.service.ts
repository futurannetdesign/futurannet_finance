import { Injectable } from '@angular/core';
import { AccountsReceivableService } from './accounts-receivable.service';
import { AccountsPayableService } from './accounts-payable.service';
import { CustomerService } from './customer.service';
import { LogService } from './log.service';
import { ErrorService } from './error.service';
import { CacheService } from './cache.service';

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
  private readonly CACHE_KEY_SUMMARY = 'dashboard:summary';
  private readonly CACHE_KEY_UPCOMING = 'dashboard:upcoming';
  private readonly CACHE_KEY_OVERDUE = 'dashboard:overdue';
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutos (cache curto para dados dinâmicos)

  constructor(
    private accountsReceivableService: AccountsReceivableService,
    private accountsPayableService: AccountsPayableService,
    private customerService: CustomerService,
    private logService: LogService,
    private errorService: ErrorService,
    private cacheService: CacheService
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    // Verificar cache primeiro
    const cached = this.cacheService.get<DashboardSummary>(this.CACHE_KEY_SUMMARY);
    if (cached) {
      return cached;
    }

    try {
      // Usar Promise.all para buscar dados em paralelo (já otimizado)
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
      // Nota: Status já é calculado pelos serviços usando calculateAccountStatus
      // Verde pode significar: pago OU em dia (mais de 5 dias antes)
      // Amarelo: próximo do vencimento (0-5 dias, não pago)
      // Vermelho: atrasado (vencido, não pago)
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

      const summary: DashboardSummary = {
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

      // Armazenar no cache
      this.cacheService.set(this.CACHE_KEY_SUMMARY, summary, this.CACHE_TTL);

      return summary;
    } catch (err: any) {
      this.logService.error('Erro ao calcular resumo do dashboard:', err);
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async getUpcomingAccounts(days: number = 5) {
    const cacheKey = `${this.CACHE_KEY_UPCOMING}:${days}`;
    
    // Verificar cache primeiro
    const cached = this.cacheService.get<{ receivables: any[]; payables: any[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Usar Promise.all para buscar dados em paralelo (já otimizado)
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

      const result = {
        receivables: upcomingReceivables,
        payables: upcomingPayables
      };

      // Armazenar no cache
      this.cacheService.set(cacheKey, result, this.CACHE_TTL);

      return result;
    } catch (err: any) {
      this.logService.error('Erro ao buscar contas próximas:', err);
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async getOverdueAccounts() {
    // Verificar cache primeiro
    const cached = this.cacheService.get<{ receivables: any[]; payables: any[] }>(this.CACHE_KEY_OVERDUE);
    if (cached) {
      return cached;
    }

    try {
      // Usar Promise.all para buscar dados em paralelo (já otimizado)
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

      const result = {
        receivables: overdueReceivables,
        payables: overduePayables
      };

      // Armazenar no cache
      this.cacheService.set(this.CACHE_KEY_OVERDUE, result, this.CACHE_TTL);

      return result;
    } catch (err: any) {
      this.logService.error('Erro ao buscar contas atrasadas:', err);
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }
}

