import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManualCheckinService } from './manual-checkin.service';
import { EventService } from '../events/services/event.service';
import { RoleService } from '../roles/role.service';
import { Event } from '../events/event.models';
import { forkJoin, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// PrimeNG
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-manual-checkin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, TagModule, ButtonModule, InputTextModule,
    SelectModule, CheckboxModule, DialogModule, TooltipModule,
    ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './manual-checkin.component.html',
  styleUrls: ['./manual-checkin.component.css']
})
export class ManualCheckinComponent implements OnInit {
  eventId = 'all';
  events: Event[] = [];

  searchQuery = '';
  selectedFilter = 'all';

  manualVolunteers: any[] = [];
  portalVolunteers: any[] = [];
  
  summary = {
    total: 0,
    checkedIn: 0,
    absent: 0
  };
  loading = false;

  showCreateForm = false;
  showEditForm = false;
  editingVolunteer: any = null;
  createForm: FormGroup;
  editForm: FormGroup;
  isSubmitting = false;

  roleOptions: any[] = [];

  departmentOptions = [
    { label: 'Operations', value: 'Operations' },
    { label: 'Front Desk', value: 'Front Desk' },
    { label: 'Safety', value: 'Safety' },
    { label: 'Technical', value: 'Technical' },
    { label: 'Guest Services', value: 'Guest Services' }
  ];

  constructor(
    private manualCheckinService: ManualCheckinService,
    private eventService: EventService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ngZone: NgZone,
    private roleService: RoleService
  ) {
    this.createForm = this.fb.group({
      eventId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      checkedIn: [false]
    });

    this.createForm.get('eventId')?.valueChanges.subscribe(val => {
      if (val) this.loadRolesForEvent(val);
    });

    this.editForm = this.fb.group({
      eventId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      checkedIn: [false]
    });
  }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loadVolunteers();
      }
    });
  }

  loadVolunteers() {
    this.loading = true;
    this.manualCheckinService.getVolunteers(this.eventId).subscribe({
      next: (res: any) => {
        const data = res.volunteers || [];
        this.ngZone.run(() => {
          this.manualVolunteers = data.filter((v: any) => v.checkInMethod !== 'online');
          this.portalVolunteers = data.filter((v: any) => v.checkInMethod === 'online');
          
          if (res.total !== undefined) {
            this.summary = {
              total: res.total,
              checkedIn: res.checkedIn || 0,
              absent: (res.total - (res.checkedIn || 0))
            };
          } else {
            this.updateSummary();
          }
          
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load check-ins' });
      }
    });
  }

  updateSummary() {
    const total = this.manualVolunteers.length + this.portalVolunteers.length;
    const manualCheckedIn = this.manualVolunteers.filter(v => v.status === 'present').length;
    const portalCheckedIn = this.portalVolunteers.filter(v => v.status === 'present').length;
    
    this.summary = {
      total,
      checkedIn: manualCheckedIn + portalCheckedIn,
      absent: total - (manualCheckedIn + portalCheckedIn)
    };
  }

  loadRolesForEvent(eventId: string) {
    if (!eventId || eventId === 'all') {
      this.roleOptions = [];
      return;
    }
    this.roleService.getRolesByEvent(eventId).subscribe({
      next: (roles) => {
        this.roleOptions = roles.map(r => ({ label: r.name, value: r.name }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' });
      }
    });
  }

  toggleCheckIn(volunteer: any) {
    // Implement toggle logic if available in service
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Status updated' });
  }

  openEditForm(v: any) {
    this.editingVolunteer = v;
    this.loadRolesForEvent(v.eventId);
    this.editForm.patchValue({
      eventId: v.eventId || (this.eventId !== 'all' ? this.eventId : ''),
      name: v.name,
      role: v.role,
      department: v.department,
      checkedIn: v.checkedIn
    });
    this.showEditForm = true;
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingVolunteer = null;
  }

  onSubmitEdit() {
    if (this.editForm.invalid) return;
    this.isSubmitting = true;
    this.manualCheckinService.updateVolunteer(this.editingVolunteer.id, this.editForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Volunteer updated' });
        this.loadVolunteers();
        this.closeEditForm();
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
      }
    });
  }

  onSubmitCreate() {
    if (this.createForm.invalid) return;
    this.isSubmitting = true;
    this.manualCheckinService.createVolunteer(this.createForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attendance record added' });
        this.loadVolunteers();
        this.showCreateForm = false;
        this.createForm.reset({ eventId: this.eventId !== 'all' ? this.eventId : '' });
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add record' });
      }
    });
  }

  deleteVolunteer(v: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.manualCheckinService.deleteVolunteer(v.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Record removed' });
            this.loadVolunteers();
          }
        });
      }
    });
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('Attendance Report', 14, 15);
    autoTable(doc, {
      head: [['Name', 'Role', 'Department', 'Status', 'Time']],
      body: [...this.manualVolunteers, ...this.portalVolunteers].map(v => [
        v.name, v.role, v.department, v.status, v.checkedInTime || '-'
      ])
    });
    doc.save('attendance-report.pdf');
  }

  exportCSV() {
    // Implement CSV export logic
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

  getEventTitle(id: string): string {
    return this.events.find(e => e.id === id)?.title || 'Unknown Event';
  }
}
