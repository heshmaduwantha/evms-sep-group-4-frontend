import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EventService } from './event.service';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-event-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        InputTextModule,
        InputTextareaModule,
        CalendarModule,
        InputNumberModule,
        ButtonModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './event-form.component.html',
    styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
    eventForm: FormGroup;
    isEditMode: boolean = false;
    eventId: string | null = null;
    loading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private eventService: EventService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {
        this.eventForm = this.fb.group({
            title: ['', Validators.required],
            date: [null, Validators.required],
            time: ['', Validators.required],
            location: ['', Validators.required],
            volunteersNeeded: [0, [Validators.required, Validators.min(1)]],
            description: ['']
        });
    }

    ngOnInit() {
        this.eventId = this.route.snapshot.paramMap.get('id');
        if (this.eventId) {
            this.isEditMode = true;
            this.loadEvent();
        }
    }

    loadEvent() {
        if (!this.eventId) return;
        this.eventService.getEventById(this.eventId).subscribe(event => {
            let timeDate = null;
            if (event.time) {
                // Try to parse the time string back to a Date for the time picker
                timeDate = new Date();
                const timeParts = event.time.split(/[: ]/); // e.g. ["10", "30", "AM"]
                if (timeParts.length >= 2) {
                    let hours = parseInt(timeParts[0], 10);
                    const minutes = parseInt(timeParts[1], 10);
                    const ampm = timeParts[2];

                    if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;

                    timeDate.setHours(hours, minutes, 0, 0);
                }
            }

            this.eventForm.patchValue({
                title: event.title,
                date: new Date(event.date),
                time: timeDate,
                location: event.location,
                volunteersNeeded: event.volunteersNeeded,
                description: event.description
            });
        });
    }

    private formatTime(timeVal: any): string {
        if (!timeVal) return '';
        if (timeVal instanceof Date) {
            const hours = timeVal.getHours();
            const minutes = timeVal.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hr12 = hours % 12 || 12;
            return `${hr12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
        return timeVal.toString();
    }

    onSubmit() {
        if (this.eventForm.invalid) return;

        this.loading = true;
        const currentUser = this.authService.currentUserValue;

        const formValue = this.eventForm.value;
        const eventData = {
            ...formValue,
            time: this.formatTime(formValue.time),
            organizerId: currentUser?.id
        };

        if (this.isEditMode && this.eventId) {
            this.eventService.updateEvent(this.eventId, eventData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event updated successfully' });
                    setTimeout(() => this.router.navigate(['/events']), 1500);
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update event' });
                }
            });
        } else {
            this.eventService.createEvent(eventData).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event created successfully' });
                    setTimeout(() => this.router.navigate(['/events']), 1500);
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create event' });
                }
            });
        }
    }
}
