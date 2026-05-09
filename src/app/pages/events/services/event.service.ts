import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

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

  getEvents(): Observable<any[]> {
    return this.eventsSubject.value.length > 0 ? this.events$ : this.refreshEvents();
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(this.apiUrl, eventData).pipe(tap(() => this.refreshEvents().subscribe()));
  }

  updateEvent(id: string, eventData: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, eventData).pipe(tap(() => this.refreshEvents().subscribe()));
  }

  deleteEvent(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(tap(() => this.refreshEvents().subscribe()));
  }

  cancelEvent(id: string) {
    return this.http.patch(`${this.apiUrl}/${id}`, { status: 'cancelled' }).pipe(tap(() => this.refreshEvents().subscribe()));
  }

  getEventById(id: string): Observable<any> {
    // Try to find in local subject first for instant load
    const localEvent = this.eventsSubject.value.find(e => e.id === id);
    if (localEvent) {
      return new Observable(observer => {
        observer.next(localEvent);
        // Still fetch from server to get latest details (like volunteers)
        this.http.get(`${this.apiUrl}/${id}`).pipe(map((res: any) => res.data || res))
          .subscribe(freshData => observer.next(freshData));
      });
    }
    return this.http.get(`${this.apiUrl}/${id}`).pipe(map((res: any) => res.data || res));
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}