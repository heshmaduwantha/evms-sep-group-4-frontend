import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ManualCheckinComponent } from './pages/manual-checkin/manual-checkin.component';
import { AuthGuard } from './auth/auth.guard';
import { EventListComponent } from './pages/events/event-list/event-list';
import { CreateEventComponent } from './pages/events/create-event/create-event';
import { EventDetails } from './pages/events/event-details/event-details';
import { EventsHubComponent } from './pages/events/events-hub/events-hub';
import { ApplicationManagementComponent } from './pages/applications/application-management.component';
import { MyApplicationsComponent } from './pages/applications/my-applications.component';


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
            { path: 'home', component: HomeComponent, data: { breadcrumb: 'Dashboard' } },
            { path: 'settings', component: SettingsComponent, data: { breadcrumb: 'Settings' } },
            { path: 'events', component: EventsHubComponent, data: { breadcrumb: 'Events Hub' } },
            { path: 'organizer/events', component: EventListComponent, data: { breadcrumb: 'Event Manager' } },
            { path: 'organizer/create-event', component: CreateEventComponent, data: { breadcrumb: 'Create Event' } },
            { path: 'organizer/create-event/:id', component: CreateEventComponent, data: { breadcrumb: 'Edit Event' } },
            { path: 'events/:id', component: EventDetails, data: { breadcrumb: 'Event Details' } },
            { path: 'reports', component: ReportsComponent, data: { breadcrumb: 'Reports' } },
            { path: 'attendance', component: AttendanceComponent, data: { breadcrumb: 'Attendance Overview' } },
            { path: 'manual-checkin', component: ManualCheckinComponent, data: { breadcrumb: 'Manual Check-in' } },
            { path: 'applications', component: ApplicationManagementComponent, data: { breadcrumb: 'Applications' } },
            { path: 'my-applications', component: MyApplicationsComponent, data: { breadcrumb: 'My Applications' } },
            
            // Volunteer routes
            { path: 'volunteers', component: VolunteerListComponent, data: { breadcrumb: 'Volunteers' } },
            { path: 'volunteers/register', component: VolunteerFormComponent, data: { breadcrumb: 'Register Volunteer' } },
            { path: 'volunteers/:id', component: VolunteerDetailComponent, data: { breadcrumb: 'Volunteer Details' } },
            { path: 'volunteers/edit/:id', component: VolunteerEditComponent, data: { breadcrumb: 'Edit Volunteer' } },

            {
                path: 'roles',
                loadChildren: () => import('./pages/roles/roles.routes').then(m => m.ROLES_ROUTES),
            },

            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    { path: '**', redirectTo: 'home' }
];
