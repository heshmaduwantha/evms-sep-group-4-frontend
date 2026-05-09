import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RoleService } from './role.service';
import { DashboardStats, EventRoleStat } from './role.models';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { timeout, catchError, of } from 'rxjs';

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
  loading = false;

  constructor(
    private roleService: RoleService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    console.log('[RoleDashboard] Initializing stats load...');
    // loading remains false to show page immediately
    
    this.roleService.getDashboardStats().pipe(
      timeout(8000),
      catchError(err => {
        console.error('[RoleDashboard] Request error or timeout:', err);
        return of({ totalEvents: 0, totalRoles: 0, volunteersAssigned: 0, eventStats: [] });
      })
    ).subscribe({
      next: (data) => { 
        console.log('[RoleDashboard] Data received:', data);
        this.stats = data; 
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[RoleDashboard] Unexpected error:', err);
        this.loading = false;
        this.cdr.detectChanges();
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

  getAllEvents(): EventRoleStat[] {
    return this.stats?.eventStats || [];
  }
}
