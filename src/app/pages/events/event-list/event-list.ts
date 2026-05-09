import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css']
})
export class EventListComponent implements OnInit {

  events: any[] = [];
  loading = true;
  allEvents: any[] = [];
  today: string = new Date().toISOString().split('T')[0];
  selectedStatus: string = 'all';


  constructor(
    private router: Router,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {

    this.loading = true;

    console.log("Loading events...");
    this.eventService.getEvents().subscribe((data: any) => {

      console.log("Events from backend:", data);
      console.log("Statuses:", data.map((e: any) => e.status));
      this.allEvents = data;

      this.events = data;
      this.loading = false;
      console.log("events length:", this.events.length);
      this.cdr.detectChanges();

    });

  }

  editEvent(id: string) {
    this.router.navigate(['/organizer/create-event', id]);
  }

  viewEvent(id: string) {
    this.router.navigate(['/events', id]);
  }

  deleteEvent(id: string) {

    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    this.eventService.deleteEvent(id).subscribe(() => {
      this.loadEvents();   // reload list after delete

    });

  }

  cancelEvent(id: string) {

    if (!confirm('Are you sure you want to cancel this event?')) {
      return;
    }

    this.eventService.cancelEvent(id).subscribe(() => {
      this.loadEvents(); // refresh list
    });

  }


  filterStatus(status: string) {
    this.selectedStatus = status;

    if (status === 'all') {
      this.events = this.allEvents;
      return;
    }

    this.events = this.allEvents.filter(event => {
      const currentStatus = event.status?.toLowerCase();
      
      // Map 'active' to 'ongoing' if needed, or just match direct
      if (status === 'ongoing') {
        return currentStatus === 'ongoing' || currentStatus === 'active';
      }
      
      return currentStatus === status;
    });
    this.cdr.detectChanges();
  }

}


