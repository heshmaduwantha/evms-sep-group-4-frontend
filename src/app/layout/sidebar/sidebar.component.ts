import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,   
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  expandedMenu: string | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  logout() {
  this.auth.logout();          // clear token + user
  this.router.navigate(['/auth/login']); // redirect
}

  toggleExpand(menu: string) {
    this.expandedMenu =
      this.expandedMenu === menu ? null : menu;
  }
}