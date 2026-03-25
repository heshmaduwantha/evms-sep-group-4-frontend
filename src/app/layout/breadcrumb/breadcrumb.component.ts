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
      padding: 0.75rem 2rem 0.5rem 2rem;
      background: var(--bg-light);
      border-bottom: 1px solid rgba(0,0,0,0.04);
      z-index: 10;
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
