import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserRole } from '../../auth/auth.models';
import { AttendanceService } from '../../pages/attendance/attendance.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styles: `
    .sidebar {
      width: 250px;
      height: 100vh;
      background: #0b0e14;
      border-right: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      overflow-y: auto;
    }
    .brand {
      padding: 2.5rem 1.5rem;
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .menu {
      flex: 1;
      padding: 0 0.75rem;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 1rem 1.25rem;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: 0.95rem;
    }
    .menu-item:hover {
      background: rgba(255,255,255,0.03);
      color: white;
    }
    .menu-item.active {
      background: rgba(0, 209, 178, 0.15);
      color: var(--primary-color);
    }
    .menu-item.expandable {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .expand-icon {
      font-size: 0.7rem;
      transition: transform 0.2s;
    }
    .expand-icon.expanded {
      transform: rotate(90deg);
    }
    .submenu {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding-left: 1rem;
      margin-bottom: 0.5rem;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .submenu.expanded {
      max-height: 500px;
    }
    .submenu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.65rem 1rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 6px;
      margin-bottom: 0.3rem;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    .submenu-item:hover, .submenu-item.active {
      background: rgba(0, 209, 178, 0.1);
      color: var(--primary-color);
    }
    .badge {
      display: inline-block;
      background: var(--primary-color);
      color: white;
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      margin-left: auto;
      font-weight: bold;
    }
    .profile {
      padding: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      color: #94a3b8;
    }
    .avatar {
      width: 35px;
      height: 35px;
      background: var(--primary-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #0b0e14;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
    }
    .user-role {
      font-size: 0.75rem;
      color: #64748b;
    }
    .menu-divider {
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 1.5rem 1.25rem 1rem;
    }

  `
})
export class SidebarComponent implements OnInit {
  navItems = [
    { label: 'Dashboard', icon: 'pi pi-th-large', link: '/home', roles: [UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Events Hub', icon: 'pi pi-calendar', link: '/events', roles: [UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'event-manger(organzier)', icon: 'pi pi-list', link: '/organizer/events', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Applications', icon: 'pi pi-file', link: '/applications', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'My Applications', icon: 'pi pi-file', link: '/my-applications', roles: [UserRole.VOLUNTEER] },
    { label: 'Roles', icon: 'pi pi-users', link: '/roles', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
    {
      label: 'Attendance',
      icon: 'pi pi-check-square',
      link: '/attendance',
      roles: [UserRole.ORGANIZER, UserRole.ADMIN],
      expandable: true,
      expanded: false,
      badge: 44,
      children: [
        { label: 'Overview', icon: 'pi pi-eye', link: '/attendance', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
        { label: 'Manual Check-in', icon: 'pi pi-user-plus', link: '/manual-checkin', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
        { label: 'Attendance Reports', icon: 'pi pi-chart-bar', link: '/reports', roles: [UserRole.ORGANIZER, UserRole.ADMIN ] }
      ]
    },
    { label: 'Settings', icon: 'pi pi-cog', link: '/settings', roles: [UserRole.ORGANIZER, UserRole.VOLUNTEER, UserRole.ADMIN], isBottom: true }
  ];

  filteredItems: any[] = [];

  constructor(
    public authService: AuthService,
    private attendanceService: AttendanceService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.filteredItems = this.navItems.filter(item => item.roles.includes(user.role) && !item.isBottom);

        // Update attendance badge if it exists in filtered items
        const attendanceItem = this.filteredItems.find(item => item.label === 'Attendance');
        if (attendanceItem) {
          this.attendanceService.getVolunteerCount().subscribe((count: number) => {
            attendanceItem.badge = count;
          });
        }
      }
    });
  }

  toggleExpand(item: any) {
    if (item.expandable) {
      item.expanded = !item.expanded;
    }
    if (item.link) {
      this.router.navigate([item.link]);
    }
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
