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
        // Use 'all' for the overall attendance overview
        this.eventId = 'all';
        this.loadAttendanceData();
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.errorMessage = 'Failed to load events';
      }
    });
  }

  loadAttendanceData() {
    // 1. Load Stats Card Data
    this.attendanceService.getAttendanceOverview(this.eventId).subscribe({
      next: (data) => this.attendanceData = data,
      error: (err) => console.error('Error loading overview:', err)
    });

    // 2. Load Roster and Event Counts
    this.eventCounts = [];
    this.attendanceService.getVolunteerRoster(this.eventId).subscribe({
      next: (data) => {
        this.volunteerRoster = data.map(v => ({ 
          ...v, 
          eventName: v.eventId ? this.getEventName(v.eventId) : 'All Events' 
        }));
        
        // Calculate event counts from the aggregate roster
        const countsMap = new Map<string, number>();
        this.events.forEach(e => countsMap.set(e.title, 0));
        
        this.volunteerRoster.forEach(v => {
          if (v.eventId) {
            const eName = this.getEventName(v.eventId);
            countsMap.set(eName, (countsMap.get(eName) || 0) + 1);
          }
        });

        this.eventCounts = Array.from(countsMap.entries()).map(([title, count]) => ({ title, count }));
      },
      error: (err) => console.error('Error loading roster:', err)
    });

    // 3. Load Recent Check-ins
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

  getEventName(eventId: string): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  }
}
