import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserRole } from '../auth.models';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styles: `
    .register-wrapper {
      background: var(--bg-darker);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: radial-gradient(circle at 20% 30%, rgba(0, 209, 178, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(0, 209, 178, 0.05) 0%, transparent 50%);
      padding: 2rem;
    }
    .register-card {
      width: 100%;
      max-width: 500px;
      border: 1px solid var(--border-color);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
  `
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  error = '';
  roles = [
    { label: 'Volunteer', value: UserRole.VOLUNTEER },
    { label: 'Organizer', value: UserRole.ORGANIZER }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.VOLUNTEER, Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login'], { queryParams: { registered: true } });
        },
        error: err => {
          this.error = err.error?.message || 'Registration failed';
          this.loading = false;
        }
      });
  }
}
