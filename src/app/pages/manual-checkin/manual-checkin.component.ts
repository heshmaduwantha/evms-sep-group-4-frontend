import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManualCheckinService } from './manual-checkin.service';

@Component({
  selector: 'app-manual-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manual-checkin.component.html',
  styleUrls: ['./manual-checkin.component.css']
})
export class ManualCheckinComponent implements OnInit {
  eventId = 'event-1';
  
  searchQuery = '';
  selectedFilter = 'all';
  
  volunteers: any[] = [];
  selectedVolunteers: Set<string> = new Set();
  
  summary = {
    total: 0,
    checkedIn: 0,
    absent: 0
  };

  showCreateForm = false;
  showEditForm = false;
  editingVolunteer: any = null;
  createForm!: FormGroup;
  editForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  deleteConfirmId: string | null = null;

  filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Checked In', value: 'checked-in' },
    { label: 'Absent', value: 'absent' }
  ];

  roleOptions = ['Volunteer', 'Team Lead', 'Coordinator', 'Registration', 'Logistics', 'Security', 'Hospitality', 'AV Tech'];
  departmentOptions = ['Operations', 'Front Desk', 'Safety', 'Technical', 'Guest Services'];

  constructor(
    private manualCheckinService: ManualCheckinService,
    private formBuilder: FormBuilder
  ) {
    this.createForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      checkedIn: [false]
    });
    this.editForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      checkedIn: [false]
    });
  }

  ngOnInit() {
    this.loadVolunteers();
  }

  loadVolunteers() {
    this.manualCheckinService.getVolunteers(this.eventId, this.searchQuery, this.selectedFilter)
      .subscribe({
        next: (res) => {
          this.volunteers = res.volunteers;
          this.summary = {
            total: res.total,
            checkedIn: res.checkedIn,
            absent: res.total - res.checkedIn
          };
        },
        error: (err) => {
          console.error('Error loading volunteers:', err);
          this.errorMessage = 'Failed to load volunteers';
        }
      });
  }

  onSearch() {
    this.loadVolunteers();
  }

  onFilterChange() {
    this.onSearch();
  }

  onToggleCheckin(volunteer: any) {
    const newStatus = !volunteer.checkedIn;
    this.manualCheckinService.updateCheckin(this.eventId, volunteer.id, { checkedIn: newStatus })
      .subscribe({
        next: (res) => {
          if (res.success) {
            volunteer.checkedIn = res.volunteer.checkedIn;
            volunteer.time = res.volunteer.time;
            this.loadVolunteers(); // Refresh summary
          }
        },
        error: (err) => {
          console.error('Error updating checkin:', err);
          this.errorMessage = 'Failed to update check-in status';
        }
      });
  }

  selectAbsent() {
    const absentVolunteers = this.volunteers.filter(v => !v.checkedIn);
    absentVolunteers.forEach(v => this.selectedVolunteers.add(v.id));
  }

  isSelected(volunteerId: string): boolean {
    return this.selectedVolunteers.has(volunteerId);
  }

  toggleSelection(volunteerId: string) {
    if (this.selectedVolunteers.has(volunteerId)) {
      this.selectedVolunteers.delete(volunteerId);
    } else {
      this.selectedVolunteers.add(volunteerId);
    }
  }

  updateSummary() {
    this.manualCheckinService.getSummary(this.eventId).subscribe({
      next: (res) => {
        this.summary = res;
      }
    });
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm.reset();
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  onSubmitForm() {
    if (this.createForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.manualCheckinService.createAttendance(this.eventId, this.createForm.value)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.successMessage = `${res.volunteer.name} has been added successfully!`;
            this.createForm.reset();
            this.loadVolunteers();
            
            setTimeout(() => {
              this.showCreateForm = false;
              this.successMessage = '';
            }, 2000);
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error creating attendance:', err);
          this.errorMessage = 'Failed to create attendance';
        }
      });
  }

  getAvatarColor(name: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[hash % colors.length];
  }

  openEditForm(volunteer: any) {
    this.editingVolunteer = { ...volunteer };
    this.editForm.patchValue({
      name: volunteer.name,
      role: volunteer.role,
      department: volunteer.department,
      checkedIn: volunteer.checkedIn
    });
    this.showEditForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingVolunteer = null;
    this.editForm.reset();
  }

  onSubmitEditForm() {
    if (this.editForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updatedData = {
      eventId: this.eventId,
      name: this.editForm.value.name,
      role: this.editForm.value.role,
      department: this.editForm.value.department,
      checkedIn: this.editForm.value.checkedIn || false
    };

    this.manualCheckinService.updateVolunteer(this.editingVolunteer.id, updatedData)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.successMessage = `${updatedData.name} has been updated successfully!`;
          this.loadVolunteers();
          this.updateSummary();

          setTimeout(() => {
            this.showEditForm = false;
            this.editingVolunteer = null;
            this.successMessage = '';
          }, 2000);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error updating volunteer:', err);
          this.errorMessage = 'Failed to update volunteer';
        }
      });
  }

  openDeleteConfirm(volunteerId: string) {
    this.deleteConfirmId = volunteerId;
  }

  closeDeleteConfirm() {
    this.deleteConfirmId = null;
  }

  confirmDelete(volunteerId: string) {
    this.manualCheckinService.deleteVolunteer(volunteerId)
      .subscribe({
        next: () => {
          this.volunteers = this.volunteers.filter(v => v.id !== volunteerId);
          this.updateSummary();
          this.successMessage = 'Volunteer record deleted successfully!';
          this.deleteConfirmId = null;

          setTimeout(() => {
            this.successMessage = '';
          }, 2000);
        },
        error: (err) => {
          console.error('Error deleting volunteer:', err);
          this.errorMessage = 'Failed to delete volunteer';
        }
      });
  }
}
