import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AccountReceivable, AccountPayable } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  exportToExcel(data: any[], filename: string, sheetName: string = 'Dados') {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (err) {
      console.error('Erro ao exportar para Excel:', err);
      throw err;
    }
  }

  exportReceivablesToExcel(accounts: AccountReceivable[]) {
    const data = accounts.map(account => ({
      'Cliente': account.customers?.name || 'N/A',
      'Valor': account.amount,
      'Data Vencimento': this.formatDate(account.due_date),
      'Data Pagamento': account.paid_date ? this.formatDate(account.paid_date) : '-',
      'Status': this.getStatusLabel(account.status, account.paid_date),
      'Recorrente': account.is_recurring ? 'Sim' : 'Não',
      'Criado em': this.formatDateTime(account.created_at)
    }));
    
    this.exportToExcel(data, `contas-a-receber-${this.getCurrentDateString()}`, 'Contas a Receber');
  }

  exportPayablesToExcel(accounts: AccountPayable[]) {
    const data = accounts.map(account => ({
      'Descrição': account.description,
      'Categoria': account.category || '-',
      'Valor': account.amount,
      'Data Vencimento': this.formatDate(account.due_date),
      'Data Pagamento': account.paid_date ? this.formatDate(account.paid_date) : '-',
      'Status': this.getStatusLabel(account.status, account.paid_date),
      'Recorrente': account.is_recurring ? 'Sim' : 'Não',
      'Criado em': this.formatDateTime(account.created_at)
    }));
    
    this.exportToExcel(data, `contas-a-pagar-${this.getCurrentDateString()}`, 'Contas a Pagar');
  }

  exportReceivablesToPDF(accounts: AccountReceivable[]) {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Contas a Receber', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${this.formatDateTime(new Date().toISOString())}`, 14, 28);
    
    const tableData = accounts.map(account => [
      account.customers?.name || 'N/A',
      `R$ ${account.amount.toFixed(2).replace('.', ',')}`,
      this.formatDate(account.due_date),
      account.paid_date ? this.formatDate(account.paid_date) : '-',
      this.getStatusLabel(account.status, account.paid_date),
      account.is_recurring ? 'Sim' : 'Não'
    ]);

    autoTable(doc, {
      head: [['Cliente', 'Valor', 'Vencimento', 'Pagamento', 'Status', 'Recorrente']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`contas-a-receber-${this.getCurrentDateString()}.pdf`);
  }

  exportPayablesToPDF(accounts: AccountPayable[]) {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Contas a Pagar', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${this.formatDateTime(new Date().toISOString())}`, 14, 28);
    
    const tableData = accounts.map(account => [
      account.description,
      account.category || '-',
      `R$ ${account.amount.toFixed(2).replace('.', ',')}`,
      this.formatDate(account.due_date),
      account.paid_date ? this.formatDate(account.paid_date) : '-',
      this.getStatusLabel(account.status, account.paid_date),
      account.is_recurring ? 'Sim' : 'Não'
    ]);

    autoTable(doc, {
      head: [['Descrição', 'Categoria', 'Valor', 'Vencimento', 'Pagamento', 'Status', 'Recorrente']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [102, 126, 234] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`contas-a-pagar-${this.getCurrentDateString()}.pdf`);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  private formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  }

  private getStatusLabel(status: string, paidDate?: string | null): string {
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

  private getCurrentDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}

