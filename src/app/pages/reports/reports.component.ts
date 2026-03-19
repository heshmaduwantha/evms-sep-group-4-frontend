import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from './reports.service';
import { EventService } from '../events/event.service';
import { Event } from '../events/event.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  eventId = '';
  events: Event[] = [];

  filters = {
    status: 'all',
    department: 'all',
    date: ''
  };

  attendanceRecords: any[] = [];
  totalRecords = 0;
  summary: any = {
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    attendanceRate: 0,
    manualCheckedIn: 0
  };

  departmentData: any[] = [];

  statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Present', value: 'present' },
    { label: 'Late', value: 'late' },
    { label: 'Absent', value: 'absent' }
  ];

  departmentOptions = [
    { label: 'All Departments', value: 'all' },
    { label: 'Operations', value: 'Operations' },
    { label: 'Front Desk', value: 'Front Desk' },
    { label: 'Safety', value: 'Safety' },
    { label: 'Technical', value: 'Technical' },
    { label: 'Guest Services', value: 'Guest Services' }
  ];

  constructor(
    private reportsService: ReportsService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        // Default to 'all' instead of the first event
        this.eventId = 'all';
        this.loadReports();
      },
      error: (err) => console.error('Error loading events:', err)
    });
  }

  onEventChange() {
    this.loadReports();
  }

  loadReports() {
    const targetEventId = this.eventId === 'all' ? '' : this.eventId;

    this.reportsService.getAttendanceReports(targetEventId, this.filters.status, this.filters.department, this.filters.date)
      .subscribe({
        next: (res) => {
          this.attendanceRecords = res.records;
          this.totalRecords = res.totalRecords;
        },
        error: (err) => console.error('Error loading attendance records:', err)
      });

    this.reportsService.getSummary(targetEventId, this.filters.date).subscribe({
      next: (res) => this.summary = res,
      error: (err) => console.error('Error loading summary:', err)
    });

    this.reportsService.getByDepartment(targetEventId, this.filters.date).subscribe({
      next: (res) => this.departmentData = res,
      error: (err) => console.error('Error loading department data:', err)
    });
  }

  getEventName(eventId: string): string {
    if (!eventId || eventId === 'None') return 'All Events';
    if (!this.events || this.events.length === 0) return 'Event ' + eventId;
    const event = this.events.find(e => e.id === eventId);
    return event ? event.title : 'Event ' + eventId;
  }

  onFilterChange() {
    this.loadReports();
  }

  exportPDF() {
    console.log('PDF export triggered');
    const title = this.getEventName(this.eventId);
    const friendlyTitle = this.eventId === 'all' ? 'All Events' : title;
    
    this.reportsService.exportPDF(this.eventId, friendlyTitle).subscribe({
      next: (res) => {
        if (res.success) {
          const { jspdf } = window as any;
          if (!jspdf) {
            console.error('jsPDF not loaded');
            return;
          }

          const doc = new jspdf.jsPDF();
          const reportData = res.data;

          doc.setFontSize(20);
          doc.setTextColor(40);
          doc.text(reportData.reportName, 14, 22);

          doc.setFontSize(11);
          doc.setTextColor(100);
          doc.text(`Generated at: ${new Date(reportData.generatedAt).toLocaleString()}`, 14, 30);

          doc.setFontSize(14);
          doc.setTextColor(40);
          doc.text('Attendance Summary', 14, 45);

          const summary = reportData.summary;
          const summaryRows = [
            ['Total Volunteers', summary.total.toString()],
            ['Present', summary.present.toString()],
            ['Late Arrivals', summary.late.toString()],
            ['Absent', summary.absent.toString()],
            ['Manual Check-ins', summary.manualCheckedIn.toString()],
            ['Attendance Rate', `${summary.attendanceRate}%`]
          ];

          (doc as any).autoTable({
            startY: 50,
            head: [['Metric', 'Value']],
            body: summaryRows,
            theme: 'grid',
            headStyles: { fillColor: [0, 209, 178] }
          });

          doc.setFontSize(14);
          doc.text('Detailed Attendance Record', 14, (doc as any).lastAutoTable.finalY + 15);

          const recordRows = reportData.records.map((r: any) => [
            r.name, r.role, r.dept, r.status, r.time || '-', r.method.toUpperCase()
          ]);

          (doc as any).autoTable({
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Name', 'Role', 'Department', 'Status', 'Time', 'Method']],
            body: recordRows,
            theme: 'striped',
            headStyles: { fillColor: [52, 73, 94] }
          });

          doc.save(`attendance-report-${this.eventId}.pdf`);
        }
      },
      error: (err) => console.error('Error exporting PDF:', err)
    });
  }

  exportCSV() {
    console.log('CSV export triggered');
    const title = this.getEventName(this.eventId);
    const friendlyTitle = this.eventId === 'all' ? 'All Events' : title;

    this.reportsService.exportCSV(this.eventId, friendlyTitle).subscribe({
      next: (res) => {
        if (res.success && res.content) {
          const blob = new Blob([res.content], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = res.fileName || `attendance-report-${this.eventId}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      },
      error: (err) => console.error('Error exporting CSV:', err)
    });
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

  getAvatarColor(name: string): string {
    if (!name) return '#64748b';
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
