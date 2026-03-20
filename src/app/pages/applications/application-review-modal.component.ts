import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Application, ApplicationStatus } from './application.models';
import { ApplicationService } from './application.service';

@Component({
    selector: 'app-application-review-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, TagModule, InputTextareaModule],
    templateUrl: './application-review-modal.component.html',
    styleUrls: ['./application-review-modal.component.css']
})
export class ApplicationReviewModalComponent {
    @Input() visible: boolean = false;
    @Input() application: Application | null = null;
    @Output() closed = new EventEmitter<void>();
    @Output() statusUpdated = new EventEmitter<string>();

    public ApplicationStatus = ApplicationStatus;
    notes: string = '';
    loading: boolean = false;

    constructor(private applicationService: ApplicationService) {}

    getSkills(skills: string | undefined): string[] {
        return skills ? skills.split(',').map(s => s.trim()) : [];
    }

    updateStatus(status: ApplicationStatus) {
        if (!this.application) return;
        
        this.loading = true;
        this.applicationService.updateStatus(this.application.id, { 
            status: status,
            notes: this.notes 
        }).subscribe({
            next: () => {
                this.loading = false;
                this.statusUpdated.emit(this.application!.id);
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    close() {
        this.closed.emit();
    }
}
