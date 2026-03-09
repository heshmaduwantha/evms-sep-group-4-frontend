import { Routes } from '@angular/router';
import { OrganizerDashboardComponent } from './organizer/dashboard/organizer-dashboard';
import { CreateEventComponent } from './events/create-event/create-event';
import { EventListComponent } from './events/event-list/event-list';

export const routes: Routes = [

  {
    path: 'organizer',
    component: OrganizerDashboardComponent,
    children: [

      {
        path: 'events',
        component: EventListComponent
      },

      {
        path: 'create-event',
        component: CreateEventComponent
      },

      {
        path: 'create-event/:id',
        component: CreateEventComponent
      },

      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      }

    ]
  },

  {
    path: '',
    redirectTo: 'organizer/events',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'organizer/events'
  }

];