import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '../services/event.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css']
})
export class EventDetailsComponent implements OnInit {

  event: any = {};
  volunteers: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      console.log("EVENT ID:", id);

      if (!id) {
        console.error("No Event ID found in route");
        return;
      }

      this.loadEvent(id);

    });

  }

  loadEvent(id: string) {
    this.event = {}; 

    this.eventService.getEventById(id).subscribe((res: any) => {

      console.log("FULL RESPONSE:", res);
      this.event = res?.data || res?.event || res;
      console.log("FINAL EVENT:", this.event);
      this.cdr.detectChanges();

      // mock volunteers (temporary)
      this.volunteers = [
        { name: 'John Doe', role: 'Team Lead', status: 'CONFIRMED' },
        { name: 'Alice Smith', role: 'Support', status: 'PENDING' }
      ];      

    });

  }
  getEventStatus(): string {

    if (!this.event?.eventDate) return '';

    const today = new Date().toISOString().split('T')[0];

    if (this.event.status === 'CANCELLED') {
      return 'cancelled';
    }

    if (this.event.eventDate > today) {
      return 'upcoming';
    }

    if (this.event.eventDate === today) {
      return 'ongoing';
    }

    if (this.event.eventDate < today) {
      return 'completed';
    }

    return '';
  }

}