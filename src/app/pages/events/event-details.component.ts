import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EventService } from './event.service';
import { ManualCheckinService } from '../manual-checkin/manual-checkin.service';
import { ApplicationService } from '../applications/application.service';
import { AuthService } from '../../auth/auth.service';
import { UserRole } from '../../auth/auth.models';
import { Event, EventStatus } from './event.models';

@Component({
    selector: 'app-event-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        TagModule,
        TableModule,
        AvatarModule,
        ToastModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './event-details.component.html',
    styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
    event: Event | null = null;
    loading: boolean = true;
    hasApplied: boolean = false;
    currentApplicationId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventService: EventService,
        private manualCheckinService: ManualCheckinService,
        private applicationService: ApplicationService,
        private authService: AuthService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private sanitizer: DomSanitizer
    ) { }

    getMapUrl(location: string): SafeResourceUrl {
        const encodedLocation = encodeURIComponent(location);
        const url = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadEvent(id);
        }
    }

    loadEvent(id: string) {
        this.loading = true;
        this.eventService.getEventById(id).subscribe({
            next: (data) => {
                this.event = data;
                this.checkApplicationStatus(id);
                // Also fetch volunteers from manual check-in to ensure all are shown
                this.manualCheckinService.getVolunteers(id).subscribe({
                    next: (res) => {
                        if (res && res.volunteers) {
                            // Merge manual check-in volunteers with assigned volunteers if they belong to THIS event
                            const assignedEmails = new Set((this.event?.volunteers || []).map(v => v.email));
                            
                            // Important: Filter strictly by current event ID
                            const additionalVolunteers = res.volunteers
                                .filter((v: any) => !assignedEmails.has(v.email) && v.eventId === id)
                                .map((v: any) => ({
                                    id: v.id,
                                    email: v.email,
                                    name: v.name,
                                    role: v.role,
                                    status: v.checkedIn ? 'active' : 'confirmed'
                                }));
                            
                            if (this.event) {
                                this.event.volunteers = [...(this.event.volunteers || []), ...additionalVolunteers];
                            }
                        }
                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('Error loading manual volunteers:', err);
                        this.loading = false;
                    }
                });
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    checkApplicationStatus(eventId: string) {
        this.applicationService.getMyApplications().subscribe({
            next: (apps) => {
                const app = apps.find(a => a.event.id === eventId);
                // Allow re-application if status is rejected
                this.hasApplied = app ? app.status !== 'rejected' : false;
                this.currentApplicationId = app ? app.id : null;
            }
        });
    }

    getStatusSeverity(status: string | undefined) {
        if (!status) return 'info';
        switch (status) {
            case EventStatus.ACTIVE: return 'success';
            case EventStatus.UPCOMING: return 'warning';
            case EventStatus.COMPLETED: return 'info';
            default: return 'info';
        }
    }

    togglePublishStatus() {
        if (!this.event?.id) return;
        this.loading = true;

        const isCurrentlyActive = this.event.status === EventStatus.ACTIVE;
        const newStatus = isCurrentlyActive ? EventStatus.UPCOMING : EventStatus.ACTIVE;
        const successMessage = isCurrentlyActive ? 'Event unpublished and is now Upcoming' : 'Event published and is now Active';

        this.eventService.updateEvent(this.event.id, { status: newStatus }).subscribe({
            next: (updatedEvent) => {
                this.event = updatedEvent;
                this.loading = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage });
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                const action = isCurrentlyActive ? 'unpublish' : 'publish';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: `Failed to ${action} event` });
            }
        });
    }

    deleteEvent() {
        // ... previous implementation ...
    }

    openApplyModal() {
        if (!this.event?.id) return;
        
        this.confirmationService.confirm({
            message: 'Are you sure you want to apply for this event?',
            header: 'Apply Confirmation',
            icon: 'pi pi-info-circle',
            accept: () => {
                this.loading = true;
                this.applicationService.applyForEvent({ eventId: this.event!.id }).subscribe({
                    next: () => {
                        this.loading = false;
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Application submitted successfully' });
                        this.loadEvent(this.event!.id);
                    },
                    error: (err: any) => {
                        this.loading = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to submit application' });
                    }
                });
            }
        });
    }

    withdrawApplication() {
        if (!this.currentApplicationId) return;

        this.confirmationService.confirm({
            message: 'Are you sure you want to withdraw your application?',
            header: 'Withdraw Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loading = true;
                this.applicationService.deleteApplication(this.currentApplicationId!).subscribe({
                    next: () => {
                        this.loading = false;
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Application withdrawn' });
                        this.loadEvent(this.event!.id);
                    },
                    error: (err: any) => {
                        this.loading = false;
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to withdraw' });
                    }
                });
            }
        });
    }

    isVolunteer(): boolean {
        let isVol = false;
        this.authService.currentUser.subscribe(user => {
            isVol = user?.role === UserRole.VOLUNTEER;
        });
        return isVol;
    }

    isOrganizer(): boolean {
        let isOrg = false;
        this.authService.currentUser.subscribe(user => {
            isOrg = user?.role === UserRole.ORGANIZER || user?.role === UserRole.ADMIN;
        });
        return isOrg;
    }
}
