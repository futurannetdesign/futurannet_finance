import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from '@angular/fire/firestore';
import { Observable, map, firstValueFrom } from 'rxjs';
import { AccountReceivable } from '../models/customer.model';
import { calculateAccountStatus } from '../utils/account-status.util';
import { LogService } from './log.service';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsReceivableService {
  private firestore = inject(Firestore);
  private logService = inject(LogService);
  private auditService = inject(AuditService);
  private readonly collectionName = 'accounts_receivable';

  getAll$(): Observable<AccountReceivable[]> {
    const ref = collection(this.firestore, this.collectionName);
    const q = query(ref, orderBy('due_date', 'asc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(accounts => accounts.map(acc => ({
        ...acc,
        status: calculateAccountStatus(acc['due_date'], acc['paid_date'])
      } as AccountReceivable)))
    );
  }

  async getAll(): Promise<AccountReceivable[]> {
    return firstValueFrom(this.getAll$());
  }

  async getById(id: string): Promise<AccountReceivable | null> {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    const data = await firstValueFrom(docData(ref, { idField: 'id' }));
    if (!data) return null;
    return {
      ...data,
      status: calculateAccountStatus(data['due_date'], data['paid_date'])
    } as AccountReceivable;
  }

  async create(account: Partial<AccountReceivable>) {
    const ref = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(ref, {
      ...account,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    await this.auditService.logAction('CREATE', this.collectionName, docRef.id, null, account);
    return { id: docRef.id, ...account } as AccountReceivable;
  }

  async update(id: string, account: Partial<AccountReceivable>) {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    const oldData = await this.getById(id);
    await updateDoc(ref, {
      ...account,
      updated_at: new Date().toISOString()
    });
    const newData = await this.getById(id);
    await this.auditService.logAction('UPDATE', this.collectionName, id, oldData, newData);
    return newData!;
  }

  async markAsPaid(id: string, paidDate: string, isRecurring: boolean) {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    const oldData = await this.getById(id);

    if (isRecurring && oldData) {
      const dueDate = new Date(oldData.due_date);
      const nextMonth = new Date(dueDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await this.create({
        customer_id: oldData.customer_id,
        amount: oldData.amount,
        due_date: nextMonth.toISOString().split('T')[0],
        is_recurring: true
      });
    }

    await updateDoc(ref, { 
      paid_date: paidDate,
      updated_at: new Date().toISOString()
    });

    const newData = await this.getById(id);
    await this.auditService.logAction('UPDATE', this.collectionName, id, oldData, newData);
    return newData!;
  }

  async delete(id: string) {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(ref);
    await this.auditService.logAction('DELETE', this.collectionName, id, null, null);
  }
}
