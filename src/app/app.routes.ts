import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ManualCheckinComponent } from './pages/manual-checkin/manual-checkin.component';
import { AuthGuard } from './auth/auth.guard';
import { EventListComponent } from './pages/events/event-list.component';
import { EventManagementComponent } from './pages/events/event-management.component';
import { EventFormComponent } from './pages/events/event-form.component';
import { EventDetailsComponent } from './pages/events/event-details.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'events', component: EventListComponent },
            { path: 'events/manage', component: EventManagementComponent },
            { path: 'events/create', component: EventFormComponent },
            { path: 'events/edit/:id', component: EventFormComponent },
            { path: 'events/:id', component: EventDetailsComponent },
            { path: 'attendance', component: AttendanceComponent },
            { path: 'reports', component: ReportsComponent },
            { path: 'manual-checkin', component: ManualCheckinComponent },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    { path: '**', redirectTo: 'home' }
];
