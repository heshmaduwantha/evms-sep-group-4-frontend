import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { AuthService } from '../../../auth/auth.service';
import * as L from 'leaflet';

// Fix for default leaflet marker icon not loading
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css']
})

export class CreateEventComponent implements OnInit, AfterViewInit {
  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  eventId: string | null = null;
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  searchQuery: string = '';

  eventData = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    volunteersNeeded: 0
  };

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.eventId = id;
      console.log("Edit mode for event:", this.eventId);

      this.eventService.getEventById(this.eventId)
        .subscribe((event: any) => {

          console.log("Event loaded:", event);

          this.eventData.title = event.title;
          this.eventData.description = event.description;
          this.eventData.date = event.date;
          this.eventData.time = event.time;
          this.eventData.location = event.location;
          this.searchQuery = event.location;
          this.eventData.volunteersNeeded = event.volunteersNeeded;
          this.cdr.detectChanges();
          
          if (this.searchQuery) {
             setTimeout(() => this.searchLocation(), 500);
          }
        });

    }

  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    this.map = L.map('event-map').setView([6.9271, 79.8612], 13); // Default to Colombo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setMarker(e.latlng.lat, e.latlng.lng);
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
  }

  private setMarker(lat: number, lng: number) {
    if (!this.map) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
    this.map.setView([lat, lng], 15);
  }

  private reverseGeocode(lat: number, lng: number) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.display_name) {
          this.eventData.location = data.display_name;
          this.searchQuery = data.display_name;
        }
      })
      .catch(err => console.error('Geocoding error:', err));
  }

  searchLocation() {
    if (!this.searchQuery) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          this.setMarker(lat, lon);
          this.eventData.location = result.display_name;
          this.searchQuery = result.display_name;
        } else {
          alert('Location not found. Please try a different search term.');
        }
      })
      .catch(err => console.error('Search error:', err));
  }
  submitEvent() {
    console.log("Event ID:", this.eventId);

    if (this.eventId) {
      console.log("Updating event...");

      this.eventService.updateEvent(this.eventId, {
        ...this.eventData,
        volunteersNeeded: Number(this.eventData.volunteersNeeded)
      })
        .subscribe({
          next: (response: any) => {
            console.log("Event updated:", response);
            alert("Event updated successfully");
            this.router.navigate(['/organizer/events']);
          },
          error: (err: any) => {
            console.error("Event update failed:", err);
            const message = err.error?.message || "Unknown error occurred";
            alert("Event update failed: " + (Array.isArray(message) ? message.join(', ') : message));
          }
        });

    } else {

      console.log("Creating new event...");

      // Get current user for organizerId
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        alert("Session expired. Please login again.");
        return;
      }

      // Ensure volunteersNeeded is a number
      const submissionData = {
        ...this.eventData,
        volunteersNeeded: Number(this.eventData.volunteersNeeded),
        organizerId: currentUser.id
      };

      console.log("Submitting with data:", submissionData);

      this.eventService.createEvent(submissionData)
        .subscribe({
          next: (response: any) => {
            console.log("Event created:", response);
            alert("Event created successfully");
            this.router.navigate(['/organizer/events']);
          },
          error: (err: any) => {
            console.error("Event creation failed:", err);
            const message = err.error?.message || "Unknown error occurred";
            alert("Event creation failed: " + (Array.isArray(message) ? message.join(', ') : message));
          }
        });

    }

  }
  cancelEvent() {
    this.router.navigate(['/organizer/events']);
  }

}