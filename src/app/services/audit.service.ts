import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc,
  query,
  where,
  orderBy,
  limit,
  collectionData 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/customer.model';
import { Auth } from '@angular/fire/auth';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private logService = inject(LogService);
  private readonly collectionName = 'audit_log';

  async logAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT',
    tableName: string,
    recordId: string,
    oldData: any = null,
    newData: any = null
  ) {
    try {
      const user = this.auth.currentUser;
      const logEntry = {
        user_id: user?.uid || 'anonymous',
        user_email: user?.email || 'anonymous',
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
        new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
        created_at: new Date().toISOString()
      };

      const ref = collection(this.firestore, this.collectionName);
      await addDoc(ref, logEntry);
    } catch (err) {
      this.logService.error('Failed to log audit action:', err);
    }
  }

  getAllLogs(): Observable<AuditLog[]> {
    const ref = collection(this.firestore, this.collectionName);
    const q = query(ref, orderBy('created_at', 'desc'), limit(100));
    return collectionData(q, { idField: 'id' }) as Observable<AuditLog[]>;
  }

  getLogsByTable(tableName: string): Observable<AuditLog[]> {
    const ref = collection(this.firestore, this.collectionName);
    const q = query(ref, where('table_name', '==', tableName), orderBy('created_at', 'desc'), limit(100));
    return collectionData(q, { idField: 'id' }) as Observable<AuditLog[]>;
  }
}
