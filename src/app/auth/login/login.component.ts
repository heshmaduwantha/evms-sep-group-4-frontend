import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url('/assets/images/auth-bg.png');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      padding: 1.5rem;
      font-family: 'Inter', sans-serif;
    }
    .login-container {
      width: 100%;
      max-width: 440px;
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    :host ::ng-deep .login-card {
      background: rgba(15, 23, 42, 0.8) !important;
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 24px !important;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
    }
    :host ::ng-deep .login-card .p-card-header {
      padding: 3rem 2.5rem 0 2.5rem;
    }
    :host ::ng-deep .login-card .p-card-content {
      padding: 1.5rem 2.5rem 3rem 2.5rem;
    }
    .auth-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.025em;
    }
    .auth-subtitle {
      color: #94a3b8;
      font-size: 1.125rem;
      margin-bottom: 2.5rem;
      line-height: 1.5;
    }
    .input-field-group {
      margin-bottom: 1.5rem;
    }
    .input-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 0.625rem;
    }
    :host ::ng-deep .p-inputtext {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem !important; /* Fixed icon overlap */
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05) !important;
      color: #ffffff !important;
      transition: all 0.3s ease;
    }
    :host ::ng-deep .p-input-icon-left > i {
      left: 1.25rem !important;
      color: #94a3b8 !important;
    }
    :host ::ng-deep .p-inputtext:focus {
      background: rgba(255, 255, 255, 0.08) !important;
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 4px rgba(0, 209, 178, 0.15) !important;
      transform: translateY(-1px);
    }
    :host ::ng-deep .p-button {
      padding: 1.125rem;
      border-radius: 14px;
      font-weight: 700;
      font-size: 1.125rem;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-hover)) !important;
      border: none !important;
      box-shadow: 0 10px 15px -3px rgba(0, 209, 178, 0.3) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host ::ng-deep .p-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 25px -5px rgba(0, 209, 178, 0.4) !important;
    }
    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      color: #94a3b8;
      font-size: 1rem;
    }
    .auth-link {
      color: var(--primary-color);
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }
    .auth-link:hover {
      color: #ffffff;
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';
  returnUrl: string = '/';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe({
        next: () => {
          const redirect = this.returnUrl === '/' ? '/home' : this.returnUrl;
          this.router.navigate([redirect]);
        },
        error: err => {
          this.error = err.error?.message || 'Login failed';
          this.loading = false;
        }
      });
  }
}
