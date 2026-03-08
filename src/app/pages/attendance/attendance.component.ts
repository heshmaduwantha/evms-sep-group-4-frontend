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
    totalVolunteers: 45,
    checkedIn: 38,
    lateArrivals: 5,
    absent: 2,
    attendanceRate: 84
  };

  volunteerRoster: any[] = [
    { id: 1, name: 'Sarah Johnson', role: 'Team Lead', status: 'present' },
    { id: 2, name: 'Michael Chen', role: 'Volunteer', status: 'present' },
    { id: 3, name: 'Emily Rodriguez', role: 'Volunteer', status: 'late' },
    { id: 4, name: 'David Thompson', role: 'Coordinator', status: 'present' },
    { id: 5, name: 'Jessica Williams', role: 'Volunteer', status: 'present' },
    { id: 6, name: 'Robert Martinez', role: 'Volunteer', status: 'absent' },
    { id: 7, name: 'Lisa Anderson', role: 'Team Lead', status: 'present' },
    { id: 8, name: 'James Wilson', role: 'Volunteer', status: 'late' },
    { id: 9, name: 'Maria Garcia', role: 'Volunteer', status: 'present' },
    { id: 10, name: 'Christopher Lee', role: 'Volunteer', status: 'present' },
  ];

  recentCheckIns: any[] = [
    { id: 1, name: 'Sarah Johnson', time: '08:45 AM', status: 'present', method: 'QR Scanner' },
    { id: 2, name: 'Michael Chen', time: '08:52 AM', status: 'present', method: 'Manual' },
    { id: 3, name: 'David Thompson', time: '09:02 AM', status: 'present', method: 'QR Scanner' },
    { id: 4, name: 'Jessica Williams', time: '09:15 AM', status: 'present', method: 'Manual' },
    { id: 5, name: 'Maria Garcia', time: '09:28 AM', status: 'present', method: 'QR Scanner' },
  ];

  showQRScanner = false;
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
    // Using dummy data - would call service in production
    // this.attendanceService.getAttendanceOverview(this.eventId).subscribe(data => {
    //   this.attendanceData = data;
    // });
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
