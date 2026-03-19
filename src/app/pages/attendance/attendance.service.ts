import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:3100/attendance';

  constructor(private http: HttpClient) { }

  getAttendanceOverview(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/overview/${eventId}`);
  }

  getVolunteerRoster(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roster/${eventId}`);
  }

  getRecentCheckIns(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent-checkins/${eventId}`);
  }

  checkIn(eventId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-in/${eventId}`, data);
  }

  getVolunteerCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/volunteer-count`);
  }

  getApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/applications`);
  }

  updateCheckIn(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  deleteCheckIn(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
