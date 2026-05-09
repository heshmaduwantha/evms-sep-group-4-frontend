import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManualCheckinService {
  private apiUrl = `${environment.apiUrl}/manual-checkin`;

  constructor(private http: HttpClient) { }

  getVolunteers(eventId: string, search?: string, status?: string): Observable<any> {
    const params: any = { eventId };
    if (search) params.search = search;
    if (status) params.status = status;
    return this.http.get<any[]>(`${this.apiUrl}/volunteers/${eventId}`, { params });
  }

  createVolunteer(data: any): Observable<any> {
    const eventId = data.eventId;
    return this.http.post(`${this.apiUrl}/create/${eventId}`, data);
  }

  updateVolunteer(id: string, data: any): Observable<any> {
    // Assuming the backend handles volunteer update via the 'volunteer/:id' route
    return this.http.post(`${this.apiUrl}/volunteer/${id}`, data);
  }

  deleteVolunteer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/volunteer/${id}`);
  }

  getSummary(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary/${eventId}`);
  }
}
