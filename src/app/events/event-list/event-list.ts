import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventService } from '../services/event.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-list.html',
  styleUrls: ['./event-list.css']
})
export class EventListComponent implements OnInit {

  allEvents: any[] = [];
  filteredEvents: any[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 5;
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
      this.allEvents = data;
      this.applyFilters();
      this.loading = false;
      this.cdr.detectChanges();
    });
  }


  applyFilters() {
    let filtered = this.allEvents;

    const term = this.searchTerm.toLowerCase();
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
    this.currentPage = 1;
    this.paginate();
  }


  onSearchChange() {
    this.applyFilters();
  }


  filterStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
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




}