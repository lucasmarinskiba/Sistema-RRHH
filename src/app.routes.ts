
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';
import { EmployeeManagerComponent } from './components/employee-manager.component';
import { ProjectManagerComponent } from './components/project-manager.component';
import { DocumentManagerComponent } from './components/document-manager.component';
import { AttendanceComponent } from './components/attendance.component';
import { PayrollComponent } from './components/payroll.component';
import { AuthComponent } from './components/auth.component';
import { AuditLogComponent } from './components/audit-log.component';
import { NewsExpirationsComponent } from './components/news-expirations.component';
import { KpiDashboardComponent } from './components/kpi-dashboard.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'employees', component: EmployeeManagerComponent },
  { path: 'projects', component: ProjectManagerComponent },
  { path: 'documents', component: DocumentManagerComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'payroll', component: PayrollComponent },
  { path: 'audit', component: AuditLogComponent },
  { path: 'alerts', component: NewsExpirationsComponent },
  { path: 'kpis', component: KpiDashboardComponent },
];
