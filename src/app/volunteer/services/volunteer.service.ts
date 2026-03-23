import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Volunteer } from '../models/volunteer.model';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {

  private apiUrl = 'http://localhost:3200/volunteers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Volunteer[]> {
    return this.http.get<Volunteer[]>(this.apiUrl);
  }

  getById(id: number): Observable<Volunteer> {
    return this.http.get<Volunteer>(`${this.apiUrl}/${id}`);
  }

  create(volunteer: Volunteer): Observable<any> {
    return this.http.post(this.apiUrl, volunteer);
  }

  update(id: number, volunteer: Volunteer): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, volunteer);
  }

  deactivate(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/deactivate`, {});
  }
}