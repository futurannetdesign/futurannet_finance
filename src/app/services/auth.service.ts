import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { 
  Auth, 
  authState, 
  signInWithEmailAndPassword, 
  signOut, 
  User 
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  docData 
} from '@angular/fire/firestore';
import { Observable, of, switchMap, tap } from 'rxjs';
import { Profile } from '../models/customer.model';
import { LogService } from './log.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private logService = inject(LogService);
  private errorService = inject(ErrorService);

  // Signals for state management
  private userSignal = signal<User | null>(null);
  private profileSignal = signal<Profile | null>(null);

  // Computed signals (Public API)
  readonly currentUser = computed(() => this.userSignal());
  readonly currentProfile = computed(() => this.profileSignal());
  readonly currentRole = computed(() => this.profileSignal()?.role || null);
  readonly isAuthenticated = computed(() => !!this.userSignal());

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener() {
    authState(this.auth).pipe(
      tap(user => {
        this.logService.log('Firebase Auth state changed:', user?.email || 'No user');
        this.userSignal.set(user);
      }),
      switchMap(user => {
        if (!user) {
          this.profileSignal.set(null);
          return of(null);
        }
        return docData(doc(this.firestore, `users/${user.uid}`)) as Observable<Profile>;
      })
    ).subscribe({
      next: (profile) => {
        if (profile) {
          this.logService.log('Firestore Profile loaded:', profile.role);
          this.profileSignal.set(profile);
        }
      },
      error: (err) => this.logService.error('Error in Auth Listener:', err)
    });
  }

  async signIn(email: string, password: string) {
    try {
      this.logService.log('Attempting Firebase Sign In:', email);
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      this.logService.log('Sign In successful');
      return credential;
    } catch (err: any) {
      this.logService.error('Sign In failed:', err);
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async signOut() { // Renamed from logout to signOut for compatibility if needed
    try {
      await signOut(this.auth);
      this.userSignal.set(null);
      this.profileSignal.set(null);
      this.router.navigate(['/login']);
      this.logService.log('Logged out from Firebase');
    } catch (err: any) {
      this.logService.error('Logout failed:', err);
      throw err;
    }
  }

  // Compatibility helper for waitForAuthInit if needed by old guards (though I updated them)
  async waitForAuthInit(): Promise<void> {
    return Promise.resolve(); // Initial state is already handled by authState observable subscription
  }

  // RBAC Helpers
  canEdit(): boolean {
    const role = this.currentRole();
    return role === 'admin' || role === 'manager';
  }

  canDelete(): boolean {
    return this.currentRole() === 'admin';
  }

  isAdmin(): boolean {
    return this.currentRole() === 'admin';
  }
}
