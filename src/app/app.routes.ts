import { Routes } from '@angular/router';
import { OrganizerDashboardComponent } from './organizer/dashboard/organizer-dashboard';
import { EventListComponent } from './events/event-list/event-list';
import { OrganizerLayoutComponent } from './layouts/organizer-layout/organizer-layout';
import { EventDetailsComponent } from './events/event-details/event-details';

export const routes: Routes = [
  {
    path: 'organizer',
    component: OrganizerLayoutComponent,
    children: [

      { path: 'dashboard', component: OrganizerDashboardComponent },
      {
        path: 'events',
        children: [
          { path: '', component: EventListComponent },
          {
            path: 'create-event',
            loadComponent: () =>
              import('./events/create-event/create-event')
                .then(m => m.CreateEventComponent)
          },

          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./events/create-event/create-event')
                .then(m => m.CreateEventComponent)
          },

          {
            path: 'details/:id',
            loadComponent: () =>
              import('./events/event-details/event-details')
                .then(m => m.EventDetailsComponent)
          },

          { path: '**', redirectTo: '' }
        ]
      },

      { path: 'applications', component: EventListComponent }, // TEMP FIX
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }]
