import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VolunteerService } from '../../services/volunteer.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-volunteer-form',
  templateUrl: './volunteer-form.component.html',
  styleUrls: ['./volunteer-form.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]

})
export class VolunteerFormComponent {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private volunteerService: VolunteerService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      skills: [''],
      availability: [''],
      status: ['active']
    });
  }

  submit() {
    if (this.form.valid) {
      this.volunteerService.create(this.form.value).subscribe(() => {
        this.router.navigate(['/volunteers']);
      });
    }
  }
}