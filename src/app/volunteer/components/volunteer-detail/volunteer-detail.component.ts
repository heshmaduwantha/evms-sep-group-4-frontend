import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VolunteerService } from '../../services/volunteer.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-volunteer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './volunteer-detail.component.html',
  styleUrls: ['./volunteer-detail.component.css']
})
export class VolunteerDetailComponent implements OnInit {

  volunteer: any; 

  constructor(
    private route: ActivatedRoute,  
    private volunteerService: VolunteerService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.volunteerService.getById(id).subscribe(data => {
        this.volunteer = data;
      });
    }
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'V';
  }

  getAvatarColor(name: string): string {
    const colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
    let hash = 0;
    if (!name) return colors[0];
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}