import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:3200/attendance';

  constructor(private http: HttpClient) {}

  getAttendanceOverview(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/overview/${eventId}`);
  }

  getVolunteerRoster(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roster/${eventId}`);
  }

  getRecentCheckIns(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent-checkins/${eventId}`);
  }

  checkIn(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-in`, data);
  }
}
