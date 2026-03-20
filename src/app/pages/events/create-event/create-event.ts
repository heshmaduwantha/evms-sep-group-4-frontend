import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css']
})

export class CreateEventComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  eventId: string | null = null;

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
          this.eventData.volunteersNeeded = event.volunteersNeeded;
          this.cdr.detectChanges();
        });

    }

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