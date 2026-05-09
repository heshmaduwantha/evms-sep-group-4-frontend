import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { VolunteerService } from '../../services/volunteer.service';
import { AuthService } from '../../../auth/auth.service';
import { Volunteer } from '../../models/volunteer.model';

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, TagModule, ButtonModule,
    InputTextModule, TooltipModule, ToastModule,
    ConfirmDialogModule, DialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css']
})
export class VolunteerListComponent implements OnInit {
  volunteers: Volunteer[] = [];
  loading: boolean = true;
  searchValue: string = '';

  constructor(
    private volunteerService: VolunteerService,
    public auth: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadVolunteers();
  }

  loadVolunteers() {
    this.loading = true;
    this.volunteerService.getVolunteers().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.volunteers = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load volunteers' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deactivate(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to deactivate this volunteer?',
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.volunteerService.deleteVolunteer(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Volunteer deactivated' });
            this.loadVolunteers();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate volunteer' });
          }
        });
      }
    });
  }

  activate(id: string) {
    // Implement activation logic if available in service
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Activation feature coming soon' });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'pending': return 'info';
      default: return 'secondary';
    }
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'V';
  }

  getAvatarColor(name: string): string {
    const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
    let hash = 0;
    if (!name) return colors[0];
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}