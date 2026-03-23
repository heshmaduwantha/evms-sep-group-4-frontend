import { Routes } from '@angular/router';
import { RoleDashboardComponent } from './role-dashboard.component';
import { RoleManagementComponent } from './role-management.component';

export const ROLES_ROUTES: Routes = [
  { path: '', component: RoleDashboardComponent, data: { breadcrumb: 'Roles' } },
  { path: 'event/:eventId', component: RoleManagementComponent, data: { breadcrumb: 'Role Management' } },
];
