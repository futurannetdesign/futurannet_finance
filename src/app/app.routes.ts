import { Routes } from '@angular/router';
import { CustomerListComponent } from './components/customers/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customers/customer-form/customer-form.component';
import { CustomerDetailComponent } from './components/customers/customer-detail/customer-detail.component';
import { AccountsReceivableListComponent } from './components/accounts-receivable/accounts-receivable-list/accounts-receivable-list.component';
import { AccountsReceivableFormComponent } from './components/accounts-receivable/accounts-receivable-form/accounts-receivable-form.component';
import { AccountsReceivableDetailComponent } from './components/accounts-receivable/accounts-receivable-detail/accounts-receivable-detail.component';
import { AccountsPayableListComponent } from './components/accounts-payable/accounts-payable-list/accounts-payable-list.component';
import { AccountsPayableFormComponent } from './components/accounts-payable/accounts-payable-form/accounts-payable-form.component';
import { AccountsPayableDetailComponent } from './components/accounts-payable/accounts-payable-detail/accounts-payable-detail.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/auth/login/login.component';
import { UsersComponent } from './components/users/users.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuard] },
  { path: 'customers/new', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id/edit', component: CustomerFormComponent, canActivate: [AuthGuard] },
  { path: 'customers/:id', component: CustomerDetailComponent, canActivate: [AuthGuard] },
  { path: 'accounts-receivable', component: AccountsReceivableListComponent, canActivate: [AuthGuard] },
  { path: 'accounts-receivable/new', component: AccountsReceivableFormComponent, canActivate: [AuthGuard] },
  { path: 'accounts-receivable/:id/edit', component: AccountsReceivableFormComponent, canActivate: [AuthGuard] },
  { path: 'accounts-receivable/:id', component: AccountsReceivableDetailComponent, canActivate: [AuthGuard] },
  { path: 'accounts-payable', component: AccountsPayableListComponent, canActivate: [AuthGuard] },
  { path: 'accounts-payable/new', component: AccountsPayableFormComponent, canActivate: [AuthGuard] },
  { path: 'accounts-payable/:id/edit', component: AccountsPayableFormComponent, canActivate: [AuthGuard] },
  { path: 'accounts-payable/:id', component: AccountsPayableDetailComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AdminGuard] },
  { path: 'audit-log', component: AuditLogComponent, canActivate: [AdminGuard] }
];

