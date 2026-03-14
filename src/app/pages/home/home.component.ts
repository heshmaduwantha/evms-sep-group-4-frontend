import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../auth/auth.service';
import { EventService } from '../events/event.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
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
export class HomeComponent implements OnInit {
  stats: any = {
    upcomingEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    totalEvents: 0
  };
  totalVolunteers: number = 0;

  constructor(
    public authService: AuthService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.eventService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => console.error('Error loading stats', err)
    });

    this.authService.getUsers().subscribe({
      next: (users) => {
        this.totalVolunteers = users.filter(u => u.role === 'volunteer').length;
      },
      error: (err) => console.error('Error loading users', err)
    });
  }
}
