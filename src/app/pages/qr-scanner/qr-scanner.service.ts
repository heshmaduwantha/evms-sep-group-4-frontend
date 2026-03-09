import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {
  private apiUrl = '/api/qr-scanner';

  constructor(private http: HttpClient) {}

  processScan(qrCode: string, eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-scan`, { qrCode, eventId });
  }

  getSessionStats(eventId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/session-stats/${eventId}`);
  }

  getRecentScans(eventId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent-scans/${eventId}`);
  }
}
