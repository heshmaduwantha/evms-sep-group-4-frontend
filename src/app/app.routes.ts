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
        children: [
          { path: '', component: EventListComponent }, 
          { path: 'create', component: CreateEventComponent },
          { path: 'edit/:id', component: CreateEventComponent }
        ]
      },

      

    ]
  },

  { path: '', redirectTo: 'organizer', pathMatch: 'full' },
  { path: '**', redirectTo: 'organizer' }
];