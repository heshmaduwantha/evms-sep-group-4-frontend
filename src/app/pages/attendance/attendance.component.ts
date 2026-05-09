import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from './attendance.service';
import { TooltipModule } from 'primeng/tooltip';
import { Observable, forkJoin, of, Subscription } from 'rxjs';
import { catchError, retry, take, tap } from 'rxjs/operators';
import { EventService } from '../events/services/event.service';
import { Event } from '../events/event.models';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, TooltipModule, FormsModule, SelectModule, ButtonModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  events: Event[] = [];
  
  attendanceData: any = {
    totalVolunteers: 0,
    checkedIn: 0,
    lateArrivals: 0,
    absent: 0,
    attendanceRate: 0
  };

  volunteerRoster: any[] = [];
  recentCheckIns: any[] = [];
  showQRScanner = false;
  loading = true;
  eventId: string = 'all';
  private dataLoaded = false;
  private subscription: Subscription | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.loadAttendanceData();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (events: Event[]) => {
        this.events = events;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading events:', err);
      }
    });
  }


  onEventChange() {
    this.loadAttendanceData();
  }

  getEventTitle(eventId: string): string {
    if (!eventId) return 'All Events';
    const event = this.events.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  loadAttendanceData() {
    this.loading = true;
    
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Use forkJoin to load all data atomically
    this.subscription = forkJoin({
      overview: this.attendanceService.getAttendanceOverview(this.eventId).pipe(
        take(1),
        retry(1),
        catchError(() => of({ totalVolunteers: 0, checkedIn: 0, lateArrivals: 0, absent: 0, attendanceRate: 0, eventStats: [] }))
      ),
      roster: this.attendanceService.getVolunteerRoster(this.eventId).pipe(
        take(1),
        retry(1),
        catchError(() => of([]))
      ),
      recentCheckins: this.attendanceService.getRecentCheckIns(this.eventId).pipe(
        take(1),
        retry(1),
        catchError(() => of([]))
      )
    }).subscribe({
      next: (results) => {
        this.attendanceData = results.overview;
        this.volunteerRoster = results.roster;
        this.recentCheckIns = results.recentCheckins;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Attendance Load Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  refreshData() {
    this.dataLoaded = false;
    this.loadAttendanceData();
  }

  toggleQRScanner() {
    this.showQRScanner = !this.showQRScanner;
  }

  openFullScanner() {
    this.showQRScanner = true;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'present':
        return 'status-present';
      case 'late':
        return 'status-late';
      case 'absent':
        return 'status-absent';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      default:
        return status;
    }
  }

  checkIn(volunteer: any) {
    if (!volunteer.eventId || volunteer.eventId === 'all') {
      alert('Please select a specific event to check in.');
      return;
    }
    
    this.loading = true;
    this.attendanceService.checkIn(volunteer.id, volunteer.eventId).subscribe({
      next: () => {
        this.loadAttendanceData();
      },
      error: (err) => {
        console.error('Check-in failed:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}


