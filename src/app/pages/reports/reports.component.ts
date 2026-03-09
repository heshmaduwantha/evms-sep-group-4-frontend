import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from './reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  eventId = 'event-1';
  
  filters = {
    status: 'all',
    department: 'all',
    date: new Date().toISOString().split('T')[0]
  };

  attendanceRecords: any[] = [
    { id: 1, name: 'Sarah Johnson', role: 'Team Lead', dept: 'Operations', status: 'present' },
    { id: 2, name: 'Michael Chen', role: 'Volunteer', dept: 'Front Desk', status: 'present' },
    { id: 3, name: 'Emily Rodriguez', role: 'Volunteer', dept: 'Safety', status: 'late' },
    { id: 4, name: 'David Thompson', role: 'Coordinator', dept: 'Operations', status: 'present' },
    { id: 5, name: 'Jessica Williams', role: 'Volunteer', dept: 'Guest Services', status: 'present' },
    { id: 6, name: 'Robert Martinez', role: 'Volunteer', dept: 'Technical', status: 'absent' },
    { id: 7, name: 'Lisa Anderson', role: 'Team Lead', dept: 'Operations', status: 'present' },
    { id: 8, name: 'James Wilson', role: 'Volunteer', dept: 'Front Desk', status: 'late' },
    { id: 9, name: 'Maria Garcia', role: 'Volunteer', dept: 'Guest Services', status: 'present' },
    { id: 10, name: 'Christopher Lee', role: 'Volunteer', dept: 'Technical', status: 'present' },
  ];

  totalRecords = 10;
  summary: any = {
    total: 45,
    present: 38,
    late: 5,
    absent: 2,
    attendanceRate: 84
  };
  
  departmentData: any[] = [
    { department: 'Operations', total: 12, present: 11, late: 1, absent: 0 },
    { department: 'Front Desk', total: 10, present: 8, late: 1, absent: 1 },
    { department: 'Safety', total: 8, present: 7, late: 0, absent: 1 },
    { department: 'Technical', total: 10, present: 9, late: 1, absent: 0 },
    { department: 'Guest Services', total: 5, present: 3, late: 2, absent: 0 },
  ];

  statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Present', value: 'present' },
    { label: 'Late', value: 'late' },
    { label: 'Absent', value: 'absent' }
  ];

  departmentOptions = [
    { label: 'All Departments', value: 'all' },
    { label: 'Operations', value: 'operations' },
    { label: 'Front Desk', value: 'front_desk' },
    { label: 'Safety', value: 'safety' },
    { label: 'Technical', value: 'technical' },
    { label: 'Guest Services', value: 'guest_services' }
  ];

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    // Using dummy data - would call service in production
    // this.reportsService.getAttendanceReports(...).subscribe(...);
  }

  onFilterChange() {
    this.loadReports();
  }

  exportPDF() {
    console.log('PDF export triggered');
    // Would trigger download in production
  }

  exportCSV() {
    console.log('CSV export triggered');
    // Would trigger download in production
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

  getDepartmentPercentages(dept: any) {
    const presentPercent = (dept.present / dept.total) * 100;
    const latePercent = (dept.late / dept.total) * 100;
    const absentPercent = (dept.absent / dept.total) * 100;

    return {
      presentPercent: Math.round(presentPercent),
      latePercent: Math.round(latePercent),
      absentPercent: Math.round(absentPercent)
    };
  }
}
