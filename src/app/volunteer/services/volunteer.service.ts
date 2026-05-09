import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Volunteer } from '../models/volunteer.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private apiUrl = `${environment.apiUrl}/volunteers`;
  
  private volunteersSubject = new BehaviorSubject<Volunteer[]>([]);
  public volunteers$ = this.volunteersSubject.asObservable();

  constructor(private http: HttpClient) {}

  refreshVolunteers(): Observable<Volunteer[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || response),
      tap(volunteers => this.volunteersSubject.next(volunteers))
    );
  }

  getVolunteers(): Observable<Volunteer[]> {
    return this.refreshVolunteers();
  }

  getById(id: string): Observable<Volunteer> {
    return this.http.get<Volunteer>(`${this.apiUrl}/${id}`);
  }

  create(volunteer: any): Observable<any> {
    return this.http.post(this.apiUrl, volunteer).pipe(
      tap(() => this.refreshVolunteers().subscribe())
    );
  }

  update(id: string, volunteer: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, volunteer).pipe(
      tap(() => this.refreshVolunteers().subscribe())
    );
  }

  deleteVolunteer(id: string): Observable<any> {
    // Backend uses Patch :id/toggle for status toggle, but keeping naming for compatibility
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, {}).pipe(
      tap(() => this.refreshVolunteers().subscribe())
    );
  }
}