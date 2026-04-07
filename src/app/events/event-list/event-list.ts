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
  paginatedEvents: any[] = [];

  totalPages = 0;
  currentPage = 1;
  itemsPerPage = 3;

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

  // LOAD EVENTS
  loadEvents() {
    this.loading = true;

    this.eventService.getEvents().subscribe((data: any) => {

      this.allEvents = (Array.isArray(data) ? data :
        Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.events) ? data.events : []
      ).map((event: any) => ({

        id: event.id,
        title: event.title,
        description: event.description,

        // FORCE CONSISTENCY
        date: event.date || event.eventDate,
        time: event.time || event.eventTime,
        location: event.location,

        volunteersNeeded:
          event.volunteersNeeded ??
          event.volunteersRequired ??
          0,

        status: (event.status || 'upcoming').toLowerCase(),

        // optional but useful
        assigned: event.assignedVolunteers ?? 0

      }));

      this.applyFilters();

      this.loading = false;
      this.cdr.markForCheck();
      console.log("FINAL EVENTS:", this.allEvents);
    });
  }

  // FILTER + SEARCH + STATUS

  applyFilters() {
    if (!this.allEvents || this.allEvents.length === 0) {
      this.filteredEvents = [];
      this.paginatedEvents = [];
      return;
    }

    let filtered = this.allEvents;

    const term = this.searchTerm?.toLowerCase().trim();
    const todayDate = new Date(this.today);
    todayDate.setHours(0, 0, 0, 0);

    // SEARCH
    if (term) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    }

    // STATUS FILTER
    if (this.selectedStatus !== 'all') {

      filtered = filtered.filter(event => {

        if (!event.date) return false;

        const eventDate = new Date(event.date + 'T00:00:00');
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (event.status === 'cancelled') {
          return this.selectedStatus === 'cancelled';
        }

        if (this.selectedStatus === 'upcoming') {
          return eventDate > todayDate;
        }

        if (this.selectedStatus === 'ongoing') {
          return eventDate.getTime() === todayDate.getTime();
        }

        if (this.selectedStatus === 'completed') {
          return eventDate < todayDate;
        }

        return false;
      });

    }
    this.filteredEvents = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = this.totalPages === 0 ? 1 : Math.min(this.currentPage, this.totalPages);

    this.paginate();
  }


  // SEARCH DEBOUNCE
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


  // PAGINATION
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

  // COUNTS (FIXED)
  getEventCount(type: string): number {

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    return this.allEvents?.filter(event => {

      if (!event.date) return false;

      const eventDate = new Date(event.date + 'T00:00:00');
      eventDate.setHours(0, 0, 0, 0);

      if (event.status?.toLowerCase() === 'cancelled') {
        return type === 'Cancelled';
      }

      if (type === 'Upcoming') {
        return eventDate > todayDate;
      }

      if (type === 'Ongoing') {
        return eventDate.getTime() === todayDate.getTime();
      }

      if (type === 'Completed') {
        return eventDate < todayDate;
      }

      return false;

    }).length || 0;
  }

  // ACTIONS
  editEvent(id: string) {
    this.router.navigate(['/organizer/events/edit', id]);
  }

  viewEvent(id: string) {
    console.log("NAVIGATING TO:", id);
    this.router.navigate(['/organizer/events/details', id]);
  }

  deleteEvent(id: string) {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Event',
        message: 'Are you sure?',
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.deleteEvent(id).subscribe(() => this.loadEvents());
      }
    });
  }

  cancelEvent(event: any) {

    console.log("CANCEL CLICKED", event);

    this.eventService.cancelEvent(event.id).subscribe({
      next: (res) => {
        console.log("CANCEL SUCCESS", res);
        this.loadEvents();
      },
      error: (err) => {
        console.error("CANCEL ERROR", err);
      }
    });

  }
}