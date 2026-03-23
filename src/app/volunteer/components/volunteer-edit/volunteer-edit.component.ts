import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VolunteerService } from '../../services/volunteer.service';
import { ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-volunteer-edit',
  templateUrl: './volunteer-edit.component.html',
  styleUrls: ['./volunteer-edit.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule]
})

export class VolunteerEditComponent implements OnInit {

  form!: FormGroup;
  id!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private service: VolunteerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.form = this.fb.group({
      name: [''],
      email: [''],
      phone: [''],
      skills: [''],
      availability: [''],
      status: ['']
    });

    this.service.getById(this.id).subscribe(data => {
      this.form.patchValue(data);
    });
  }

  update() {
    this.service.update(this.id, this.form.value).subscribe(() => {
      this.router.navigate(['/volunteers']);
    });
  }
}