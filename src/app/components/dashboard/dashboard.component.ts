import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';
import { AccountReceivable, AccountPayable } from '../../models/customer.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral financeira</p>
      </div>

      <div *ngIf="loading" class="loading">
        Carregando dados do dashboard...
      </div>

      <div *ngIf="error" class="alert alert-error">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error && summary" class="dashboard-content">
        <!-- Resumo Financeiro -->
        <div class="summary-cards">
          <div class="summary-card card-receivable">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <h3>Total a Receber</h3>
              <p class="card-value">R$ {{ summary.totalReceivable.toFixed(2).replace('.', ',') }}</p>
            </div>
          </div>

          <div class="summary-card card-payable">
            <div class="card-icon">💸</div>
            <div class="card-content">
              <h3>Total a Pagar</h3>
              <p class="card-value">R$ {{ summary.totalPayable.toFixed(2).replace('.', ',') }}</p>
            </div>
          </div>

          <div class="summary-card card-balance" [class.positive]="summary.balance >= 0" [class.negative]="summary.balance < 0">
            <div class="card-icon">{{ summary.balance >= 0 ? '📈' : '📉' }}</div>
            <div class="card-content">
              <h3>Saldo</h3>
              <p class="card-value">R$ {{ summary.balance.toFixed(2).replace('.', ',') }}</p>
            </div>
          </div>

          <div class="summary-card card-customers">
            <div class="card-icon">👥</div>
            <div class="card-content">
              <h3>Clientes Ativos</h3>
              <p class="card-value">{{ summary.activeCustomers }}</p>
            </div>
          </div>
        </div>

        <!-- Alertas -->
        <div class="alerts-section">
          <div class="alert-card alert-danger" *ngIf="summary.overdueReceivable > 0 || summary.overduePayable > 0">
            <h3>⚠️ Contas Atrasadas</h3>
            <p>
              <strong>{{ summary.overdueReceivable }}</strong> contas a receber e 
              <strong>{{ summary.overduePayable }}</strong> contas a pagar estão atrasadas
            </p>
          </div>

          <div class="alert-card alert-warning" *ngIf="summary.upcomingReceivable > 0 || summary.upcomingPayable > 0">
            <h3>🔔 Próximas do Vencimento</h3>
            <p>
              <strong>{{ summary.upcomingReceivable }}</strong> contas a receber e 
              <strong>{{ summary.upcomingPayable }}</strong> contas a pagar vencem nos próximos 5 dias
            </p>
          </div>
        </div>

        <!-- Status por Categoria -->
        <div class="status-section">
          <div class="status-card">
            <h3>Contas a Receber</h3>
            <div class="status-bars">
              <div class="status-bar">
                <span class="status-label">Pago:</span>
                <span class="status-value status-verde">{{ summary.statusCounts.receivable.verde }}</span>
              </div>
              <div class="status-bar">
                <span class="status-label">Próximo:</span>
                <span class="status-value status-amarelo">{{ summary.statusCounts.receivable.amarelo }}</span>
              </div>
              <div class="status-bar">
                <span class="status-label">Atrasado:</span>
                <span class="status-value status-vermelho">{{ summary.statusCounts.receivable.vermelho }}</span>
              </div>
            </div>
          </div>

          <div class="status-card">
            <h3>Contas a Pagar</h3>
            <div class="status-bars">
              <div class="status-bar">
                <span class="status-label">Pago:</span>
                <span class="status-value status-verde">{{ summary.statusCounts.payable.verde }}</span>
              </div>
              <div class="status-bar">
                <span class="status-label">Próximo:</span>
                <span class="status-value status-amarelo">{{ summary.statusCounts.payable.amarelo }}</span>
              </div>
              <div class="status-bar">
                <span class="status-label">Atrasado:</span>
                <span class="status-value status-vermelho">{{ summary.statusCounts.payable.vermelho }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Contas Próximas do Vencimento -->
        <div class="accounts-section">
          <div class="accounts-card">
            <div class="card-header">
              <h3>📅 Contas a Receber - Próximas do Vencimento</h3>
              <a routerLink="/accounts-receivable" class="btn btn-secondary btn-sm">Ver Todas</a>
            </div>
            <div *ngIf="upcomingReceivables.length === 0" class="empty-state-small">
              <p>Nenhuma conta próxima do vencimento</p>
            </div>
            <table *ngIf="upcomingReceivables.length > 0" class="table-compact">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let account of upcomingReceivables">
                  <td>{{ account.customers?.name || 'N/A' }}</td>
                  <td>R$ {{ account.amount.toFixed(2).replace('.', ',') }}</td>
                  <td>{{ formatDate(account.due_date) }}</td>
                  <td>
                    <span [class]="'status-badge status-' + account.status">
                      {{ getStatusLabel(account.status, account.paid_date) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="accounts-card">
            <div class="card-header">
              <h3>📅 Contas a Pagar - Próximas do Vencimento</h3>
              <a routerLink="/accounts-payable" class="btn btn-secondary btn-sm">Ver Todas</a>
            </div>
            <div *ngIf="upcomingPayables.length === 0" class="empty-state-small">
              <p>Nenhuma conta próxima do vencimento</p>
            </div>
            <table *ngIf="upcomingPayables.length > 0" class="table-compact">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let account of upcomingPayables">
                  <td>{{ account.description }}</td>
                  <td>R$ {{ account.amount.toFixed(2).replace('.', ',') }}</td>
                  <td>{{ formatDate(account.due_date) }}</td>
                  <td>
                    <span [class]="'status-badge status-' + account.status">
                      {{ getStatusLabel(account.status, account.paid_date) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Contas Atrasadas -->
        <div class="accounts-section" *ngIf="overdueReceivables.length > 0 || overduePayables.length > 0">
          <div class="accounts-card" *ngIf="overdueReceivables.length > 0">
            <div class="card-header">
              <h3>🔴 Contas a Receber - Atrasadas</h3>
              <a routerLink="/accounts-receivable" class="btn btn-secondary btn-sm">Ver Todas</a>
            </div>
            <table class="table-compact">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Dias Atrasado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let account of overdueReceivables" class="row-overdue">
                  <td>{{ account.customers?.name || 'N/A' }}</td>
                  <td>R$ {{ account.amount.toFixed(2).replace('.', ',') }}</td>
                  <td>{{ formatDate(account.due_date) }}</td>
                  <td>{{ getDaysOverdue(account.due_date) }} dias</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="accounts-card" *ngIf="overduePayables.length > 0">
            <div class="card-header">
              <h3>🔴 Contas a Pagar - Atrasadas</h3>
              <a routerLink="/accounts-payable" class="btn btn-secondary btn-sm">Ver Todas</a>
            </div>
            <table class="table-compact">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Dias Atrasado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let account of overduePayables" class="row-overdue">
                  <td>{{ account.description }}</td>
                  <td>R$ {{ account.amount.toFixed(2).replace('.', ',') }}</td>
                  <td>{{ formatDate(account.due_date) }}</td>
                  <td>{{ getDaysOverdue(account.due_date) }} dias</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .dashboard-header p {
      color: #666;
      margin: 0;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.2s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
    }

    .card-icon {
      font-size: 48px;
      line-height: 1;
    }

    .card-content h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
    }

    .card-value {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .card-receivable {
      border-left: 4px solid #28a745;
    }

    .card-payable {
      border-left: 4px solid #dc3545;
    }

    .card-balance {
      border-left: 4px solid #007bff;
    }

    .card-balance.positive .card-value {
      color: #28a745;
    }

    .card-balance.negative .card-value {
      color: #dc3545;
    }

    .card-customers {
      border-left: 4px solid #17a2b8;
    }

    .alerts-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .alert-card {
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .alert-card h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
    }

    .alert-card p {
      margin: 0;
      font-size: 14px;
    }

    .alert-danger {
      background-color: #fff5f5;
      border-color: #dc3545;
      color: #721c24;
    }

    .alert-warning {
      background-color: #fffbf0;
      border-color: #ffc107;
      color: #856404;
    }

    .status-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .status-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .status-card h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #333;
    }

    .status-bars {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 6px;
    }

    .status-label {
      font-weight: 500;
      color: #666;
    }

    .status-value {
      font-weight: 700;
      font-size: 18px;
    }

    .accounts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .accounts-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .accounts-card .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
    }

    .accounts-card .card-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .table-compact {
      width: 100%;
      border-collapse: collapse;
    }

    .table-compact th {
      background-color: #f8f9fa;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      color: #666;
      border-bottom: 2px solid #dee2e6;
    }

    .table-compact td {
      padding: 10px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }

    .table-compact tr:hover {
      background-color: #f8f9fa;
    }

    .empty-state-small {
      text-align: center;
      padding: 30px;
      color: #999;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-verde {
      background-color: #d4edda;
      color: #155724;
    }

    .status-amarelo {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-vermelho {
      background-color: #f8d7da;
      color: #721c24;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  upcomingReceivables: AccountReceivable[] = [];
  upcomingPayables: AccountPayable[] = [];
  overdueReceivables: AccountReceivable[] = [];
  overduePayables: AccountPayable[] = [];
  loading = false;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  async ngOnInit() {
    await this.loadDashboard();
  }

  async loadDashboard() {
    this.loading = true;
    this.error = null;
    try {
      this.summary = await this.dashboardService.getSummary();
      const upcoming = await this.dashboardService.getUpcomingAccounts(5);
      const overdue = await this.dashboardService.getOverdueAccounts();
      
      this.upcomingReceivables = upcoming.receivables;
      this.upcomingPayables = upcoming.payables;
      this.overdueReceivables = overdue.receivables;
      this.overduePayables = overdue.payables;
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar dados do dashboard';
    } finally {
      this.loading = false;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  getStatusLabel(status: string, paidDate?: string | null): string {
    if (status === 'verde' && paidDate) {
      return 'Pago';
    } else if (status === 'verde' && !paidDate) {
      return 'Em Dia';
    } else if (status === 'amarelo') {
      return 'Próximo';
    } else if (status === 'vermelho') {
      return 'Atrasado';
    }
    return status;
  }

  getDaysOverdue(dueDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
}

