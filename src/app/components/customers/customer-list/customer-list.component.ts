import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';
import { Customer } from '../../../models/customer.model';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Clientes</h2>
          <button 
            *ngIf="canEdit"
            class="btn btn-primary" 
            (click)="navigateToNew()">
            Novo Cliente
          </button>
        </div>

        <div *ngIf="loading" class="loading">
          Carregando clientes...
        </div>

        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <div *ngIf="!loading && !error && customers.length === 0" class="empty-state">
          <h3>Nenhum cliente encontrado</h3>
          <p>Comece adicionando seu primeiro cliente.</p>
          <button class="btn btn-primary" (click)="navigateToNew()">
            Adicionar Cliente
          </button>
        </div>

        <table *ngIf="!loading && !error && customers.length > 0" class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Valor do Plano</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of customers">
              <td>{{ customer.name }}</td>
              <td>{{ customer.phone || '-' }}</td>
              <td>R$ {{ customer.plan_value.toFixed(2).replace('.', ',') }}</td>
              <td>
                <span [class]="'status-badge ' + (customer.is_active ? 'status-verde' : 'status-vermelho')">
                  {{ customer.is_active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td>
                <button class="btn btn-secondary" (click)="viewDetail(customer.id)">
                  Ver
                </button>
                <button 
                  *ngIf="canEdit"
                  class="btn btn-primary" 
                  (click)="editCustomer(customer.id)">
                  Editar
                </button>
                <button 
                  *ngIf="canDelete"
                  class="btn btn-danger" 
                  (click)="deleteCustomer(customer.id)">
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
    .table td {
      white-space: nowrap;
    }

    .table td:last-child {
      white-space: normal;
    }

    .table td button {
      margin-right: 5px;
    }
  `]
})
export class CustomerListComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];
  loading = false;
  error: string | null = null;
  canEdit = false;
  canDelete = false;
  private routerSubscription?: Subscription;

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.canEdit = this.authService.canEdit();
    this.canDelete = this.authService.canDelete();
    await this.loadCustomers();
    
    // Recarregar quando voltar para a página (após criar/editar)
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(async (event: any) => {
        if (event.url === '/customers') {
          await this.loadCustomers();
        }
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  async loadCustomers() {
    this.loading = true;
    this.error = null;
    try {
      // Buscar clientes (já vem ordenado do serviço)
      const customers = await this.customerService.getAll();
      
      // Garantir ordenação alfabética (dupla verificação)
      this.customers = customers.sort((a, b) => {
        const nameA = (a.name || '').trim().toLowerCase();
        const nameB = (b.name || '').trim().toLowerCase();
        return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
      });
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar clientes';
    } finally {
      this.loading = false;
    }
  }

  navigateToNew() {
    this.router.navigate(['/customers/new']);
  }

  viewDetail(id: string) {
    this.router.navigate(['/customers', id]);
  }

  editCustomer(id: string) {
    this.router.navigate(['/customers', id, 'edit']);
  }

  async deleteCustomer(id: string) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await this.customerService.delete(id);
      await this.loadCustomers();
    } catch (err: any) {
      alert('Erro ao excluir cliente: ' + (err.message || 'Erro desconhecido'));
    }
  }
}

