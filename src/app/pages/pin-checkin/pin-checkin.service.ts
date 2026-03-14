import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinCheckinService {
  private apiUrl = 'http://localhost:3200/attendance';

  constructor(private http: HttpClient) {}

  checkInByPin(eventId: string, pin: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-in-by-pin/${eventId}`, { pin });
  }
}
