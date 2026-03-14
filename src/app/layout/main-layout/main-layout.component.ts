import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styles: `
    .main-wrapper {
      display: flex;
      min-height: 100vh;
    }
    .content-area {
      flex: 1;
      margin-left: 250px; /* Sidebar width */
      display: flex;
      flex-direction: column;
      background: var(--bg-light);
      padding: 2rem;
    }
    .main-content {
      flex: 1;
    }
  `
})
export class MainLayoutComponent { }
