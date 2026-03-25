import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styles: `
    .footer {
      background: #0b1116;
      padding: 1.25rem 2rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      color: #94a3b8;
      text-align: center;
      font-size: 0.8rem;
      width: 100%;
    }
    .footer-content {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      opacity: 0.8;
    }
    .separator {
      opacity: 0.3;
    }
  `
})
export class FooterComponent { }
