import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';


@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css']
  })
export class EventListComponent implements OnInit {

  allEvents: any[] = [];
  filteredEvents: any[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 3;
  paginatedEvents: any[] = [];

  loading = true;
  today: string = new Date().toISOString().split('T')[0];

  selectedStatus: string = 'all';
  searchTerm: string = '';

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

      console.log("RAW API RESPONSE:", data);


      if (Array.isArray(data)) {
        this.allEvents = data;
      } else if (Array.isArray(data?.data)) {
        this.allEvents = data.data;
      } else if (Array.isArray(data?.events)) {
        this.allEvents = data.events;
      } else {
        console.error("Invalid response:", data);
        this.allEvents = [];
      }

      console.log("MAPPED EVENTS:", this.allEvents);

      this.applyFilters();

      this.loading = false;
      this.cdr.markForCheck();

    });
  }


  applyFilters() {

    if (!this.allEvents || this.allEvents.length === 0) {
      this.filteredEvents = [];
      this.paginatedEvents = [];
      return;
    }
    let filtered = this.allEvents;

    const term = this.searchTerm?.toLowerCase().trim();
    const today = this.today;

    // SEARCH
    if (term) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    }

    // STATUS
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(event => {

        if (!event.eventDate) return false;

        if (event.status === 'CANCELLED') {
          return this.selectedStatus === 'cancelled';
        }

        if (this.selectedStatus === 'upcoming') {
          return event.eventDate > today;
        }

        if (this.selectedStatus === 'ongoing') {
          return event.eventDate === today;
        }

        if (this.selectedStatus === 'completed') {
          return event.eventDate < today;
        }

        return false;
      });
    }

    this.filteredEvents = filtered;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.currentPage = this.totalPages === 0 ? 1 : Math.min(this.currentPage, this.totalPages);
    this.paginate();
  }


  searchTimeout: any;

  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.applyFilters();
    }, 150);
  }


  filterStatus(status: string) {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  editEvent(id: string) {
    this.router.navigate(['/organizer/events/edit', id]);
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

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eventService.deleteEvent(id).subscribe(() => {
          this.loadEvents();
        });
      }
    });
  }

  cancelEvent(event: any) {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Event Confirmation',
        message: 'Are you sure you want to cancel this event?',
        confirmText: 'Yes, Cancel',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.eventService.cancelEvent(event.id, event).subscribe(() => {
          this.loadEvents();
        });
      }
    });
  }

  paginate() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedEvents = this.filteredEvents.slice(start, end);
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }
  trackByEventId(index: number, event: any): string {
    return event.id;
  }

  getEventCount(type: string): number {
    const today = this.today;

    return this.allEvents?.filter(event => {

      if (!event.eventDate) return false;

      if (event.status === 'CANCELLED') {
        return type === 'Cancelled';
      }

      if (type === 'Upcoming') {
        return event.eventDate > today;
      }

      if (type === 'Ongoing') {
        return event.eventDate === today;
      }

      if (type === 'Completed') {
        return event.eventDate < today;
      }

      return false;

    }).length || 0;
  }

  viewEvent(id: string) {
    this.router.navigate(['/organizer/events', id]);
  }




}