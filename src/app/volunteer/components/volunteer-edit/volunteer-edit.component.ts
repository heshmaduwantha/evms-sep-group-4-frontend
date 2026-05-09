import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { VolunteerService } from '../../services/volunteer.service';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-volunteer-edit',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    InputTextModule, ButtonModule, SelectModule,
    CheckboxModule, ToastModule, CardModule
  ],
  providers: [MessageService],
  templateUrl: './volunteer-edit.component.html',
  styleUrls: ['./volunteer-edit.component.css']
})
export class VolunteerEditComponent implements OnInit {
  editForm: FormGroup;
  id!: string;
  loading = false;

  roleOptions = [
    { label: 'Volunteer', value: 'Volunteer' },
    { label: 'Team Lead', value: 'Team Lead' },
    { label: 'Coordinator', value: 'Coordinator' },
    { label: 'Admin', value: 'Admin' }
  ];

  deptOptions = [
    { label: 'Front Desk', value: 'Front Desk' },
    { label: 'Logistics', value: 'Logistics' },
    { label: 'Medical', value: 'Medical' },
    { label: 'Security', value: 'Security' }
  ];

  constructor(
    private fb: FormBuilder,
    private service: VolunteerService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['Volunteer'],
      department: ['Front Desk'],
      skills: [''],
      availability: [''],
      checkedIn: [false]
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.loadVolunteer();
  }

  loadVolunteer() {
    this.loading = true;
    this.service.getById(this.id).subscribe({
      next: (v) => {
        this.editForm.patchValue(v);
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load volunteer' });
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.editForm.invalid) return;
    this.loading = true;
    this.service.update(this.id, this.editForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Volunteer updated successfully' });
        setTimeout(() => this.router.navigate(['/volunteers']), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update volunteer' });
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/volunteers']);
  }
}