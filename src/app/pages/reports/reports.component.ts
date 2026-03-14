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
    this.reportsService.getAttendanceReports(this.eventId, this.filters.status, this.filters.department, this.filters.date)
      .subscribe({
        next: (res) => {
          this.attendanceRecords = res.records;
          this.totalRecords = res.totalRecords;
        },
        error: (err) => console.error('Error loading attendance records:', err)
      });

    this.reportsService.getSummary(this.eventId, this.filters.date).subscribe({
      next: (res) => this.summary = res,
      error: (err) => console.error('Error loading summary:', err)
    });

    this.reportsService.getByDepartment(this.eventId, this.filters.date).subscribe({
      next: (res) => this.departmentData = res,
      error: (err) => console.error('Error loading department data:', err)
    });
  }

  onFilterChange() {
    this.loadReports();
  }

  exportPDF() {
    console.log('PDF export triggered');
    this.reportsService.exportPDF(this.eventId).subscribe({
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
    this.reportsService.exportCSV(this.eventId).subscribe({
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
}
