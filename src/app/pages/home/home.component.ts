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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, ProgressBarModule, TagModule, AvatarModule],
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

  nearestEvent: any = null;
  recentEvents: any[] = [];
  recentApplications: any[] = [];
  recentCheckIns: any[] = [];
  alerts: any[] = [];

  constructor(
    public authService: AuthService,
    private eventService: EventService,
    private reportsService: ReportsService,
    private attendanceService: AttendanceService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user?.role === UserRole.VOLUNTEER) {
        this.router.navigate(['/events']);
      } else {
        this.loadStats();
        this.loadRecentEvents();
      }
    });
  }

  loadStats() {
    this.eventService.getStats().subscribe({
      next: (data: any) => {
        this.stats.activeEvents.value = data.activeEvents || 0;
      }
    });

    this.attendanceService.getVolunteerCount().subscribe({
      next: (count) => {
        this.stats.totalVolunteers.value = count || 0;
      }
    });

    this.reportsService.getSummary('').subscribe({
      next: (summary) => {
        this.stats.attendanceRate.value = summary.attendanceRate || 0;
      }
    });

    this.attendanceService.getApplications().subscribe({
      next: (apps) => {
        this.recentApplications = apps.map(app => ({
          ...app,
          eventTitle: this.getEventName(app.event),
          color: this.getAvatarColor(app.name)
        }));
        this.stats.pendingApplications.value = apps.length;
      }
    });

    this.attendanceService.getRecentCheckIns('all').subscribe({
      next: (checkins) => {
        this.recentCheckIns = checkins.map(c => ({
          ...c,
          color: this.getAvatarColor(c.name)
        }));
      }
    });
  }

  loadRecentEvents() {
    this.eventService.getEvents().subscribe({
      next: (events: Event[]) => {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        // Events starting this week
        const startingThisWeek = events.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= now && eventDate <= nextWeek;
        }).length;

        // Find nearest upcoming event
        const upcoming = events
          .filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        this.nearestEvent = upcoming.length > 0 ? upcoming[0] : (events.length > 0 ? events[0] : null);

        this.recentEvents = events.slice(0, 5).map(e => {
          const staffed = e.volunteers?.length || 0;
          const needed = e.volunteersNeeded || 1;
          return {
            ...e,
            volunteersCount: staffed,
            progress: Math.min(100, Math.round((staffed / needed) * 100))
          };
        });

        // Re-map application titles and update alerts
        this.recentApplications.forEach(app => {
          app.eventTitle = this.getEventName(app.event);
        });

        this.updateAlerts(startingThisWeek);
      }
    });
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

  getEventStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'upcoming': return 'info';
      case 'completed': return 'warning';
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
}
