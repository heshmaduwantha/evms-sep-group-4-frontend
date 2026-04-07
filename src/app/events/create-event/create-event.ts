import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CreateEventComponent implements OnInit, AfterViewInit {

  map!: L.Map;
  marker!: L.Marker;

  eventId: string | null = null;
  searchText: string = '';
  pendingLocation: string = '';

  eventData = {
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    volunteersRequired: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  // =========================
  // INIT
  // =========================
  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.eventId = id;

      this.eventService.getEventById(this.eventId)
        .subscribe((event: any) => {

          this.eventData.title = event.title;
          this.eventData.description = event.description;
          this.eventData.eventDate = event.date;
          this.eventData.eventTime = event.time;
          this.eventData.location = event.location;
          this.eventData.volunteersRequired = event.volunteersNeeded;

          this.searchText = this.eventData.location;
          this.pendingLocation = this.eventData.location;

          this.cdr.detectChanges();
        });
    }
  }

  ngAfterViewInit() {
    this.initMap();

    // Load location after map is ready
    if (this.pendingLocation) {
      this.loadLocationOnMap(this.pendingLocation);
    }
  }

  // =========================
  // MAP INIT
  // =========================
  initMap() {

    this.map = L.map('map').setView([6.9271, 79.8612], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {

      const { lat, lng } = e.latlng;

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      this.marker = L.marker([lat, lng]).addTo(this.map);

      // immediate fallback
      this.eventData.location = `${lat}, ${lng}`;

      // get readable address
      this.getAddressFromCoords(lat, lng);
    });
  }

  // =========================
  // SEARCH LOCATION
  // =========================
  searchLocation() {

    if (!this.searchText) {
      this.snackBar.open('Please enter a location', 'Close', { duration: 3000 });
      return;
    }

    const query = encodeURIComponent(this.searchText);

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=lk&limit=5`)
      .then(res => res.json())
      .then(data => {

        if (!data || data.length === 0) {
          this.snackBar.open('Location not found', 'Close', { duration: 3000 });
          return;
        }

        const result = data[0];

        this.searchText = result.display_name;
        this.eventData.location = result.display_name;  // 
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        this.map.setView([lat, lon], 16);

        if (this.marker) {
          this.map.removeLayer(this.marker);
        }

        this.marker = L.marker([lat, lon]).addTo(this.map);
      })
      .catch(err => {
        console.error(err);
        this.snackBar.open('Search failed', 'Close', { duration: 3000 });
      });
  }

  // =========================
  // LOAD EXISTING LOCATION (EDIT)
  // =========================
  loadLocationOnMap(location: string) {

    const query = encodeURIComponent(location);

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then(res => res.json())
      .then(data => {

        if (data && data.length > 0) {

          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          this.map.setView([lat, lon], 16);

          if (this.marker) {
            this.map.removeLayer(this.marker);
          }

          this.marker = L.marker([lat, lon]).addTo(this.map);
        }
      });
  }

  // =========================
  // REVERSE GEOCODE
  // =========================
  getAddressFromCoords(lat: number, lng: number) {

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {

        if (data && data.display_name) {
          this.eventData.location = data.display_name;
          this.searchText = data.display_name;
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  // =========================
  // SUBMIT
  // =========================
  submitEvent() {

    if (!this.eventData.title ||
      !this.eventData.eventDate ||
      !this.eventData.eventTime ||
      !this.eventData.location ||
      this.eventData.volunteersRequired <= 0) {

      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000
      });
      return;
    }
    const payload = {
      title: this.eventData.title,
      description: this.eventData.description,
      date: this.eventData.eventDate,
      time: this.eventData.eventTime.length === 5
        ? this.eventData.eventTime + ':00'
        : this.eventData.eventTime,
      location: this.eventData.location,
      volunteersNeeded: Number(this.eventData.volunteersRequired),
      status: 'upcoming'
    };


    // ONLY for create
    if (!this.eventId) {
      (payload as any).status = 'upcoming';
    }

    if (this.eventId) {

      this.eventService.updateEvent(this.eventId, payload)
        .subscribe({
          next: () => {
            this.snackBar.open('Event updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/organizer/events']);
          },
          error: () => {
            this.snackBar.open('Update failed', 'Close', { duration: 3000 });
          }
        });

    } else {

      this.eventService.createEvent(payload)
        .subscribe({
          next: () => {
            this.snackBar.open('Event created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/organizer/events']);
          },
          error: () => {
            this.snackBar.open('Creation failed', 'Close', { duration: 3000 });
          }
        });
    }
  }

  cancelEvent() {
    this.router.navigate(['/organizer/events']);
  }
}