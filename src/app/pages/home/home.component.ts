import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './home.component.html',
  styles: `
    .welcome-section {
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      border-color: var(--primary-color);
    }
  `
})
export class HomeComponent {
  constructor(public authService: AuthService) { }
}
