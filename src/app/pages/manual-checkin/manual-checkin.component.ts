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
  
  volunteers: any[] = [
    { id: 1, name: 'Sarah Johnson', role: 'Team Lead', department: 'Operations', checkedIn: true, time: '08:45 AM' },
    { id: 2, name: 'Michael Chen', role: 'Volunteer', department: 'Front Desk', checkedIn: true, time: '08:52 AM' },
    { id: 3, name: 'Emily Rodriguez', role: 'Volunteer', department: 'Safety', checkedIn: false, time: null },
    { id: 4, name: 'David Thompson', role: 'Coordinator', department: 'Operations', checkedIn: true, time: '09:02 AM' },
    { id: 5, name: 'Jessica Williams', role: 'Volunteer', department: 'Guest Services', checkedIn: true, time: '09:15 AM' },
    { id: 6, name: 'Robert Martinez', role: 'Volunteer', department: 'Technical', checkedIn: false, time: null },
    { id: 7, name: 'Lisa Anderson', role: 'Team Lead', department: 'Operations', checkedIn: true, time: '08:38 AM' },
    { id: 8, name: 'James Wilson', role: 'Volunteer', department: 'Front Desk', checkedIn: false, time: null },
    { id: 9, name: 'Maria Garcia', role: 'Volunteer', department: 'Guest Services', checkedIn: true, time: '09:28 AM' },
    { id: 10, name: 'Christopher Lee', role: 'Volunteer', department: 'Technical', checkedIn: true, time: '09:05 AM' },
    { id: 11, name: 'Angela Davis', role: 'Volunteer', department: 'Safety', checkedIn: false, time: null },
    { id: 12, name: 'Kevin Brown', role: 'Volunteer', department: 'Front Desk', checkedIn: true, time: '08:55 AM' },
  ];

  selectedVolunteers: Set<string> = new Set();
  
  summary = {
    total: 12,
    checkedIn: 8,
    absent: 4
  };

  showCreateForm = false;
  showEditForm = false;
  editingVolunteer: any = null;
  createForm!: FormGroup;
  editForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  deleteConfirmId: number | null = null;

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
    // Using dummy data - would call service in production
    this.updateSummary();
  }

  onSearch() {
    // Filter local data
    let filtered = this.volunteers;
    
    if (this.searchQuery) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        v.role.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.selectedFilter !== 'all') {
      if (this.selectedFilter === 'checked-in') {
        filtered = filtered.filter(v => v.checkedIn);
      } else if (this.selectedFilter === 'absent') {
        filtered = filtered.filter(v => !v.checkedIn);
      }
    }

    this.volunteers = filtered;
  }

  onFilterChange() {
    this.onSearch();
  }

  onToggleCheckin(volunteer: any) {
    volunteer.checkedIn = !volunteer.checkedIn;
    if (volunteer.checkedIn) {
      volunteer.time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      volunteer.time = null;
    }
    this.updateSummary();
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
    this.summary.checkedIn = this.volunteers.filter(v => v.checkedIn).length;
    this.summary.absent = this.volunteers.filter(v => !v.checkedIn).length;
    this.summary.total = this.volunteers.length;
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

    const formData = {
      id: this.volunteers.length + 1,
      name: this.createForm.value.name,
      role: this.createForm.value.role,
      department: this.createForm.value.department,
      checkedIn: this.createForm.value.checkedIn || false,
      time: this.createForm.value.checkedIn ? new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : null
    };

    // Simulate async operation
    setTimeout(() => {
      this.isSubmitting = false;
      this.volunteers.push(formData);
      this.successMessage = `${formData.name} has been added successfully!`;
      this.createForm.reset();
      this.updateSummary();
      
      setTimeout(() => {
        this.showCreateForm = false;
        this.successMessage = '';
      }, 2000);
    }, 500);
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
      name: this.editForm.value.name,
      role: this.editForm.value.role,
      department: this.editForm.value.department,
      checkedIn: this.editForm.value.checkedIn || false,
      time: this.editForm.value.checkedIn ? new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : null
    };

    setTimeout(() => {
      this.isSubmitting = false;
      const index = this.volunteers.findIndex(v => v.id === this.editingVolunteer.id);
      if (index !== -1) {
        this.volunteers[index] = { ...this.volunteers[index], ...updatedData };
      }
      this.successMessage = `${updatedData.name} has been updated successfully!`;
      this.editForm.reset();
      this.updateSummary();

      setTimeout(() => {
        this.showEditForm = false;
        this.editingVolunteer = null;
        this.successMessage = '';
      }, 2000);
    }, 500);
  }

  openDeleteConfirm(volunteerId: number) {
    this.deleteConfirmId = volunteerId;
  }

  closeDeleteConfirm() {
    this.deleteConfirmId = null;
  }

  confirmDelete(volunteerId: number) {
    this.volunteers = this.volunteers.filter(v => v.id !== volunteerId);
    this.updateSummary();
    this.successMessage = 'Volunteer record deleted successfully!';
    this.deleteConfirmId = null;

    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }
}
