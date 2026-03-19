import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from './attendance.service';
import { EventService } from '../events/event.service';
import { Event } from '../events/event.models';

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

  events: Event[] = [];
  eventCounts: { title: string, count: number }[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        if (this.events.length > 0) {
          this.eventId = this.events[0].id; // Default for overview
          this.loadAttendanceData();
        }
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.errorMessage = 'Failed to load events';
      }
    });
  }

  loadAttendanceData() {
    this.attendanceService.getAttendanceOverview(this.eventId).subscribe({
      next: (data) => this.attendanceData = data,
      error: (err) => console.error('Error loading overview:', err)
    });

    // Load global roster or aggregate rosters
    this.volunteerRoster = [];
    this.eventCounts = [];
    
    this.events.forEach(event => {
      this.attendanceService.getVolunteerRoster(event.id).subscribe({
        next: (data) => {
          // Fix: Filter strictly by event.id to ensure each volunteer belongs to this event
          const filteredData = data.filter((v: any) => v.eventId === event.id);
          
          this.eventCounts.push({ title: event.title, count: filteredData.length });
          const enrichedData = filteredData.map(v => ({ ...v, eventName: event.title }));
          this.volunteerRoster = [...this.volunteerRoster, ...enrichedData];
        },
        error: (err) => console.error(`Error loading roster for ${event.title}:`, err)
      });
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

  getAvatarColor(name: string): string {
    const colors = [
      '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55',
      '#AF52DE', '#FF375F', '#BF5AF2', '#64D2FF', '#30D158', '#FF9F0A', '#FF453A'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
