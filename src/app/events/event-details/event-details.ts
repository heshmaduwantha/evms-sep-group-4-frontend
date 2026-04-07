import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '../services/event.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css'],
 
})
export class EventDetailsComponent implements OnInit {

  event: any = {};
  volunteers: any[] = [];

  loading = false;
  error: string | null = null;

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  mapUrl!: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        console.error('No Event ID found');
        return;
      }

      this.loadEvent(id);
    });
  }

  loadEvent(id: string) {
    this.loading = true;
    this.error = null;

    this.eventService.getEventById(id).subscribe({

      next: (res: any) => {
        const raw = res?.data || res?.event || res;

        //  MOCK VOLUNTEERS (TEMP)
        this.volunteers = [
          { name: 'John Doe', role: 'Team Lead', status: 'CONFIRMED' },
          { name: 'Alice Smith', role: 'Support', status: 'PENDING' }
        ];

        //  SET EVENT FIRST
        this.event = {
          id: raw.id,
          title: raw.title,
          description: raw.description,
          date: raw.date,
          time: raw.time,
          location: raw.location,
          volunteersNeeded: raw.volunteersNeeded || 0,
          assigned: this.volunteers.length,
          status: (raw.status || 'UPCOMING').toUpperCase()
        };

        //  BUILD MAP AFTER EVENT IS READY
        const query = this.event.location
          ? encodeURIComponent(this.event.location)
          : 'colombo';

        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.google.com/maps?q=${query}&output=embed`
        );

        this.loading = false;
      },

      error: (err) => {
        console.error(err);
        this.error = 'Failed to load event details';
        this.loading = false;
      }

    });
  }

  getEventStatus(): string {

    if (!this.event?.date) return '';

    const today = new Date();
    const eventDate = new Date(this.event.date);

    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (this.event.status === 'CANCELLED') return 'cancelled';

    if (eventDate > today) return 'upcoming';

    if (eventDate.getTime() === today.getTime()) return 'ongoing';

    if (eventDate < today) return 'completed';

    return '';
  }

  //  TOAST HANDLER
  showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  //  ACTIONS (TEMP)
  onEdit() {
    this.showToastMessage('Edit functionality coming soon');
  }

  onPublish() {
    this.showToastMessage('Event published successfully');
  }

  onDelete() {
    this.showToastMessage('Event deleted successfully');
  }

}