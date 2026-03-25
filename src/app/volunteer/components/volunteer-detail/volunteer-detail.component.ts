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
      this.volunteerService.getById(+id).subscribe(data => {
        this.volunteer = data; 
      });
    }
  }
}