import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styles: `
    .footer {
      background: var(--bg-darker);
      padding: 4rem 2rem;
      border-top: 1px solid var(--border-color);
      color: var(--text-muted);
    }
    .footer-brand {
      color: var(--text-main);
      font-weight: bold;
      font-size: 1.25rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-col-header {
      color: var(--text-main);
      font-weight: bold;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 1px;
    }
    .footer-link {
      display: block;
      color: var(--text-muted);
      text-decoration: none;
      margin-bottom: 0.75rem;
      transition: color 0.2s;
      font-size: 0.9rem;
    }
    .footer-link:hover {
      color: var(--primary-color);
    }
    .social-btn {
      width: 36px;
      height: 36px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
      color: var(--text-main);
      transition: all 0.2s;
    }
    .social-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .footer-bottom {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }
  `
})
export class FooterComponent { }
