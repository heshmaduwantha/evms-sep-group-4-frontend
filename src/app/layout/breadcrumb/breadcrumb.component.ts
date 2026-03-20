import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Breadcrumb, BreadcrumbService } from '../../shared/services/breadcrumb.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-container">
      <ol class="breadcrumb-list">
        <li class="breadcrumb-item">
          <a routerLink="/home" class="breadcrumb-link"><i class="pi pi-home"></i></a>
        </li>
        <li *ngFor="let breadcrumb of breadcrumbs$ | async; let last = last" class="breadcrumb-item">
          <i class="pi pi-angle-right separator"></i>
          <a *ngIf="!last" [routerLink]="breadcrumb.url" class="breadcrumb-link">
            {{ breadcrumb.label }}
          </a>
          <span *ngIf="last" class="current-page">
            {{ breadcrumb.label }}
          </span>
        </li>
      </ol>
    </nav>
  `,
  styles: `
    .breadcrumb-container {
      margin-bottom: 1.5rem;
      padding: 0.5rem 0;
    }
    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      padding: 0;
      margin: 0;
      flex-wrap: wrap;
    }
    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      color: #64748b;
    }
    .breadcrumb-link {
      text-decoration: none;
      color: #64748b;
      transition: color 0.2s;
      font-weight: 500;
    }
    .breadcrumb-link:hover {
      color: var(--primary-color);
    }
    .separator {
      margin: 0 0.75rem;
      font-size: 0.75rem;
      color: #cbd5e1;
    }
    .current-page {
      color: #14b8a6; /* Teal color requested */
      font-weight: 600;
    }
    .pi-home {
      font-size: 1rem;
    }
  `
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs$: Observable<Breadcrumb[]>;

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  }

  ngOnInit(): void {}
}
