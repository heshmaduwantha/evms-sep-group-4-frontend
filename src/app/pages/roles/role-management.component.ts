import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { RoleService } from './role.service';
import { Role, VolunteerSummary, CreateRoleDto, UpdateRoleDto } from './role.models';
import { EventService } from '../events/event.service';
import { forkJoin, of, timeout } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    ToastModule, ButtonModule, DialogModule, InputTextModule,
    TextareaModule, InputNumberModule, ConfirmDialogModule,
    ProgressBarModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {
  eventId!: string;
  roles: Role[] = [];
  approvedVolunteers: VolunteerSummary[] = [];
  loading = false;

  // Event summary
  eventTitle = '';
  eventDate: Date | null = null;
  eventLocation = '';
  eventDescription = '';

  // Add/Edit Role Dialog
  roleDialogVisible = false;
  isEditMode = false;
  editingRole: Role | null = null;
  roleForm!: FormGroup;
  isSubmitting = false;

  // Assign Volunteer Dialog
  assignDialogVisible = false;
  assigningRole: Role | null = null;
  volunteerSearch = '';
  assigningUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private eventService: EventService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    if (!this.eventId || this.eventId === 'undefined') {
      console.error('[RoleManagement] No eventId provided in route');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid event link' });
      this.router.navigate(['/roles']);
      return;
    }
    this.initForm();
    this.loadAllData();
  }

  loadAllData() {
    console.log('[RoleManagement] Loading data for event:', this.eventId);
    // loading remains false to show UI immediately

    forkJoin({
      roles: this.roleService.getRolesByEvent(this.eventId).pipe(catchError(() => of([]))),
      event: this.eventService.getEventById(this.eventId).pipe(catchError(() => of(null))),
      vols: this.roleService.getApprovedVolunteers(this.eventId).pipe(catchError(() => of([])))
    }).pipe(
      timeout(8000),
      catchError(err => {
        console.error('[RoleManagement] Load timeout or error:', err);
        return of({ roles: [], event: null, vols: [] });
      })
    ).subscribe({
      next: (data) => {
        console.log('[RoleManagement] Data received:', data);
        this.roles = data.roles;
        
        if (data.event) {
          const evData = data.event as any;
          const ev = evData.data || evData;
          this.eventTitle = ev.title || 'Unknown Event';
          this.eventDate = ev.date;
          this.eventLocation = ev.location || 'No Location';
          this.eventDescription = ev.description || '';
        } else if (this.roles.length > 0 && this.roles[0].event) {
          const ev = this.roles[0].event;
          this.eventTitle = ev.title;
          this.eventDate = ev.date;
          this.eventLocation = ev.location;
          this.eventDescription = ev.description || '';
        }

        this.approvedVolunteers = data.vols;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[RoleManagement] Subscription error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initForm() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      requiredVolunteers: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadRoles() {}
  loadApprovedVolunteers() {}

  // ── Role CRUD ────────────────────────────────────────────────────
  openAddRole() {
    this.isEditMode = false;
    this.editingRole = null;
    this.roleForm.reset({ name: '', description: '', requiredVolunteers: 1 });
    this.roleDialogVisible = true;
  }

  openEditRole(role: Role) {
    this.isEditMode = true;
    this.editingRole = role;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
      requiredVolunteers: role.requiredVolunteers
    });
    this.roleDialogVisible = true;
  }

  saveRole() {
    if (this.roleForm.invalid) return;
    this.isSubmitting = true;
    const val = this.roleForm.value;

    if (this.isEditMode && this.editingRole) {
      const dto: UpdateRoleDto = {
        name: val.name,
        description: val.description,
        requiredVolunteers: val.requiredVolunteers
      };
      this.roleService.updateRole(this.editingRole.id, dto).subscribe({
        next: (updated) => {
          const idx = this.roles.findIndex(r => r.id === updated.id);
          if (idx > -1) this.roles[idx] = updated;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Role updated successfully' });
          this.roleDialogVisible = false;
          this.isSubmitting = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update role' });
          this.isSubmitting = false;
        }
      });
    } else {
      const dto: CreateRoleDto = {
        name: val.name,
        description: val.description,
        requiredVolunteers: val.requiredVolunteers,
        eventId: this.eventId
      };
      this.roleService.createRole(dto).subscribe({
        next: (newRole) => {
          this.roles.push(newRole);
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Role created successfully' });
          this.roleDialogVisible = false;
          this.isSubmitting = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create role' });
          this.isSubmitting = false;
        }
      });
    }
  }

  confirmDeleteRole(role: Role) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the role "${role.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.roles = this.roles.filter(r => r.id !== role.id);
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Role removed' });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role' });
          }
        });
      }
    });
  }

  // ── Assignments ──────────────────────────────────────────────────
  openAssignDialog(role: Role) {
    this.assigningRole = role;
    this.volunteerSearch = '';
    this.assigningUserId = null;
    this.assignDialogVisible = true;
  }

  getFilteredVolunteers() {
    let filtered = this.approvedVolunteers;
    if (this.volunteerSearch) {
      const s = this.volunteerSearch.toLowerCase();
      filtered = this.approvedVolunteers.filter(v => 
        (v.name || '').toLowerCase().includes(s) || (v.email || '').toLowerCase().includes(s)
      );
    }
    return filtered.slice(0, 5);
  }
  assignVolunteer(userId: string) {
    if (!this.assigningRole) return;
    this.assigningUserId = userId;
    
    this.roleService.assignVolunteer(this.assigningRole.id, { userId }).subscribe({
      next: (updatedRole) => {
        const idx = this.roles.findIndex(r => r.id === updatedRole.id);
        if (idx > -1) this.roles[idx] = updatedRole;
        if (this.assigningRole?.id === updatedRole.id) this.assigningRole = updatedRole;
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: 'Volunteer assigned successfully' });
        this.assigningUserId = null;
        this.assignDialogVisible = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to assign volunteer' });
        this.assigningUserId = null;
      }
    });
  }

  confirmAssignment() {
    if (this.assigningUserId) {
      this.assignVolunteer(this.assigningUserId);
    }
  }

  removeVolunteer(role: Role, volunteer: VolunteerSummary) {
    this.roleService.removeVolunteer(role.id, volunteer.id).subscribe({
      next: (updatedRole) => {
        const idx = this.roles.findIndex(r => r.id === updatedRole.id);
        if (idx > -1) this.roles[idx] = updatedRole;
        if (this.assigningRole?.id === updatedRole.id) this.assigningRole = updatedRole;
        this.messageService.add({ severity: 'success', summary: 'Removed', detail: `${volunteer.name} removed from role` });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove volunteer' });
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────
  getCoveragePercent(role: Role): number {
    if (role.requiredVolunteers === 0) return 100;
    return Math.round(((role.assignedVolunteers?.length || 0) / role.requiredVolunteers) * 100);
  }

  getCoverageClass(pct: number): string {
    if (pct >= 100) return 'full';
    if (pct >= 60) return 'good';
    if (pct >= 30) return 'low';
    return 'critical';
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    if (!name) return '#cbd5e1';
    const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  get totalRequired(): number {
    return this.roles.reduce((s, r) => s + r.requiredVolunteers, 0);
  }

  get totalAssigned(): number {
    return this.roles.reduce((s, r) => s + (r.assignedVolunteers?.length || 0), 0);
  }

  goBack() {
    this.router.navigate(['/roles']);
  }
}
