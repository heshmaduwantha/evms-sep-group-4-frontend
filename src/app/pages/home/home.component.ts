import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../auth/auth.service';
import { UserRole } from '../../auth/auth.models';
import { EventService } from '../events/services/event.service';
import { ReportsService } from '../reports/reports.service';
import { AttendanceService } from '../attendance/attendance.service';
import { Event } from '../events/event.models';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ApplicationService } from '../applications/application.service';
import { ApplicationStatus } from '../applications/application.models';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { Observable, forkJoin, of, BehaviorSubject } from 'rxjs';
import { catchError, map, retry, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, ProgressBarModule, TagModule, AvatarModule, SkeletonModule, ChartModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  stats: any = {
    totalVolunteers: { value: 0, trend: '+0%', label: 'total' },
    activeEvents: { value: 0, trend: '', label: 'active' },
    pendingApplications: { value: 0, trend: '', label: 'pending' },
    attendanceRate: { value: 0, trend: '', label: 'average' }
  };

  loading = true;
  nearestEvent: any = null;
  recentEvents: any[] = [];
  recentApplications: any[] = [];
  recentCheckIns: any[] = [];
  alerts: any[] = [];

  // Chart Data
  attendanceChartData: any;
  eventsChartData: any;
  chartOptions: any;

  constructor(
    public authService: AuthService,
    private eventService: EventService,
    private reportsService: ReportsService,
    private attendanceService: AttendanceService,
    private applicationService: ApplicationService,
    private router: Router
  ) { }

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user?.role === UserRole.VOLUNTEER) {
      this.router.navigate(['/volunteer/dashboard']);
    } else {
      this.initCharts();
      this.loadStats();
    }
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.attendanceChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Attendance Rate',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: true,
          borderColor: '#3b82f6',
          tension: 0.4,
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }
      ]
    };

    this.eventsChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Events Completed',
          backgroundColor: '#10b981',
          data: [4, 7, 5, 12, 8, 15]
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      maintainAspectRatio: false
    };
  }


  loadStats() {
    this.loading = true;
    const now = new Date();

    // 1. Stats and Individual Components
    this.eventService.getStats().pipe(take(1), catchError(() => of({ activeEvents: 0 }))).subscribe(stats => {
      this.stats.activeEvents.value = stats.activeEvents || 0;
    });

    this.attendanceService.getVolunteerCount().pipe(take(1), catchError(() => of(0))).subscribe(count => {
      this.stats.totalVolunteers.value = count || 0;
    });

    this.reportsService.getSummary('').pipe(take(1), catchError(() => of({ attendanceRate: 0 }))).subscribe(summary => {
      this.stats.attendanceRate.value = summary.attendanceRate || 0;
    });

    this.applicationService.getApplications().pipe(take(1), catchError(() => of([]))).subscribe(apps => {
      const pendingApps = (apps || []).filter((a: any) => a.status === ApplicationStatus.PENDING)
        .sort((a: any, b: any) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
        
      this.recentApplications = pendingApps.slice(0, 6).map((app: any) => ({
        ...app,
        name: app.user?.email ? app.user.email.split('@')[0] : 'Unknown',
        role: app.experience || 'Volunteer',
        eventTitle: app.event?.title || 'Unknown Event',
        time: this.getTimeAgo(new Date(app.appliedDate)),
        exp: app.experienceDetails || 'New volunteer',
        color: this.getAvatarColor(app.user?.email || 'Unknown')
      }));
      this.stats.pendingApplications.value = pendingApps.length;
    });

    this.attendanceService.getRecentCheckIns('all').pipe(take(1), catchError(() => of([]))).subscribe(checkins => {
      this.recentCheckIns = (checkins || []).slice(0, 5).map((c: any) => ({
        ...c,
        color: this.getAvatarColor(c.name)
      }));
    });

    this.eventService.getEvents().pipe(take(1), catchError(() => of([]))).subscribe(events => {
      const allEvents = Array.isArray(events) ? events : (events && (events as any).data ? (events as any).data : []);
      
      this.recentEvents = [...allEvents]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      const upcoming = [...allEvents]
        .filter((e: any) => new Date(e.date) >= now)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (upcoming.length > 0) {
        this.nearestEvent = upcoming[0];
      } else if (allEvents.length > 0) {
        this.nearestEvent = allEvents[0];
      } else {
        this.nearestEvent = { title: 'No Upcoming Events' };
      }
      
      this.loading = false;
    });

    // Final safety to clear loading even if all fail
    setTimeout(() => {
        this.loading = false;
        if (!this.nearestEvent) this.nearestEvent = { title: 'No Events Found' };
    }, 3000);
  }



  updateAlerts(startingThisWeek: number) {
    this.alerts = [];
    
    // Alert 1: Events this week
    if (startingThisWeek > 0) {
      this.alerts.push({
        text: `${startingThisWeek} event${startingThisWeek > 1 ? 's' : ''} starting this week`,
        color: 'green'
      });
    }

    // Alert 2: Applications
    if (this.recentApplications.length > 0) {
      this.alerts.push({
        text: `${this.recentApplications.length} application${this.recentApplications.length > 1 ? 's' : ''} need urgent review`,
        color: 'orange'
      });
    }

    // Alert 3: Staffing level for nearest event
    if (this.nearestEvent) {
      const staffed = this.nearestEvent.volunteers?.length || 0;
      const needed = this.nearestEvent.volunteersNeeded || 1;
      const progress = Math.min(100, Math.round((staffed / needed) * 100));
      this.alerts.push({
        text: `${this.nearestEvent.title} is ${progress}% staffed`,
        color: 'blue'
      });
    }
  }

  getEventStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'upcoming': return 'info';
      case 'completed': return 'warn';
      default: return 'secondary';
    }
  }

  getAvatarColor(name: string): string {
    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#007AFF', '#5856D6', '#FF2D55'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getEventName(eventId: string): string {
    if (!eventId) return 'General';
    const event = this.recentEvents.find(e => e.id === eventId);
    return event ? event.title : 'Event';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
}
