import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event } from '../event.models';

@Component({
  selector: 'app-events-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events-hub.html',
  styleUrls: ['./events-hub.css']
})
export class EventsHubComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  stats: any = {
    totalEvents: 0,
    upcomingEvents: 0,
    activeEvents: 0,
    completedEvents: 0
  };

  constructor(
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadEvents();
    this.loadStats();
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getEvents().subscribe((data: Event[]) => {
      this.events = data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  loadStats() {
    this.eventService.getStats().subscribe(stats => {
      this.stats = stats;
      this.cdr.detectChanges();
    });
  }

  getEventStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
