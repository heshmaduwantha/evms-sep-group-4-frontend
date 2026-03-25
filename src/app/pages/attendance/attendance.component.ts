import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceService } from './attendance.service';
import { TooltipModule } from 'primeng/tooltip';
import { catchError, forkJoin, of, retry } from 'rxjs';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit, AfterViewInit {
  eventId = 'all'; 
  
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
  private dataLoaded = false;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit() {
    // Load data immediately on init
    this.loadAttendanceData();
  }

  ngAfterViewInit() {
    // If data hasn't loaded yet by the time the view is ready, retry after a tick
    setTimeout(() => {
      if (!this.dataLoaded) {
        this.loadAttendanceData();
      }
    }, 300);
  }

  loadAttendanceData() {
    this.loading = true;

    // Use forkJoin to load all data atomically
    forkJoin({
      overview: this.attendanceService.getAttendanceOverview(this.eventId).pipe(
        retry(1),
        catchError(() => of({ totalVolunteers: 0, checkedIn: 0, lateArrivals: 0, absent: 0, attendanceRate: 0 }))
      ),
      roster: this.attendanceService.getVolunteerRoster(this.eventId).pipe(
        retry(1),
        catchError(() => of([]))
      ),
      recentCheckins: this.attendanceService.getRecentCheckIns(this.eventId).pipe(
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
      },
      error: () => {
        this.loading = false;
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
}

