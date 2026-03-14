import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { AuthService } from '../../auth/auth.service';
import { UserRole } from '../../auth/auth.models';
import { EventService } from './event.service';
import { Event, EventStatus } from './event.models';

@Component({
    selector: 'app-event-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        TagModule,
        ProgressBarModule
    ],
    templateUrl: './event-list.component.html',
    styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
    events: Event[] = [];
    loading: boolean = true;
    isOrganizer: boolean = false;

    statuses = [
        { label: 'All Status', value: null },
        { label: 'Active', value: EventStatus.ACTIVE },
        { label: 'Upcoming', value: EventStatus.UPCOMING },
        { label: 'Completed', value: EventStatus.COMPLETED }
    ];

    locations = [
        { label: 'All Locations', value: null },
        { label: 'Riverside District', value: 'Riverside District' },
        { label: 'Downtown Square', value: 'Downtown Square' },
        { label: 'City Park', value: 'City Park' }
    ];

    constructor(
        private eventService: EventService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.authService.currentUser.subscribe(user => {
            this.isOrganizer = user?.role === UserRole.ORGANIZER || user?.role === UserRole.ADMIN;
        });
        this.loadEvents();
    }

    loadEvents() {
        this.loading = true;
        this.eventService.getEvents().subscribe({
            next: (data) => {
                this.events = data;

                // Dynamically update locations based on available data
                const uniqueLocations = Array.from(new Set(data.filter(e => e.location).map(e => e.location)));
                this.locations = [
                    { label: 'All Locations', value: null },
                    ...uniqueLocations.map(loc => ({ label: loc, value: loc }))
                ];

                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    getStatusSeverity(status: string) {
        switch (status) {
            case EventStatus.ACTIVE:
                return 'success';
            case EventStatus.UPCOMING:
                return 'warning';
            case EventStatus.COMPLETED:
                return 'info';
            case EventStatus.CANCELLED:
                return 'danger';
            default:
                return 'info';
        }
    }

    getVolunteerProgress(event: Event) {
        if (!event.volunteersNeeded) return 0;
        return Math.min(Math.round((event.volunteers?.length || 0) / event.volunteersNeeded * 100), 100);
    }
}
