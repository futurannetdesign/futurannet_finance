import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AccountsReceivableService } from '../../../services/accounts-receivable.service';
import { AccountReceivable } from '../../../models/customer.model';

@Component({
  selector: 'app-accounts-receivable-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Detalhes da Conta a Receber</h2>
          <div class="header-actions">
            <button 
              class="btn btn-primary" 
              (click)="editAccount()">
              Editar
            </button>
            <button 
              *ngIf="account && !account.paid_date"
              class="btn btn-success" 
              (click)="markAsPaid()">
              Marcar como Pago
            </button>
            <button class="btn btn-secondary" (click)="goBack()">
              Voltar
            </button>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          Carregando detalhes da conta...
        </div>

        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <div *ngIf="!loading && !error && account" class="account-details">
          <div class="detail-section">
            <h3>Informações do Cliente</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Cliente:</label>
                <span>{{ account.customers?.name || 'Cliente não encontrado' }}</span>
              </div>
              <div class="detail-item" *ngIf="account.customers?.phone">
                <label>Telefone:</label>
                <span>{{ account.customers?.phone }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Informações Financeiras</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Valor:</label>
                <span class="highlight">R$ {{ account.amount.toFixed(2).replace('.', ',') }}</span>
              </div>
              <div class="detail-item">
                <label>Data de Vencimento:</label>
                <span>{{ formatDate(account.due_date) }}</span>
              </div>
              <div class="detail-item" *ngIf="account.paid_date">
                <label>Data de Pagamento:</label>
                <span class="highlight-success">{{ formatDate(account.paid_date) }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span [class]="'status-badge status-' + account.status">
                  {{ getStatusLabel(account.status, account.paid_date) }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Informações Adicionais</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Recorrente:</label>
                <span>{{ account.is_recurring ? 'Sim' : 'Não' }}</span>
              </div>
              <div class="detail-item">
                <label>ID:</label>
                <span class="monospace">{{ account.id }}</span>
              </div>
              <div class="detail-item">
                <label>Criado em:</label>
                <span>{{ formatDateTime(account.created_at) }}</span>
              </div>
              <div class="detail-item">
                <label>Atualizado em:</label>
                <span>{{ formatDateTime(account.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .header-actions .btn {
      margin: 0;
      white-space: nowrap;
    }

    .account-details {
      padding: 20px 0;
    }

    .detail-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .detail-section:last-child {
      border-bottom: none;
    }

    .detail-section h3 {
      margin-bottom: 15px;
      color: #333;
      font-size: 18px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-item label {
      font-weight: 600;
      color: #666;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .detail-item span {
      color: #333;
      font-size: 16px;
    }

    .detail-item .highlight {
      font-size: 20px;
      font-weight: 600;
      color: #007bff;
    }

    .detail-item .highlight-success {
      font-size: 18px;
      font-weight: 600;
      color: #28a745;
    }

    .monospace {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #666;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
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
export class AccountsReceivableDetailComponent implements OnInit {
  account: AccountReceivable | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private accountsReceivableService: AccountsReceivableService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    await this.loadAccount();
  }

  async loadAccount() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID da conta não fornecido';
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      this.account = await this.accountsReceivableService.getById(id);
      if (!this.account) {
        this.error = 'Conta não encontrada';
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar conta';
    } finally {
      this.loading = false;
    }
  }

  editAccount() {
    if (this.account) {
      this.router.navigate(['/accounts-receivable', this.account.id, 'edit']);
    }
  }

  async markAsPaid() {
    if (!this.account) return;

    if (!confirm(`Marcar conta de ${this.account.customers?.name} como paga?`)) {
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await this.accountsReceivableService.markAsPaid(
        this.account.id, 
        today, 
        this.account.is_recurring
      );
      await this.loadAccount();
      alert('Conta marcada como paga com sucesso!');
    } catch (err: any) {
      alert('Erro ao marcar como pago: ' + (err.message || 'Erro desconhecido'));
    }
  }

  goBack() {
    this.router.navigate(['/accounts-receivable']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
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
}

