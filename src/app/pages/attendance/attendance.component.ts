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

  editingCheckIn: any = null;
  showEditModal = false;
  deleteConfirmId: number | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit() {
    this.loadAttendanceData();
  }

  loadAttendanceData() {
    this.attendanceService.getAttendanceOverview(this.eventId).subscribe({
      next: (data) => this.attendanceData = data,
      error: (err) => console.error('Error loading overview:', err)
    });

    this.attendanceService.getVolunteerRoster(this.eventId).subscribe({
      next: (data) => this.volunteerRoster = data,
      error: (err) => console.error('Error loading roster:', err)
    });

    this.attendanceService.getRecentCheckIns(this.eventId).subscribe({
      next: (data) => this.recentCheckIns = data,
      error: (err) => console.error('Error loading recent checkins:', err)
    });
  }

  refreshData() {
    this.loadAttendanceData();
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
  openEditModal(checkIn: any) {
    this.editingCheckIn = { ...checkIn };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingCheckIn = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveEditCheckIn() {
    const index = this.recentCheckIns.findIndex(c => c.id === this.editingCheckIn.id);
    if (index > -1) {
      this.recentCheckIns[index] = { ...this.editingCheckIn };
      this.successMessage = `${this.editingCheckIn.name}'s check-in updated successfully`;
      setTimeout(() => {
        this.closeEditModal();
      }, 1500);
    }
  }

  openDeleteConfirm(id: number) {
    this.deleteConfirmId = id;
  }

  closeDeleteConfirm() {
    this.deleteConfirmId = null;
    this.errorMessage = '';
  }

  confirmDelete(id: number) {
    const checkIn = this.recentCheckIns.find(c => c.id === id);
    this.recentCheckIns = this.recentCheckIns.filter(c => c.id !== id);
    if (checkIn) {
      this.errorMessage = `${checkIn.name}'s check-in removed`;
      setTimeout(() => {
        this.closeDeleteConfirm();
        this.errorMessage = '';
      }, 1500);
    }
  }}
