import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UserRole } from '../../auth/auth.models';

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

  `
})
export class SidebarComponent implements OnInit {
  navItems = [
    { label: 'Dashboard', icon: 'pi pi-th-large', link: '/home', roles: [UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Events Hub', icon: 'pi pi-calendar', link: '/events', roles: [UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Event Management', icon: 'pi pi-list', link: '/events/manage', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Applications', icon: 'pi pi-file', link: '/applications', roles: [UserRole.VOLUNTEER, UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Roles', icon: 'pi pi-users', link: '/roles', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Attendance', icon: 'pi pi-check-square', link: '/attendance', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Reports', icon: 'pi pi-chart-bar', link: '/reports', roles: [UserRole.ORGANIZER, UserRole.ADMIN] },
    { label: 'Settings', icon: 'pi pi-cog', link: '/settings', roles: [UserRole.ORGANIZER, UserRole.VOLUNTEER, UserRole.ADMIN] }
  ];

  filteredItems: any[] = [];

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.filteredItems = this.navItems.filter(item => item.roles.includes(user.role));
      }
    });
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
