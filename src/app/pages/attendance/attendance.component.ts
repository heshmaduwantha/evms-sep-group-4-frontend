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
  deleteConfirmId: string | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(private attendanceService: AttendanceService) { }

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
    if (!this.editingCheckIn || !this.editingCheckIn.id) return;

    this.attendanceService.updateCheckIn(this.editingCheckIn.id, this.editingCheckIn).subscribe({
      next: (res) => {
        this.successMessage = `${this.editingCheckIn.name}'s check-in updated successfully`;
        this.refreshData();
        setTimeout(() => {
          this.closeEditModal();
        }, 1500);
      },
      error: (err) => {
        console.error('Error updating check-in:', err);
        this.errorMessage = 'Failed to update check-in';
      }
    });
  }

  openDeleteConfirm(id: string) {
    this.deleteConfirmId = id;
  }

  closeDeleteConfirm() {
    this.deleteConfirmId = null;
    this.errorMessage = '';
  }

  confirmDelete(id: string) {
    this.attendanceService.deleteCheckIn(id).subscribe({
      next: () => {
        const checkIn = this.recentCheckIns.find(c => c.id === id);
        this.errorMessage = checkIn ? `${checkIn.name}'s check-in removed` : 'Check-in removed';
        this.refreshData();
        setTimeout(() => {
          this.closeDeleteConfirm();
        }, 1500);
      },
      error: (err) => {
        console.error('Error deleting check-in:', err);
        this.errorMessage = 'Failed to delete record';
      }
    });
  }

  checkInVolunteer(volunteerId: string) {
    console.log('checkInVolunteer called for volunteerId:', volunteerId);
    const data = {
      volunteerId: volunteerId,
      eventId: this.eventId,
      status: 'present',
      timestamp: new Date()
    };

    console.log('Sending checkIn request to backend:', data);
    this.attendanceService.checkIn(this.eventId, data).subscribe({
      next: (res) => {
        console.log('checkIn response:', res);
        this.successMessage = 'Volunteer checked in successfully';
        this.refreshData();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error checking in (HTTP Error):', err);
        this.errorMessage = `Failed to check in volunteer: ${err.status} ${err.statusText || ''}`;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }
}
