import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, FooterComponent, BreadcrumbComponent],
  templateUrl: './main-layout.component.html',
  styles: `
    .main-wrapper {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .content-area {
      flex: 1;
      margin-left: 250px;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-light);
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 2rem 2rem 2rem;
    }
  `
})
export class MainLayoutComponent { }
