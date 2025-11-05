import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AccountsPayableService } from '../../../services/accounts-payable.service';
import { ExportService } from '../../../services/export.service';
import { AuthService } from '../../../services/auth.service';
import { AccountPayable } from '../../../models/customer.model';

@Component({
  selector: 'app-accounts-payable-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Contas a Pagar</h2>
          <div class="header-actions">
            <button 
              class="btn btn-success" 
              (click)="exportToExcel()"
              title="Exportar para Excel">
              📊 Excel
            </button>
            <button 
              class="btn btn-danger" 
              (click)="exportToPDF()"
              title="Exportar para PDF">
              📄 PDF
            </button>
            <button 
              *ngIf="canEdit"
              class="btn btn-primary" 
              (click)="navigateToNew()">
              Nova Conta
            </button>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          Carregando contas a pagar...
        </div>

        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <div *ngIf="!loading && !error && accounts.length === 0" class="empty-state">
          <h3>Nenhuma conta a pagar encontrada</h3>
          <p>Comece adicionando sua primeira conta.</p>
          <button class="btn btn-primary" (click)="navigateToNew()">
            Adicionar Conta
          </button>
        </div>

        <table *ngIf="!loading && !error && accounts.length > 0" class="table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Recorrente</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let account of accounts" [class.row-overdue]="account.status === 'vermelho'">
              <td>{{ account.description }}</td>
              <td>{{ account.category || '-' }}</td>
              <td>R$ {{ account.amount.toFixed(2).replace('.', ',') }}</td>
              <td>{{ formatDate(account.due_date) }}</td>
              <td>
                <span [class]="'status-badge status-' + account.status">
                  {{ getStatusLabel(account.status, account.paid_date) }}
                </span>
              </td>
              <td>
                <span *ngIf="account.is_recurring" class="badge-recurring">✓</span>
                <span *ngIf="!account.is_recurring">-</span>
              </td>
              <td>
                <button class="btn btn-secondary" (click)="viewDetail(account.id)">
                  Ver
                </button>
                <button 
                  *ngIf="canEdit"
                  class="btn btn-primary" 
                  (click)="editAccount(account.id)">
                  Editar
                </button>
                <button 
                  *ngIf="canEdit && !account.paid_date"
                  class="btn btn-success" 
                  (click)="markAsPaid(account)">
                  Marcar Pago
                </button>
                <button 
                  *ngIf="canDelete"
                  class="btn btn-danger" 
                  (click)="deleteAccount(account.id)">
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .table td {
      white-space: nowrap;
    }

    .table td:last-child {
      white-space: normal;
    }

    .table td button {
      margin-right: 5px;
      margin-bottom: 5px;
    }

    .row-overdue {
      background-color: #fff5f5 !important;
    }

    .badge-recurring {
      display: inline-block;
      width: 24px;
      height: 24px;
      background-color: #007bff;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-weight: bold;
      font-size: 14px;
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
export class AccountsPayableListComponent implements OnInit {
  accounts: AccountPayable[] = [];
  loading = false;
  error: string | null = null;
  canEdit = false;
  canDelete = false;

  constructor(
    private accountsPayableService: AccountsPayableService,
    private exportService: ExportService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.canEdit = this.authService.canEdit();
    this.canDelete = this.authService.canDelete();
    await this.loadAccounts();
  }

  async loadAccounts() {
    this.loading = true;
    this.error = null;
    try {
      this.accounts = await this.accountsPayableService.getAll();
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar contas a pagar';
    } finally {
      this.loading = false;
    }
  }

  navigateToNew() {
    this.router.navigate(['/accounts-payable/new']);
  }

  viewDetail(id: string) {
    this.router.navigate(['/accounts-payable', id]);
  }

  editAccount(id: string) {
    this.router.navigate(['/accounts-payable', id, 'edit']);
  }

  async markAsPaid(account: AccountPayable) {
    if (!confirm(`Marcar conta "${account.description}" como paga?`)) {
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await this.accountsPayableService.markAsPaid(
        account.id, 
        today, 
        account.is_recurring
      );
      await this.loadAccounts();
      alert('Conta marcada como paga com sucesso!');
    } catch (err: any) {
      alert('Erro ao marcar como pago: ' + (err.message || 'Erro desconhecido'));
    }
  }

  async deleteAccount(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) {
      return;
    }

    try {
      await this.accountsPayableService.delete(id);
      await this.loadAccounts();
    } catch (err: any) {
      alert('Erro ao excluir conta: ' + (err.message || 'Erro desconhecido'));
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

  exportToExcel() {
    try {
      this.exportService.exportPayablesToExcel(this.accounts);
      alert('Exportação para Excel realizada com sucesso!');
    } catch (err: any) {
      alert('Erro ao exportar para Excel: ' + (err.message || 'Erro desconhecido'));
    }
  }

  exportToPDF() {
    try {
      this.exportService.exportPayablesToPDF(this.accounts);
      alert('Exportação para PDF realizada com sucesso!');
    } catch (err: any) {
      alert('Erro ao exportar para PDF: ' + (err.message || 'Erro desconhecido'));
    }
  }
}

