import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, CreateApplicationDto, UpdateApplicationDto, UpdateApplicationStatusDto, ApplicationStats, ApplicationStatus } from './application.models';

@Injectable({
    providedIn: 'root'
})
export class ApplicationService {
    private apiUrl = 'http://localhost:3100/applications';

    constructor(private http: HttpClient) { }

    getApplications(): Observable<Application[]> {
        return this.http.get<Application[]>(this.apiUrl);
    }

    getMyApplications(): Observable<Application[]> {
        return this.http.get<Application[]>(`${this.apiUrl}/my`);
    }

    getApplicationsByEvent(eventId: string): Observable<Application[]> {
        return this.http.get<Application[]>(`${this.apiUrl}/event/${eventId}`);
    }

    getApplication(id: string): Observable<Application> {
        return this.http.get<Application>(`${this.apiUrl}/${id}`);
    }

    applyForEvent(dto: CreateApplicationDto): Observable<Application> {
        return this.http.post<Application>(this.apiUrl, dto);
    }

    updateStatus(id: string, dto: UpdateApplicationStatusDto): Observable<Application> {
        return this.http.patch<Application>(`${this.apiUrl}/${id}/status`, dto);
    }

    updateApplication(id: string, dto: UpdateApplicationDto): Observable<Application> {
        return this.http.patch<Application>(`${this.apiUrl}/${id}`, dto);
    }

    deleteApplication(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getStats(applications: Application[]): ApplicationStats {
        return {
            totalApplications: applications.length,
            approved: applications.filter(a => a.status === ApplicationStatus.APPROVED).length,
            rejected: applications.filter(a => a.status === ApplicationStatus.REJECTED).length,
            waitlisted: applications.filter(a => a.status === ApplicationStatus.WAITLISTED).length,
            pending: applications.filter(a => a.status === ApplicationStatus.PENDING).length
        };
    }
}
