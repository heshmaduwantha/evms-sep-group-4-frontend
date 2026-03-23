import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RoleService } from './role.service';
import { DashboardStats, EventRoleStat } from './role.models';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-role-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ToastModule,
    ButtonModule, CardModule, ProgressBarModule
  ],
  providers: [MessageService],
  templateUrl: './role-dashboard.component.html',
  styleUrls: ['./role-dashboard.component.css']
})
export class RoleDashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalEvents: 0, totalRoles: 0,
    volunteersAssigned: 0, eventStats: []
  };
  loading = true;

  constructor(
    private roleService: RoleService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.roleService.getDashboardStats().subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dashboard' });
        this.loading = false;
      }
    });
  }

  navigateToEvent(eventId: string) {
    this.router.navigate(['/roles/event', eventId]);
  }

  getCoverageClass(pct: number): string {
    if (pct >= 100) return 'full';
    if (pct >= 60) return 'good';
    if (pct >= 30) return 'low';
    return 'critical';
  }

  getUpcomingEvents(): EventRoleStat[] {
    return this.stats.eventStats.filter(e => new Date(e.date) >= new Date());
  }
}
