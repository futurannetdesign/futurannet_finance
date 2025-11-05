import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { LogService } from '../../../services/log.service';
import { ErrorService } from '../../../services/error.service';
import { Customer } from '../../../models/customer.model';
import { nameValidator, phoneValidator, positiveAmountValidator, getErrorMessage } from '../../../utils/form-validators';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>{{ isEditMode ? 'Editar Cliente' : 'Novo Cliente' }}</h2>
        </div>

        <div *ngIf="loading" class="loading">
          {{ isEditMode ? 'Carregando cliente...' : 'Salvando...' }}
        </div>

        <div *ngIf="error" class="alert alert-error">
          <strong>Erro ao salvar:</strong><br>
          {{ error }}
          <br><br>
          <small>
            <strong>Dica:</strong> Se o erro mencionar "table not found" ou "schema cache", 
            você precisa executar o script SQL no Supabase primeiro. 
            Veja o arquivo <code>docs/CRIAR-TABELA-CUSTOMERS.sql</code>
          </small>
        </div>

        <div *ngIf="success" class="alert alert-success">
          Cliente {{ isEditMode ? 'atualizado' : 'criado' }} com sucesso!
        </div>

        <form [formGroup]="customerForm" (ngSubmit)="onSubmit()" *ngIf="!loading || isEditMode">
          <div class="form-group">
            <label for="name">Nome *</label>
            <input 
              id="name" 
              type="text" 
              formControlName="name" 
              placeholder="Nome completo do cliente"
              [class.error]="customerForm.get('name')?.invalid && customerForm.get('name')?.touched">
            <div *ngIf="customerForm.get('name')?.invalid && customerForm.get('name')?.touched" class="error-message">
              {{ getErrorMessage(customerForm.get('name')) }}
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Telefone</label>
            <input 
              id="phone" 
              type="text" 
              formControlName="phone" 
              placeholder="(00) 00000-0000"
              [class.error]="customerForm.get('phone')?.invalid && customerForm.get('phone')?.touched">
            <div *ngIf="customerForm.get('phone')?.invalid && customerForm.get('phone')?.touched" class="error-message">
              {{ getErrorMessage(customerForm.get('phone')) }}
            </div>
          </div>

          <div class="form-group">
            <label for="plan_value">Valor do Plano (R$) *</label>
            <input 
              id="plan_value" 
              type="number" 
              formControlName="plan_value" 
              step="0.01" 
              min="0"
              placeholder="0.00"
              [class.error]="customerForm.get('plan_value')?.invalid && customerForm.get('plan_value')?.touched">
            <div *ngIf="customerForm.get('plan_value')?.invalid && customerForm.get('plan_value')?.touched" class="error-message">
              {{ getErrorMessage(customerForm.get('plan_value')) }}
            </div>
          </div>

          <div class="form-group">
            <label for="plan_description">Descrição do Plano</label>
            <input 
              id="plan_description" 
              type="text" 
              formControlName="plan_description" 
              placeholder="Ex: Plano 100MB">
          </div>

          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                formControlName="is_active">
              Cliente ativo
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancel()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="customerForm.invalid || saving">
              {{ saving ? 'Salvando...' : (isEditMode ? 'Atualizar' : 'Criar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    input.error,
    textarea.error {
      border-color: #dc3545;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .form-group label input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }
  `]
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  customerId: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private logService: LogService,
    private errorService: ErrorService
  ) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, nameValidator()]],
      phone: ['', [phoneValidator()]],
      plan_value: [0, [Validators.required, positiveAmountValidator()]],
      plan_description: [''],
      is_active: [true]
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode = true;
      this.customerId = id;
      await this.loadCustomer();
    }
  }

  async loadCustomer() {
    if (!this.customerId) return;

    this.loading = true;
    this.error = null;
    try {
      const customer = await this.customerService.getById(this.customerId);
      if (customer) {
        this.customerForm.patchValue({
          name: customer.name,
          phone: customer.phone || '',
          plan_value: customer.plan_value,
          plan_description: customer.plan_description || '',
          is_active: customer.is_active
        });
      }
    } catch (err: any) {
      this.logService.error('Erro ao carregar cliente:', err);
      this.error = this.errorService.getErrorMessageString(err);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.customerForm.invalid) {
      // Marcar todos os campos como touched para mostrar erros
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving = true;
    this.error = null;
    this.success = false;

    try {
      const formValue = this.customerForm.value;
      this.logService.log('Dados a serem salvos:', formValue);
      
      let result;
      if (this.isEditMode && this.customerId) {
        result = await this.customerService.update(this.customerId, formValue);
      } else {
        result = await this.customerService.create(formValue);
      }

      this.logService.log('Cliente salvo com sucesso:', result);
      this.success = true;
      
      setTimeout(() => {
        this.router.navigate(['/customers']);
      }, 1500);
    } catch (err: any) {
      this.logService.error('Erro ao salvar cliente:', err);
      this.error = this.errorService.getErrorMessageString(err);
      this.saving = false;
    }
  }

  getErrorMessage(control: any): string {
    return getErrorMessage(control);
  }

  cancel() {
    this.router.navigate(['/customers']);
  }
}
