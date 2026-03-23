import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { VolunteerService } from '../../services/volunteer.service';
import { Volunteer } from '../../models/volunteer.model';


import { AuthService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ]
})
export class VolunteerListComponent implements OnInit, AfterViewInit {
toggleStatus(_t66: any) {
throw new Error('Method not implemented.');
}

  displayedColumns: string[] = ['name', 'email', 'skills', 'status', 'actions'];
  dataSource = new MatTableDataSource<Volunteer>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private volunteerService: VolunteerService,
    public auth: AuthService
     
  ) {}
  

  ngOnInit(): void {
    this.loadVolunteers();
  }

  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadVolunteers() {
    this.volunteerService.getAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  deactivate(id: number) {
    this.volunteerService.deactivate(id).subscribe(() => {
      this.loadVolunteers();
    });
  }

  
}