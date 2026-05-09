import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../auth/auth.service';
import { User, UserRole } from '../../auth/auth.models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule, TagModule],
  templateUrl: './settings.component.html',
  styles: [`
    .settings-container {
      padding: 1rem;
    }
    .user-table {
      margin-top: 1rem;
    }
    .error {
      color: red;
      margin-top: 10px;
    }
  `]
})
export class SettingsComponent implements OnInit {

  users: User[] = [];
  loading: boolean = true;
  error: string = '';
  isOrganizer: boolean = false;

  constructor(private authService: AuthService) {}

  
  ngOnInit(): void {
    this.authService.currentUser.subscribe((user: User | null) => {

      
      if (!user) {
        this.loading = false;
        this.error = 'User not logged in';
        return;
      }

      // ✅ Role check
      this.isOrganizer =
        user.role === UserRole.ORGANIZER ||
        user.role === UserRole.ADMIN;

      // ✅ Access control
      if (this.isOrganizer) {
        this.loadUsers();
      } else {
        this.loading = false;
        this.error = 'Access denied. Only organizers can view user lists.';
      }
    });
  }

  
  loadUsers(): void {
    this.loading = true;

    this.authService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'Failed to load users.';
        this.loading = false;
      }
    });
  }

 
  getSeverity(role: string): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
    switch (role) {
      case 'admin': return 'danger';
      case 'organizer': return 'info';
      case 'volunteer': return 'success';
      default: return 'secondary';
    }
  }
}