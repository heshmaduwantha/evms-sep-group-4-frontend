import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ManualCheckinComponent } from './pages/manual-checkin/manual-checkin.component';
import { AuthGuard } from './auth/auth.guard';
import { EventListComponent } from './pages/events/event-list/event-list';
import { CreateEventComponent } from './pages/events/create-event/create-event';
import { EventDetails } from './pages/events/event-details/event-details';
import { EventsHubComponent } from './pages/events/events-hub/events-hub';
import { ApplicationManagementComponent } from './pages/applications/application-management.component';
import { MyApplicationsComponent } from './pages/applications/my-applications.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'events', component: EventsHubComponent },
            { path: 'organizer/events', component: EventListComponent },
            { path: 'organizer/create-event', component: CreateEventComponent },
            { path: 'organizer/create-event/:id', component: CreateEventComponent },
            { path: 'events/:id', component: EventDetails },
            { path: 'attendance', component: AttendanceComponent },
            { path: 'reports', component: ReportsComponent },
            { path: 'manual-checkin', component: ManualCheckinComponent },
            { path: 'applications', component: ApplicationManagementComponent },
            { path: 'my-applications', component: MyApplicationsComponent },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    { path: '**', redirectTo: 'home' }
];
