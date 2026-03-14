import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventStats } from './event.models';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private apiUrl = 'http://localhost:3100/events';

    constructor(private http: HttpClient) { }

    getEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(this.apiUrl);
    }

    getEventById(id: string): Observable<Event> {
        return this.http.get<Event>(`${this.apiUrl}/${id}`);
    }

    getStats(): Observable<EventStats> {
        return this.http.get<EventStats>(`${this.apiUrl}/stats`);
    }

    createEvent(event: any): Observable<Event> {
        return this.http.post<Event>(this.apiUrl, event);
    }

    updateEvent(id: string, event: any): Observable<Event> {
        return this.http.patch<Event>(`${this.apiUrl}/${id}`, event);
    }

    deleteEvent(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    assignVolunteer(eventId: string, userId: string): Observable<Event> {
        return this.http.post<Event>(`${this.apiUrl}/${eventId}/volunteers/${userId}`, {});
    }

    removeVolunteer(eventId: string, userId: string): Observable<Event> {
        return this.http.delete<Event>(`${this.apiUrl}/${eventId}/volunteers/${userId}`);
    }
}
