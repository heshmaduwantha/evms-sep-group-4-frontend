import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '../services/event.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../auth/auth.service';
import * as L from 'leaflet';
import { ApplicationService } from '../../applications/application.service';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TagModule, CardModule, ToastModule],
  providers: [MessageService],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css'
})
export class EventDetails implements OnInit, AfterViewInit, OnDestroy {

  event: any;
  loading: boolean = false;
  hasApplied: boolean = false;
  userRole: string | null = null;
  map: L.Map | undefined;
  marker: L.Marker | undefined;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService,
    private applicationService: ApplicationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadEventData(id);
      }
    });
  }

  loadEventData(id: string) {
    console.log("Fetching ID:", id);
    
    this.eventService.getEventById(id).pipe(
      timeout(5000), // 5 second timeout
      catchError(err => {
        console.error("Timeout or Error:", err);
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        console.log("Data:", data);
        if (data) {
          this.event = data;
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Timeout', detail: 'Server is taking too long to respond.' });
        }
        this.loading = false;

        if (this.event && this.event.location) {
          setTimeout(() => this.initMap(this.event.location), 500);
        }

        if (this.authService.isVolunteer()) {
          this.checkApplicationStatus(id);
        }
      }
    });
  }

  checkApplicationStatus(eventId: string) {
    this.applicationService.getMyApplications().subscribe({
      next: (apps) => {
        this.hasApplied = apps.some(app => app.event.id === eventId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ongoing': return 'success';
      case 'upcoming': return 'info';
      case 'on hold': return 'warn';
      case 'completed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'info';
    }
  }



  ngAfterViewInit() { }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(location: string) {
    if (!location) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (this.map) {
            this.map.setView([lat, lon], 13);
            if (this.marker) this.marker.setLatLng([lat, lon]);
            else this.marker = L.marker([lat, lon]).addTo(this.map);
          } else {
            this.map = L.map('event-details-map').setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap'
            }).addTo(this.map);
            this.marker = L.marker([lat, lon]).addTo(this.map);
          }
        }
      }).catch(err => console.error('Map error:', err));
  }

  updateStatus(newStatus: string) {
    if (!this.event) return;
    
    this.eventService.updateEvent(this.event.id, { status: newStatus }).subscribe({
      next: (updatedEvent) => {
        this.event = updatedEvent;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Event status updated to ${newStatus}` });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update event status' });
      }
    });
  }
}