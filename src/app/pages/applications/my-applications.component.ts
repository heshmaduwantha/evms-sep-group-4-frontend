import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApplicationService } from './application.service';
import { EventService } from '../events/services/event.service';
import { Application, ApplicationStatus, CreateApplicationDto, UpdateApplicationDto } from './application.models';
import { Event } from '../events/event.models';

@Component({
    selector: 'app-my-applications',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        TagModule, 
        CardModule, 
        ButtonModule, 
        ConfirmDialogModule, 
        ToastModule, 
        DialogModule, 
        DropdownModule, 
        InputTextareaModule, 
        InputTextModule,
        FormsModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './my-applications.component.html',
    styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
    applications: Application[] = [];
    availableEvents: Event[] = [];
    loading: boolean = true;
    expandedId: string | null = null;

    // Apply/Edit Modal
    applyModalVisible: boolean = false;
    isEditing: boolean = false;
    currentApplicationId: string | null = null;
    selectedEvent: Event | null = null;
    
    // Form fields
    form = {
        motivation: '',
        experience: '',
        skills: '',
        location: '',
        gender: '',
        experienceDetails: ''
    };

    genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
        { label: 'Prefer not to say', value: 'N/A' }
    ];

    constructor(
        private applicationService: ApplicationService,
        private eventService: EventService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        // Load applications and events in parallel would be better, but let's keep it simple
        this.applicationService.getMyApplications().subscribe({
            next: (apps) => {
                this.applications = apps;
                this.loadAvailableEvents();
            },
            error: () => this.loading = false
        });
    }

    loadAvailableEvents() {
        this.eventService.getEvents().subscribe({
            next: (events: Event[]) => {
                // Filter out events where the user already has an active (non-rejected) application
                const activeEventIds = new Set(this.applications
                    .filter(a => a.status !== ApplicationStatus.REJECTED)
                    .map(a => a.event.id));
                this.availableEvents = events.filter(e => !activeEventIds.has(e.id));
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    openApplyModal(event: Event) {
        this.selectedEvent = event;
        this.isEditing = false;
        this.resetForm();
        this.applyModalVisible = true;
    }

    openEditModal(app: Application) {
        this.currentApplicationId = app.id;
        this.isEditing = true;
        this.selectedEvent = app.event;
        this.form = {
            motivation: app.motivation || '',
            experience: app.experience || '',
            skills: app.skills || '',
            location: app.location || '',
            gender: app.gender || '',
            experienceDetails: app.experienceDetails || ''
        };
        this.applyModalVisible = true;
    }

    resetForm() {
        this.form = {
            motivation: '',
            experience: '',
            skills: '',
            location: '',
            gender: '',
            experienceDetails: ''
        };
    }

    submitApplication() {
        if (!this.selectedEvent) return;
        this.loading = true;

        if (this.isEditing && this.currentApplicationId) {
            this.applicationService.updateApplication(this.currentApplicationId, this.form as UpdateApplicationDto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Application updated!' });
                    this.applyModalVisible = false;
                    this.loadData();
                },
                error: (err) => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update' });
                }
            });
        } else {
            const dto: CreateApplicationDto = {
                ...this.form,
                eventId: this.selectedEvent.id
            };
            this.applicationService.applyForEvent(dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Application submitted!' });
                    this.applyModalVisible = false;
                    this.loadData();
                },
                error: (err) => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to apply' });
                }
            });
        }
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

    toggleExpand(id: string) {
        this.expandedId = this.expandedId === id ? null : id;
    }

    deleteApplication(event: any, app: Application) {
        event.stopPropagation();
        this.confirmationService.confirm({
            message: `Are you sure you want to withdraw your application for "${app.event.title}"?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes, Withdraw',
            rejectLabel: 'Cancel',
            accept: () => {
                this.loading = true;
                this.applicationService.deleteApplication(app.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Withdrawn', detail: 'Application removed' });
                        this.loadData();
                    },
                    error: (err) => {
                        this.loading = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to delete' });
                    }
                });
            }
        });
    }
}
