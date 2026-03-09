import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-list.html'
})
export class EventListComponent implements OnInit {

  events: any[] = [];

  constructor(
    private router: Router,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {

  console.log("Loading events...");

  this.eventService.getEvents().subscribe((data:any) => {

    console.log("Events from backend:", data);

    this.events = data;

    console.log("events length:", this.events.length);

    this.cdr.detectChanges();   // Force Angular to update the template

  });

}

  editEvent(id: string) {
    this.router.navigate(['/organizer/create-event', id]);
  }

  deleteEvent(id: string) {

    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    this.eventService.deleteEvent(id).subscribe(() => {
      this.loadEvents();   // reload list after delete

    });

  }

}