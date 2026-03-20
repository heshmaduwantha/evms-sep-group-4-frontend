import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ApplicationService } from './application.service';
import { Application, ApplicationStatus, ApplicationStats } from './application.models';
import { Event } from '../events/event.models';
import { ApplicationReviewModalComponent } from './application-review-modal.component';

@Component({
    selector: 'app-application-management',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        TableModule,
        ButtonModule,
        CardModule,
        TagModule,
        InputTextModule,
        DropdownModule,
        ToastModule,
        DialogModule,
        ApplicationReviewModalComponent
    ],
    providers: [MessageService],
    templateUrl: './application-management.component.html',
    styleUrls: ['./application-management.component.css']
})
export class ApplicationManagementComponent implements OnInit {
    applications: Application[] = [];
    filteredApplications: Application[] = [];
    stats: ApplicationStats = {
        totalApplications: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
        pending: 0
    };
    loading: boolean = true;
    searchTerm: string = '';
    selectedStatus: string | null = null;
    ApplicationStatus = ApplicationStatus;

    statusOptions = [
        { label: 'All Statuses', value: null },
        { label: 'Pending', value: ApplicationStatus.PENDING },
        { label: 'Approved', value: ApplicationStatus.APPROVED },
        { label: 'Rejected', value: ApplicationStatus.REJECTED },
        { label: 'Waitlisted', value: ApplicationStatus.WAITLISTED }
    ];

    reviewModalVisible: boolean = false;
    selectedApplication: Application | null = null;

    constructor(
        private applicationService: ApplicationService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.loadApplications();
    }

    loadApplications() {
        this.loading = true;
        this.applicationService.getApplications().subscribe({
            next: (data: Application[]) => {
                this.applications = data;
                this.stats = this.applicationService.getStats(data);
                this.filterApplications();
                this.loading = false;
            },
            error: (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load applications' });
                this.loading = false;
            }
        });
    }

    filterApplications() {
        this.filteredApplications = this.applications.filter(app => {
            const matchesSearch = !this.searchTerm || 
                app.user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                app.event.title.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            const matchesStatus = !this.selectedStatus || app.status === this.selectedStatus;
            
            return matchesSearch && matchesStatus;
        });
    }

    onSearch() {
        this.filterApplications();
    }

    onStatusChange() {
        this.filterApplications();
    }

    getStatusSeverity(status: ApplicationStatus): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
        switch (status) {
            case ApplicationStatus.APPROVED: return 'success';
            case ApplicationStatus.PENDING: return 'warning';
            case ApplicationStatus.REJECTED: return 'danger';
            case ApplicationStatus.WAITLISTED: return 'info';
            default: return 'info';
        }
    }

    reviewApplication(application: Application) {
        this.selectedApplication = application;
        this.reviewModalVisible = true;
    }

    onStatusUpdated(id: string) {
        this.reviewModalVisible = false;
        this.loadApplications();
    }

    updateStatus(application: Application, status: ApplicationStatus) {
        this.applicationService.updateStatus(application.id, { status }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Application ${status}` });
                this.loadApplications();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status' });
            }
        });
    }

    exportPDF() {
        const doc = new jsPDF();
        const tableData = this.filteredApplications.map(app => [
            app.user.email,
            app.event.title,
            app.status.toUpperCase(),
            new Date(app.appliedDate).toLocaleDateString()
        ]);

        doc.setFontSize(18);
        doc.text('Application Report', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);

        autoTable(doc, {
            head: [['Volunteer', 'Event', 'Status', 'Date Applied']],
            body: tableData,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [63, 81, 181] }
        });

        doc.save(`applications-report-${new Date().getTime()}.pdf`);
    }

    exportCSV() {
        const headers = ['Volunteer,Event,Status,Date Applied'];
        const data = this.filteredApplications.map(app => 
            `"${app.user.email}","${app.event.title}","${app.status.toUpperCase()}","${new Date(app.appliedDate).toLocaleDateString()}"`
        );
        
        const csvContent = [headers, ...data].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `applications-${new Date().getTime()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
