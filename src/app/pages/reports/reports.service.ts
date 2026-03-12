import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = 'http://localhost:3200/reports';

  constructor(private http: HttpClient) {}

  getAttendanceReports(
    eventId: string,
    status?: string,
    department?: string,
    date?: string
  ): Observable<any> {
    const params = { eventId };
    if (status) Object.assign(params, { status });
    if (department) Object.assign(params, { department });
    if (date) Object.assign(params, { date });

    return this.http.get(`${this.apiUrl}/attendance`, { params });
  }

  getSummary(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`, { params: { eventId } });
  }

  getByDepartment(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-department`, { params: { eventId } });
  }

  exportPDF(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/export/pdf`, { params: { eventId } });
  }

  exportCSV(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/export/csv`, { params: { eventId } });
  }
}
