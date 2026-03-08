import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManualCheckinService {
  private apiUrl = '/api/manual-checkin';

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

  updateCheckin(volunteerId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/checkin/${volunteerId}`, data);
  }

  createAttendance(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  getSummary(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary/${eventId}`);
  }

  markAbsent(volunteerId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-absent/${volunteerId}`, {});
  }
}
