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
import { Observable, firstValueFrom } from 'rxjs';
import { Customer } from '../models/customer.model';
import { LogService } from './log.service';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private firestore = inject(Firestore);
  private logService = inject(LogService);
  private auditService = inject(AuditService);
  private readonly collectionName = 'customers';

  /**
   * REATIVE API (Signals/Observables)
   */
  getCustomers$(activeOnly: boolean = false): Observable<Customer[]> {
    const customersRef = collection(this.firestore, this.collectionName);
    const q = activeOnly 
      ? query(customersRef, where('is_active', '==', true), orderBy('name'))
      : query(customersRef, orderBy('name'));
    
    return collectionData(q, { idField: 'id' }) as Observable<Customer[]>;
  }

  /**
   * LEGACY COMPATIBILITY API (Promises)
   */
  async getAll(): Promise<Customer[]> {
    return firstValueFrom(this.getCustomers$());
  }

  async getById(id: string): Promise<Customer | null> {
    const customerRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return firstValueFrom(docData(customerRef, { idField: 'id' }) as Observable<Customer>);
  }

  async create(customer: Partial<Customer>) {
    try {
      this.logService.log('Creating customer in Firestore:', customer.name);
      const customersRef = collection(this.firestore, this.collectionName);
      const docRef = await addDoc(customersRef, {
        ...customer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      await this.auditService.logAction('CREATE', this.collectionName, docRef.id, null, customer);
      return { id: docRef.id, ...customer } as Customer;
    } catch (err: any) {
      this.logService.error('Error creating customer:', err);
      throw err;
    }
  }

  async update(id: string, customer: Partial<Customer>) {
    try {
      const customerRef = doc(this.firestore, `${this.collectionName}/${id}`);
      await updateDoc(customerRef, {
        ...customer,
        updated_at: new Date().toISOString()
      });
      await this.auditService.logAction('UPDATE', this.collectionName, id, null, customer);
      return { id, ...customer } as Customer;
    } catch (err: any) {
      this.logService.error('Error updating customer:', err);
      throw err;
    }
  }

  async checkDuplicateName(name: string, excludeId?: string): Promise<boolean> {
    try {
      const customersRef = collection(this.firestore, this.collectionName);
      const normalizedName = name.trim().toLowerCase();
      const allCustomers = await firstValueFrom(collectionData(customersRef, { idField: 'id' }) as Observable<Customer[]>);
      
      const duplicate = allCustomers.find(c => 
        c.name.trim().toLowerCase() === normalizedName && 
        (!excludeId || c.id !== excludeId)
      );
      
      return !!duplicate;
    } catch (err: any) {
      this.logService.error('Error checking duplicate name:', err);
      return false;
    }
  }

  async delete(id: string) {
    try {
      const customerRef = doc(this.firestore, `${this.collectionName}/${id}`);
      await deleteDoc(customerRef);
      await this.auditService.logAction('DELETE', this.collectionName, id, null, null);
    } catch (err: any) {
      this.logService.error('Error deleting customer:', err);
      throw err;
    }
  }
}
