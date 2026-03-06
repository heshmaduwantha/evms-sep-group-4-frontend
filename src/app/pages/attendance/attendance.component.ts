import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from './attendance.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  eventId = 'event-1'; // This would come from route params in production
  
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

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit() {
    this.loadAttendanceData();
  }

  loadAttendanceData() {
    this.attendanceService.getAttendanceOverview(this.eventId).subscribe(data => {
      this.attendanceData = data;
    });

    this.attendanceService.getVolunteerRoster(this.eventId).subscribe(data => {
      this.volunteerRoster = data;
    });

    this.attendanceService.getRecentCheckIns(this.eventId).subscribe(data => {
      this.recentCheckIns = data;
    });
  }

  refreshData() {
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
