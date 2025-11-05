import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AccountsPayableService } from '../../../services/accounts-payable.service';
import { AccountPayable } from '../../../models/customer.model';

@Component({
  selector: 'app-accounts-payable-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>{{ isEditMode ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar' }}</h2>
        </div>

        <div *ngIf="loading" class="loading">
          {{ isEditMode ? 'Carregando conta...' : 'Salvando...' }}
        </div>

        <div *ngIf="error" class="alert alert-error">
          <strong>Erro ao salvar:</strong><br>
          {{ error }}
        </div>

        <div *ngIf="success" class="alert alert-success">
          Conta {{ isEditMode ? 'atualizada' : 'criada' }} com sucesso!
        </div>

        <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
          <div class="form-group">
            <label for="description">Descrição *</label>
            <input 
              id="description" 
              type="text" 
              formControlName="description" 
              placeholder="Ex: Aluguel, Gás, Telefone..."
              [class.error]="accountForm.get('description')?.invalid && accountForm.get('description')?.touched">
            <div *ngIf="accountForm.get('description')?.invalid && accountForm.get('description')?.touched" class="error-message">
              Descrição é obrigatória
            </div>
          </div>

          <div class="form-group">
            <label for="category">Categoria</label>
            <input 
              id="category" 
              type="text" 
              formControlName="category" 
              placeholder="Ex: Aluguel, Serviços, Impostos...">
            <small class="form-hint">Opcional: categorize para melhor organização</small>
          </div>

          <div class="form-group">
            <label for="amount">Valor (R$) *</label>
            <input 
              id="amount" 
              type="number" 
              formControlName="amount" 
              step="0.01" 
              min="0"
              placeholder="0.00"
              [class.error]="accountForm.get('amount')?.invalid && accountForm.get('amount')?.touched">
            <div *ngIf="accountForm.get('amount')?.invalid && accountForm.get('amount')?.touched" class="error-message">
              Valor é obrigatório e deve ser maior que zero
            </div>
          </div>

          <div class="form-group">
            <label for="due_date">Data de Vencimento *</label>
            <input 
              id="due_date" 
              type="date" 
              formControlName="due_date"
              [class.error]="accountForm.get('due_date')?.invalid && accountForm.get('due_date')?.touched">
            <div *ngIf="accountForm.get('due_date')?.invalid && accountForm.get('due_date')?.touched" class="error-message">
              Data de vencimento é obrigatória
            </div>
          </div>

          <div class="form-group">
            <label for="paid_date">Data de Pagamento (opcional)</label>
            <input 
              id="paid_date" 
              type="date" 
              formControlName="paid_date">
            <small class="form-hint">Deixe em branco se ainda não foi pago</small>
          </div>

          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                formControlName="is_recurring">
              Conta recorrente (mensal)
            </label>
            <small class="form-hint">Se marcado, ao marcar como pago será criada automaticamente a próxima conta</small>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cancel()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="accountForm.invalid || saving">
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
    select.error,
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

    .form-hint {
      display: block;
      color: #666;
      font-size: 12px;
      margin-top: 5px;
    }
  `]
})
export class AccountsPayableFormComponent implements OnInit {
  accountForm: FormGroup;
  isEditMode = false;
  accountId: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private accountsPayableService: AccountsPayableService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.accountForm = this.fb.group({
      description: ['', [Validators.required]],
      category: [''],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      due_date: ['', [Validators.required]],
      paid_date: [''],
      is_recurring: [false]
    });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode = true;
      this.accountId = id;
      await this.loadAccount();
    }
  }

  async loadAccount() {
    if (!this.accountId) return;

    this.loading = true;
    this.error = null;
    try {
      const account = await this.accountsPayableService.getById(this.accountId);
      if (account) {
        this.accountForm.patchValue({
          description: account.description,
          category: account.category || '',
          amount: account.amount,
          due_date: account.due_date.split('T')[0],
          paid_date: account.paid_date ? account.paid_date.split('T')[0] : '',
          is_recurring: account.is_recurring
        });
      }
    } catch (err: any) {
      this.error = err.message || 'Erro ao carregar conta';
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    console.log('Formulário submetido');
    console.log('Form válido?', this.accountForm.valid);
    console.log('Form value:', this.accountForm.value);
    
    if (this.accountForm.invalid) {
      console.log('Formulário inválido, marcando campos como touched');
      Object.keys(this.accountForm.controls).forEach(key => {
        const control = this.accountForm.get(key);
        control?.markAsTouched();
        console.log(`${key}:`, { 
          value: control?.value, 
          invalid: control?.invalid, 
          errors: control?.errors 
        });
      });
      return;
    }

    this.saving = true;
    this.error = null;
    this.success = false;

    try {
      const formValue = this.accountForm.value;
      console.log('Dados a serem salvos:', formValue);
      
      const accountData: any = {
        description: formValue.description,
        category: formValue.category || null,
        amount: parseFloat(formValue.amount),
        due_date: formValue.due_date,
        paid_date: formValue.paid_date || null,
        is_recurring: formValue.is_recurring || false
      };

      console.log('Dados formatados:', accountData);

      let result;
      if (this.isEditMode && this.accountId) {
        console.log('Atualizando conta existente...');
        result = await this.accountsPayableService.update(this.accountId, accountData);
      } else {
        console.log('Criando nova conta...');
        result = await this.accountsPayableService.create(accountData);
      }

      console.log('Conta salva com sucesso:', result);
      this.success = true;
      
      setTimeout(() => {
        this.router.navigate(['/accounts-payable']);
      }, 1500);
    } catch (err: any) {
      console.error('Erro ao salvar conta:', err);
      this.error = err.message || err.error?.message || 'Erro ao salvar conta. Verifique os dados e tente novamente.';
      this.saving = false;
    }
  }

  cancel() {
    this.router.navigate(['/accounts-payable']);
  }
}

