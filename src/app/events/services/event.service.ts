import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;
  
  private eventsSubject = new BehaviorSubject<any[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) { }

  refreshEvents(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || response),
      tap(events => this.eventsSubject.next(events))
    );
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(this.apiUrl, eventData).pipe(
      tap(() => this.refreshEvents().subscribe())
    );
  }

  updateEvent(id: string, eventData: any) {
    return this.http.put(`${this.apiUrl}/${id}`, eventData).pipe(
      tap(() => this.refreshEvents().subscribe())
    );
  }

  deleteEvent(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshEvents().subscribe())
    );
  }

  cancelEvent(id: string) {
    return this.http.put(`${this.apiUrl}/${id}`, {
      status: 'CANCELLED'
    }).pipe(
      tap(() => this.refreshEvents().subscribe())
    );
  }

  getEvents(): Observable<any[]> {
    return this.eventsSubject.value.length > 0 ? this.events$ : this.refreshEvents();
  }

  getVolunteerEvents(): Observable<any[]> {
    return this.refreshEvents().pipe(
      map(events => events.filter((e: any) => e.status === 'upcoming' || e.status === 'active'))
    );
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getEventById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}