import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css']
})

export class CreateEventComponent implements OnInit {
  constructor(
  private route: ActivatedRoute,
  private eventService: EventService,
  private router: Router,
  private cdr: ChangeDetectorRef
) {} 

  eventId: string | null = null;

  eventData = {
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    volunteersRequired: 0
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
        this.eventData.eventDate = event.eventDate;
        this.eventData.eventTime = event.eventTime;
        this.eventData.location = event.location;
        this.eventData.volunteersRequired = event.volunteersRequired;
        this.cdr.detectChanges();
        });

  }

}

  submitEvent() {
    console.log("Event ID:", this.eventId);

    if (this.eventId) {
      console.log("Updating event...");

      this.eventService.updateEvent(this.eventId, this.eventData)
      .subscribe((response: any) => {
        console.log("Event updated:", response);
        alert("Event updated successfully");
        this.router.navigate(['/organizer/events']);
        });


        } else {

    console.log("Creating new event...");

    this.eventService.createEvent(this.eventData)
    .subscribe((response: any) => {
      console.log("Event created:", response);
      alert("Event created successfully");
      this.router.navigate(['/organizer/events']);
      });

  }

}
 cancelEvent() {
  this.router.navigate(['/organizer/events']);
}

}