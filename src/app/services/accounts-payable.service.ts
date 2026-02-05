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
  orderBy 
} from '@angular/fire/firestore';
import { Observable, map, firstValueFrom } from 'rxjs';
import { AccountPayable } from '../models/customer.model';
import { calculateAccountStatus } from '../utils/account-status.util';
import { LogService } from './log.service';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsPayableService {
  private firestore = inject(Firestore);
  private logService = inject(LogService);
  private auditService = inject(AuditService);
  private readonly collectionName = 'accounts_payable';

  getAll$(): Observable<AccountPayable[]> {
    const ref = collection(this.firestore, this.collectionName);
    const q = query(ref, orderBy('due_date', 'asc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(accounts => accounts.map(acc => ({
        ...acc,
        status: calculateAccountStatus(acc['due_date'], acc['paid_date'])
      } as AccountPayable)))
    );
  }

  async getAll(): Promise<AccountPayable[]> {
    return firstValueFrom(this.getAll$());
  }

  async getById(id: string): Promise<AccountPayable | null> {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    const data = await firstValueFrom(docData(ref, { idField: 'id' }));
    if (!data) return null;
    return {
      ...data,
      status: calculateAccountStatus(data['due_date'], data['paid_date'])
    } as AccountPayable;
  }

  async create(account: Partial<AccountPayable>) {
    const ref = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(ref, {
      ...account,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    await this.auditService.logAction('CREATE', this.collectionName, docRef.id, null, account);
    return { id: docRef.id, ...account } as AccountPayable;
  }

  async update(id: string, account: Partial<AccountPayable>) {
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

  async delete(id: string) {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(ref);
    await this.auditService.logAction('DELETE', this.collectionName, id, null, null);
  }
}
