import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog';
import { routes } from './app.routes';

// Import your main components (adjust if needed)
import { EventListComponent } from './events/event-list/event-list';
import { CreateEventComponent } from './events/create-event/create-event';
import { EventDetailsComponent } from './events/event-details/event-details';
import { OrganizerLayoutComponent } from './layouts/organizer-layout/organizer-layout';
import { OrganizerDashboardComponent } from './organizer/dashboard/organizer-dashboard';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent,
    EventListComponent,
    OrganizerLayoutComponent,
    OrganizerDashboardComponent,
    ConfirmDialogComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }