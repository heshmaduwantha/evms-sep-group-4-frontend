import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EventService } from './event.service';
import { Event, EventStats, EventStatus } from './event.models';

@Component({
    selector: 'app-event-management',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TableModule,
        ButtonModule,
        CardModule,
        TagModule,
        ProgressBarModule,
        ToastModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './event-management.component.html',
    styleUrls: ['./event-management.component.css']
})
export class EventManagementComponent implements OnInit {
    events: Event[] = [];
    stats: EventStats = {
        totalEvents: 0,
        upcomingEvents: 0,
        activeEvents: 0,
        completedEvents: 0
    };
    loading: boolean = true;

    constructor(
        private eventService: EventService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.eventService.getEvents().subscribe(data => {
            this.events = data;
            this.loading = false;
        });

        this.eventService.getStats().subscribe(stats => {
            this.stats = stats;
        });
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case EventStatus.ACTIVE: return 'success';
            case EventStatus.UPCOMING: return 'warning';
            case EventStatus.COMPLETED: return 'info';
            default: return 'info';
        }
    }

    getVolunteerProgress(event: Event) {
        if (!event.volunteersNeeded) return 0;
        return Math.min(Math.round((event.volunteers?.length || 0) / event.volunteersNeeded * 100), 100);
    }

    deleteEvent(event: Event) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this event?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.eventService.deleteEvent(event.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Event Deleted', life: 3000 });
                        this.loadData();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete event', life: 3000 });
                    }
                });
            }
        });
    }
}
