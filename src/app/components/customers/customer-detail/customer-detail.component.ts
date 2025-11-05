import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Detalhes do Cliente</h2>
          <div class="header-actions">
            <button 
              class="btn btn-primary" 
              (click)="editCustomer()">
              Editar
            </button>
            <button class="btn btn-secondary" (click)="goBack()">
              Voltar
            </button>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          Carregando detalhes do cliente...
        </div>

        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <div *ngIf="!loading && !error && customer" class="customer-details">
          <div class="detail-section">
            <h3>Informações Básicas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nome:</label>
                <span>{{ customer.name }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span [class]="'status-badge ' + (customer.is_active ? 'status-verde' : 'status-vermelho')">
                  {{ customer.is_active ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
              <div class="detail-item" *ngIf="customer.phone">
                <label>Telefone:</label>
                <span>{{ customer.phone }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Informações do Plano</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Valor do Plano:</label>
                <span class="highlight">R$ {{ customer.plan_value.toFixed(2).replace('.', ',') }}</span>
              </div>
              <div class="detail-item" *ngIf="customer.plan_description">
                <label>Descrição:</label>
                <span>{{ customer.plan_description }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Informações do Sistema</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>ID:</label>
                <span class="monospace">{{ customer.id }}</span>
              </div>
              <div class="detail-item">
                <label>Criado em:</label>
                <span>{{ formatDate(customer.created_at) }}</span>
              </div>
              <div class="detail-item">
                <label>Atualizado em:</label>
                <span>{{ formatDate(customer.updated_at) }}</span>
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

    .customer-details {
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

    .monospace {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #666;
    }
  `]
})
export class CustomerDetailComponent implements OnInit {
  customer: Customer | null = null;
  loading = false;
  error: string | null = null;
  canEdit = false;

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    await this.loadCustomer();
    // Permitir edição durante desenvolvimento
    this.canEdit = true;
  }

  async loadCustomer() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID do cliente não fornecido';
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      this.customer = await this.customerService.getById(id);
      if (!this.customer) {
        this.error = 'Cliente não encontrado';
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar cliente';
    } finally {
      this.loading = false;
    }
  }

  editCustomer() {
    if (this.customer) {
      this.router.navigate(['/customers', this.customer.id, 'edit']);
    }
  }

  goBack() {
    this.router.navigate(['/customers']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  }
}

