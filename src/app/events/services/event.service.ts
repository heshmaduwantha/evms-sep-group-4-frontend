import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = 'http://localhost:3100/events';

  constructor(private http: HttpClient) { }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(this.apiUrl, eventData);
  }

  updateEvent(id: string, eventData: any) {
    return this.http.put(`${this.apiUrl}/${id}`, eventData);
  }

  deleteEvent(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  cancelEvent(id: string) {
    return this.http.put(`${this.apiUrl}/${id}`, {
      status: 'CANCELLED'
    });
  }

  getEvents(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getEventById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}