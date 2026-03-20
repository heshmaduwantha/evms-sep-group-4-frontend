import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManualCheckinService } from './manual-checkin.service';
import { EventService } from '../events/event.service';
import { Event } from '../events/event.models';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-manual-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manual-checkin.component.html',
  styleUrls: ['./manual-checkin.component.css']
})
export class ManualCheckinComponent implements OnInit {
  eventId = '';
  events: Event[] = [];

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
    private eventService: EventService,
    private formBuilder: FormBuilder
  ) {
    this.createForm = this.formBuilder.group({
      eventId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      checkedIn: [false]
    });
    this.editForm = this.formBuilder.group({
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
        // Default to 'all' to show all volunteers initially
        this.eventId = 'all';
        this.loadVolunteers();
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.errorMessage = 'Failed to load events';
      }
    });
  }

  onEventChange() {
    this.loadVolunteers();
  }

  loadVolunteers() {
    this.manualCheckinService.getVolunteers(this.eventId, this.searchQuery, this.selectedFilter)
      .subscribe({
        next: (res) => {
          // If eventId is specific, verify results. If 'all', trust backend consolidation.
          if (this.eventId !== 'all') {
            this.volunteers = (res.volunteers || []).filter((v: any) => v.eventId === this.eventId);
          } else {
            this.volunteers = res.volunteers || [];
          }
          
          // Use summary from response directly if available, else calculate locally
          if (res.total !== undefined && res.checkedIn !== undefined) {
            this.summary = {
              total: res.total,
              checkedIn: res.checkedIn,
              absent: res.total - res.checkedIn
            };
          } else {
            const total = this.volunteers.length;
            const checkedIn = this.volunteers.filter(v => v.checkedIn).length;
            this.summary = {
              total: total,
              checkedIn: checkedIn,
              absent: total - checkedIn
            };
          }
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
    const targetEventId = volunteer.eventId || this.eventId;
    
    if (volunteer.checkInMethod === 'online') {
      return; // Can't edit portal check-ins
    }
    
    this.manualCheckinService.updateCheckin(targetEventId, volunteer.id, { checkedIn: newStatus })
      .subscribe({
        next: (res) => {
          if (res.success) {
            volunteer.checkedIn = res.volunteer.checkedIn;
            volunteer.time = res.volunteer.time;
            this.loadVolunteers(); // Refresh summary and view
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
    } else {
      // Set default event to current selection
      this.createForm.patchValue({ eventId: this.eventId });
    }
  }

  onSubmitForm() {
    console.log('onSubmitForm called');
    if (this.createForm.invalid) {
      console.warn('Form is invalid:', this.createForm.errors, this.createForm.value);
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const submissionData = { ...this.createForm.value };
    const targetEventId = submissionData.eventId;
    delete submissionData.eventId;

    console.log('Sending createAttendance request to backend:', submissionData);
    this.manualCheckinService.createAttendance(targetEventId, submissionData)
      .subscribe({
        next: (res) => {
          console.log('createAttendance response:', res);
          this.isSubmitting = false;
          if (res.success) {
            this.successMessage = `${res.volunteer.name} has been added successfully!`;
            this.createForm.reset({
              eventId: targetEventId,
              checkedIn: false
            });
            this.loadVolunteers();

            setTimeout(() => {
              this.showCreateForm = false;
              this.successMessage = '';
            }, 2000);
          } else {
            this.errorMessage = 'Backend returned success: false';
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error creating attendance (HTTP Error):', err);
          this.errorMessage = `Failed to create attendance: ${err.status} ${err.statusText || ''}`;
        }
      });
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55',
      '#AF52DE', '#FF375F', '#BF5AF2', '#64D2FF', '#30D158', '#FF9F0A', '#FF453A'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  openEditForm(volunteer: any) {
    this.editingVolunteer = { ...volunteer };
    this.editForm.patchValue({
      eventId: this.eventId,
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
      eventId: this.editForm.value.eventId,
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

  getSelectedEventName(): string {
    if (this.eventId === 'all') return 'All Events';
    const event = this.events.find(e => e.id === this.eventId);
    return event ? event.title : 'Selected Event';
  }

  getEventName(eventId: string): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  }
}
