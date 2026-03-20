import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css']
})
export class EventListComponent implements OnInit {

  events: any[] = [];
  allEvents: any[] = [];
  loading = true;
  today: string = new Date().toISOString().split('T')[0];
  selectedStatus: string = 'all';

  constructor(
    private router: Router,
    private eventService: EventService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;

    this.eventService.getEvents().subscribe((data: any) => {
      this.allEvents = data;
      this.events = data;
      this.loading = false;

      this.cdr.detectChanges();
    });
  }

  editEvent(id: string) {
    this.router.navigate(['/organizer/create-event', id]);
  }

  deleteEvent(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        title: 'Delete Event Confirmation',
        message: 'Are you sure you want to delete this event?',
        confirmText: 'Yes, Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.deleteEvent(id).subscribe(() => {
          this.loadEvents();
        });
      }
    });
  }

  cancelEvent(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Event Confirmation',
        message: 'Are you sure you want to cancel this event?',
        confirmText: 'Yes, Cancel',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.cancelEvent(id).subscribe(() => {
          this.loadEvents();
        });
      }
    });
  }

  filterStatus(status: string) {
    this.selectedStatus = status;

    if (status === 'all') {
      this.events = this.allEvents;
      return;
    }

    const today = this.today;

    this.events = this.allEvents.filter(event => {

      if (!event.eventDate) return false;

      if (event.status === 'CANCELLED') {
        return status === 'cancelled';
      }

      if (status === 'upcoming') {
        return event.eventDate > today;
      }

      if (status === 'ongoing') {
        return event.eventDate === today;
      }

      if (status === 'completed') {
        return event.eventDate < today;
      }

      return false;
    });
  }

}