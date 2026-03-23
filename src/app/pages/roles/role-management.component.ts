import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { RoleService } from './role.service';
import { Role, VolunteerSummary, CreateRoleDto, UpdateRoleDto } from './role.models';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    ToastModule, ButtonModule, DialogModule, InputTextModule,
    InputTextareaModule, InputNumberModule, ConfirmDialogModule,
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
  loading = true;

  // Event summary (from first role or route state)
  eventTitle = '';
  eventDate: Date | null = null;
  eventLocation = '';
  eventDescription = '';

  // Add/Edit Role Dialog
  roleDialogVisible = false;
  isEditMode = false;
  selectedRole: Role | null = null;
  roleForm!: FormGroup;
  savingRole = false;

  // Assign Volunteer Dialog
  assignDialogVisible = false;
  assigningRole: Role | null = null;
  volunteerSearch = '';
  assigningUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.initForm();
    this.loadRoles();
    this.loadApprovedVolunteers();
  }

  initForm() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      requiredVolunteers: [1, [Validators.required, Validators.min(1)]]
    });
  }

  loadRoles() {
    this.loading = true;
    this.roleService.getRolesByEvent(this.eventId).subscribe({
      next: (roles) => {
        this.roles = roles;
        if (roles.length > 0 && roles[0].event) {
          const ev = roles[0].event;
          this.eventTitle = ev.title;
          this.eventDate = ev.date;
          this.eventLocation = ev.location;
          this.eventDescription = ev.description || '';
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' });
        this.loading = false;
      }
    });
  }

  loadApprovedVolunteers() {
    this.roleService.getApprovedVolunteers(this.eventId).subscribe({
      next: (vols) => { this.approvedVolunteers = vols; },
      error: () => {}
    });
  }

  // ── Role CRUD ────────────────────────────────────────────────────
  openAddRole() {
    this.isEditMode = false;
    this.selectedRole = null;
    this.roleForm.reset({ name: '', description: '', requiredVolunteers: 1 });
    this.roleDialogVisible = true;
  }

  openEditRole(role: Role) {
    this.isEditMode = true;
    this.selectedRole = role;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
      requiredVolunteers: role.requiredVolunteers
    });
    this.roleDialogVisible = true;
  }

  saveRole() {
    if (this.roleForm.invalid) return;
    this.savingRole = true;
    const val = this.roleForm.value;

    if (this.isEditMode && this.selectedRole) {
      const dto: UpdateRoleDto = {
        name: val.name,
        description: val.description,
        requiredVolunteers: val.requiredVolunteers
      };
      this.roleService.updateRole(this.selectedRole.id, dto).subscribe({
        next: (updated) => {
          const idx = this.roles.findIndex(r => r.id === updated.id);
          if (idx > -1) this.roles[idx] = { ...this.roles[idx], ...updated };
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Role updated successfully' });
          this.roleDialogVisible = false;
          this.savingRole = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to update role' });
          this.savingRole = false;
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
        next: (role) => {
          this.roles.push(role);
          this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Role added successfully' });
          this.roleDialogVisible = false;
          this.savingRole = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create role' });
          this.savingRole = false;
        }
      });
    }
  }

  confirmDeleteRole(role: Role) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the role "${role.name}"? This will remove all volunteer assignments.`,
      header: 'Delete Role',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteRole(role)
    });
  }

  deleteRole(role: Role) {
    this.roleService.deleteRole(role.id).subscribe({
      next: () => {
        this.roles = this.roles.filter(r => r.id !== role.id);
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Role deleted successfully' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role' });
      }
    });
  }

  // ── Volunteer Assignment ──────────────────────────────────────────
  openAssignDialog(role: Role) {
    this.assigningRole = role;
    this.volunteerSearch = '';
    this.assigningUserId = null;
    this.assignDialogVisible = true;
  }

  get filteredVolunteers(): VolunteerSummary[] {
    const search = this.volunteerSearch.toLowerCase().trim();
    const assigned = this.assigningRole?.assignedVolunteers.map(v => v.id) || [];
    return this.approvedVolunteers.filter(v =>
      !assigned.includes(v.id) &&
      (v.name.toLowerCase().includes(search) ||
       v.email.toLowerCase().includes(search) ||
       (v.skills || '').toLowerCase().includes(search))
    );
  }

  assignVolunteer(volunteer: VolunteerSummary) {
    if (!this.assigningRole) return;
    this.assigningUserId = volunteer.id;
    this.roleService.assignVolunteer(this.assigningRole.id, { userId: volunteer.id }).subscribe({
      next: (updatedRole) => {
        const idx = this.roles.findIndex(r => r.id === updatedRole.id);
        if (idx > -1) this.roles[idx] = updatedRole;
        if (this.assigningRole?.id === updatedRole.id) this.assigningRole = updatedRole;
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: `${volunteer.name} assigned successfully` });
        this.assigningUserId = null;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to assign volunteer' });
        this.assigningUserId = null;
      }
    });
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
    return Math.round((role.assignedVolunteers.length / role.requiredVolunteers) * 100);
  }

  getCoverageClass(role: Role): string {
    const pct = this.getCoveragePercent(role);
    if (pct >= 100) return 'full';
    if (pct >= 60) return 'good';
    if (pct >= 30) return 'low';
    return 'critical';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  get totalRequired(): number {
    return this.roles.reduce((s, r) => s + r.requiredVolunteers, 0);
  }

  get totalAssigned(): number {
    return this.roles.reduce((s, r) => s + r.assignedVolunteers.length, 0);
  }

  goBack() {
    this.router.navigate(['/roles']);
  }
}
