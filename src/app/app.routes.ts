import { Routes } from '@angular/router';
import { OrganizerDashboardComponent } from './organizer/dashboard/organizer-dashboard';
import { CreateEventComponent } from './events/create-event/create-event';
import { EventListComponent } from './events/event-list/event-list';
import { OrganizerLayout } from './layouts/organizer-layout/organizer-layout';
import { EventDetailsComponent } from './events/event-details/event-details';

export const routes: Routes = [
  {
  path: 'organizer',
  component: OrganizerLayout,
  children: [

    { path: 'dashboard', component: OrganizerDashboardComponent },

    {
      path: 'events',
      children: [
        { path: '', component: EventListComponent },
        { path: 'create', component: CreateEventComponent },
        { path: 'edit/:id', component: CreateEventComponent },
        { path: 'details/:id', component: EventDetailsComponent }
      ]
    },

    { path: 'applications', component: EventListComponent }, // TEMP FIX

    { path: 'create-event', redirectTo: 'events/create', pathMatch: 'full' },

    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

  ]}]
