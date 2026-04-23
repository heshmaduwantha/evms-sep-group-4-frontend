import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ManualCheckinComponent } from './pages/manual-checkin/manual-checkin.component';
import { QrScannerComponent } from './pages/qr-scanner/qr-scanner.component';
import { AuthGuard } from './auth/auth.guard';


import { VolunteerListComponent } from './volunteer/components/volunteer-list/volunteer-list.component';
import { VolunteerFormComponent } from './volunteer/components/volunteer-form/volunteer-form.component';
import { VolunteerDetailComponent } from './volunteer/components/volunteer-detail/volunteer-detail.component';
import { VolunteerEditComponent } from './volunteer/components/volunteer-edit/volunteer-edit.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [

     
      { path: 'home', component: HomeComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'attendance', component: AttendanceComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'manual-checkin', component: ManualCheckinComponent },
      { path: 'qr-scanner', component: QrScannerComponent },

      
      { path: 'volunteers', component: VolunteerListComponent },
      { path: 'volunteers/register', component: VolunteerFormComponent },
      { path: 'volunteers/:id', component: VolunteerDetailComponent },
      { path: 'volunteers/edit/:id', component: VolunteerEditComponent },

     
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then(m => m.AuthModule)
  },

  
  { path: '**', redirectTo: 'home' }
];