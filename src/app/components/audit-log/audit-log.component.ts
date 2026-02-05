import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuditService } from '../../services/audit.service';
import { AuthService } from '../../services/auth.service';
import { AuditLog } from '../../models/customer.model';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>Logs de Auditoria</h2>
          <div class="header-actions">
            <select [value]="selectedTable" (change)="onTableChange($event)" class="filter-select">
              <option value="">Todas as tabelas</option>
              <option value="customers">Clientes</option>
              <option value="accounts_receivable">Contas a Receber</option>
              <option value="accounts_payable">Contas a Pagar</option>
              <option value="profiles">Perfis</option>
            </select>
            <select [value]="selectedAction" (change)="onActionChange($event)" class="filter-select">
              <option value="">Todas as ações</option>
              <option value="CREATE">Criar</option>
              <option value="UPDATE">Atualizar</option>
              <option value="DELETE">Excluir</option>
            </select>
            <button class="btn btn-primary" (click)="loadLogs()">
              Atualizar
            </button>
          </div>
        </div>

        <div *ngIf="loading" class="loading">
          Carregando logs...
        </div>

        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <div *ngIf="!loading && filteredLogs.length === 0" class="empty-state">
          <p>Nenhum log encontrado.</p>
        </div>

        <table *ngIf="!loading && filteredLogs.length > 0" class="table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Ação</th>
              <th>Tabela</th>
              <th>ID do Registro</th>
              <th>Usuário</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of filteredLogs">
              <td>{{ formatDateTime(log.created_at) }}</td>
              <td>
                <span [class]="'badge badge-' + getActionClass(log.action)">
                  {{ getActionLabel(log.action) }}
                </span>
              </td>
              <td>{{ getTableLabel(log.table_name) }}</td>
              <td class="record-id">{{ log.record_id.substring(0, 8) }}...</td>
              <td>{{ log.user_id.substring(0, 8) }}...</td>
              <td>
                <button 
                  class="btn btn-sm btn-secondary" 
                  (click)="showDetails(log)"
                  title="Ver detalhes">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de detalhes -->
    <div *ngIf="selectedLog" class="modal-overlay" (click)="closeDetails()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Detalhes do Log</h3>
          <button class="btn-close" (click)="closeDetails()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <strong>Data/Hora:</strong> {{ formatDateTime(selectedLog.created_at) }}
          </div>
          <div class="detail-row">
            <strong>Ação:</strong> {{ getActionLabel(selectedLog.action) }}
          </div>
          <div class="detail-row">
            <strong>Tabela:</strong> {{ getTableLabel(selectedLog.table_name) }}
          </div>
          <div class="detail-row">
            <strong>ID do Registro:</strong> {{ selectedLog.record_id }}
          </div>
          <div class="detail-row">
            <strong>ID do Usuário:</strong> {{ selectedLog.user_id }}
          </div>
          
          <div *ngIf="selectedLog.old_data" class="detail-section">
            <strong>Dados Antigos:</strong>
            <pre>{{ formatJson(selectedLog.old_data) }}</pre>
          </div>
          
          <div *ngIf="selectedLog.new_data" class="detail-section">
            <strong>Dados Novos:</strong>
            <pre>{{ formatJson(selectedLog.new_data) }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .table {
      font-size: 14px;
    }

    .record-id {
      font-family: monospace;
      font-size: 12px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-CREATE {
      background-color: #d4edda;
      color: #155724;
    }

    .badge-UPDATE {
      background-color: #fff3cd;
      color: #856404;
    }

    .badge-DELETE {
      background-color: #f8d7da;
      color: #721c24;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #ddd;
    }

    .modal-header h3 {
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      color: #000;
    }

    .modal-body {
      padding: 20px;
    }

    .detail-row {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-section {
      margin-top: 20px;
    }

    .detail-section pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      max-height: 300px;
      overflow-y: auto;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  loading = false;
  error: string | null = null;
  selectedLog: AuditLog | null = null;
  selectedTable = '';
  selectedAction = '';

  constructor(
    private auditService: AuditService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Verificar se é admin
    if (!this.authService.isAdmin()) {
      this.error = 'Acesso negado. Apenas administradores podem ver logs de auditoria.';
      return;
    }

    await this.loadLogs();
  }

  async loadLogs() {
    this.loading = true;
    this.error = null;

    try {
      this.logs = await firstValueFrom(this.auditService.getAllLogs());
      this.filterLogs();
    } catch (err: any) {
      this.error = 'Erro ao carregar logs: ' + (err.message || 'Erro desconhecido');
      console.error('Erro ao carregar logs:', err);
    } finally {
      this.loading = false;
    }
  }

  filterLogs() {
    this.filteredLogs = this.logs.filter(log => {
      const tableMatch = !this.selectedTable || log.table_name === this.selectedTable;
      const actionMatch = !this.selectedAction || log.action === this.selectedAction;
      return tableMatch && actionMatch;
    });
  }

  onTableChange(event: any) {
    this.selectedTable = event.target.value;
    this.filterLogs();
  }

  onActionChange(event: any) {
    this.selectedAction = event.target.value;
    this.filterLogs();
  }

  showDetails(log: AuditLog) {
    this.selectedLog = log;
  }

  closeDetails() {
    this.selectedLog = null;
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'CREATE': 'Criar',
      'UPDATE': 'Atualizar',
      'DELETE': 'Excluir',
      'VIEW': 'Visualizar'
    };
    return labels[action] || action;
  }

  getActionClass(action: string): string {
    return action;
  }

  getTableLabel(tableName: string): string {
    const labels: { [key: string]: string } = {
      'customers': 'Clientes',
      'accounts_receivable': 'Contas a Receber',
      'accounts_payable': 'Contas a Pagar',
      'profiles': 'Perfis'
    };
    return labels[tableName] || tableName;
  }
}

