import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManualCheckinService {
  private apiUrl = 'http://localhost:3200/manual-checkin';

  constructor(private http: HttpClient) {}

  getVolunteers(
    eventId: string,
    search?: string,
    status?: string
  ): Observable<any> {
    const params: any = { eventId };
    if (search) params.search = search;
    if (status) params.status = status;

    return this.http.get(`${this.apiUrl}/volunteers/${eventId}`, { params });
  }

  updateCheckin(eventId: string, volunteerId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/checkin/${eventId}/${volunteerId}`, data);
  }

  createAttendance(eventId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create/${eventId}`, data);
  }

  getSummary(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary/${eventId}`);
  }

  markAbsent(eventId: string, volunteerId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-absent/${eventId}/${volunteerId}`, {});
  }

  updateVolunteer(volunteerId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/volunteer/${volunteerId}`, data);
  }

  deleteVolunteer(volunteerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/volunteer/${volunteerId}`);
  }
}
