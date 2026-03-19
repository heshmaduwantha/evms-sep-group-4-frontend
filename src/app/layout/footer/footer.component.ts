import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styles: `
    .footer {
      background: #0b0e14;
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      color: #64748b;
      text-align: center;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }
    .footer-content {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
    }
    .separator {
      opacity: 0.3;
    }
  `
})
export class FooterComponent { }
