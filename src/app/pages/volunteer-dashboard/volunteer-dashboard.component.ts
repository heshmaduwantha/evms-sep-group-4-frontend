import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { of } from 'rxjs';
import { take, catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { EventService } from '../../events/services/event.service';
import { ApplicationService } from '../applications/application.service';

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ProgressBarModule,
    AvatarModule,
    SkeletonModule
  ],
  templateUrl: './volunteer-dashboard.component.html',
  styleUrls: ['./volunteer-dashboard.component.css']
})
export class VolunteerDashboardComponent implements OnInit {
  loading = true;
  stats: any[] = [
    { key: 'applications', value: 0, label: 'Applications', icon: 'pi-file' },
    { key: 'events', value: 0, label: 'Available Events', icon: 'pi-calendar' },
    { key: 'hours', value: 0, label: 'Hours', icon: 'pi-clock' }
  ];

  upcomingEvents: any[] = [];
  myApplications: any[] = [];

  constructor(
    public authService: AuthService,
    private eventService: EventService,
    private applicationService: ApplicationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    let eventsLoaded = false;
    let appsLoaded = false;

    const checkDone = () => {
      if (eventsLoaded && appsLoaded) {
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    };

    // Safety fallback after 5s
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }, 5000);
    });

    this.eventService.refreshEvents().pipe(
      take(1),
      catchError(() => of([]))
    ).subscribe((events: any) => {
      this.ngZone.run(() => {
        const allEvents: any[] = Array.isArray(events) ? events : (events?.data || []);
        this.upcomingEvents = allEvents
          .filter((e: any) => e.status === 'upcoming' || e.status === 'active')
          .slice(0, 4);
        this.stats[1].value = this.upcomingEvents.length;
        eventsLoaded = true;
        checkDone();
        this.cdr.detectChanges();
      });
    });

    this.applicationService.getMyApplications().pipe(
      take(1),
      catchError(() => of([]))
    ).subscribe((apps: any[]) => {
      this.ngZone.run(() => {
        this.myApplications = (apps || []).slice(0, 4);
        this.stats[0].value = apps?.length || 0;
        appsLoaded = true;
        checkDone();
        this.cdr.detectChanges();
      });
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'published':
        return 'success';
      case 'pending':
      case 'upcoming':
        return 'info';
      case 'rejected':
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
