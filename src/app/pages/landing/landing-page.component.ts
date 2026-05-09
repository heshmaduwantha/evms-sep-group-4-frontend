import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
    // Load Chart.js dynamically if not already present
    if (!window.hasOwnProperty('Chart')) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => this.initChart();
    }
  }

  ngAfterViewInit(): void {
    if (window.hasOwnProperty('Chart')) {
      this.initChart();
    }
    this.initAnimations();
  }

  initChart(): void {
    const canvas = document.getElementById('miniChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // @ts-ignore
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: [65, 82, 91, 78, 112, 45, 30],
          backgroundColor: (context: any) => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 80);
            gradient.addColorStop(0, 'rgba(20,184,166,.85)');
            gradient.addColorStop(1, 'rgba(20,184,166,.2)');
            return gradient;
          },
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f2744',
            titleColor: '#94a3b8',
            bodyColor: '#fff',
            padding: 8,
            cornerRadius: 8,
            displayColors: false,
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9, family: 'Inter' }, color: '#94a3b8' } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 9, family: 'Inter' }, color: '#94a3b8' }, beginAtZero: true }
        }
      }
    });
  }

  initAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .step, .lv-row, .cv-bar-wrap').forEach(el => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(20px)';
      (el as HTMLElement).style.transition = 'opacity .5s ease, transform .5s ease';
      observer.observe(el);
    });

    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.cv-bar-fill').forEach(bar => {
            const b = bar as HTMLElement;
            const w = b.style.width;
            b.style.width = '0';
            setTimeout(() => {
              b.style.transition = 'width 1s ease';
              b.style.width = w;
            }, 200);
          });
        }
      });
    }, { threshold: 0.3 });

    const compVis = document.querySelector('.compliance-visual');
    if (compVis) barObserver.observe(compVis);
  }
}
