import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styles: `
    .login-wrapper {
      background: var(--bg-darker);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: radial-gradient(circle at 20% 30%, rgba(0, 209, 178, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(0, 209, 178, 0.05) 0%, transparent 50%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      border: 1px solid var(--border-color);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
  `
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
