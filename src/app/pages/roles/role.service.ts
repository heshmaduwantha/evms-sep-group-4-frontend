import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Role, CreateRoleDto, UpdateRoleDto,
  AssignVolunteerDto, DashboardStats, VolunteerSummary
} from './role.models';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = 'http://localhost:3100/roles';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getRolesByEvent(eventId: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/event/${eventId}`);
  }

  getApprovedVolunteers(eventId: string): Observable<VolunteerSummary[]> {
    return this.http.get<VolunteerSummary[]>(`${this.apiUrl}/event/${eventId}/approved-volunteers`);
  }

  createRole(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, dto);
  }

  updateRole(id: string, dto: UpdateRoleDto): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/${id}`, dto);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignVolunteer(roleId: string, dto: AssignVolunteerDto): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${roleId}/assign`, dto);
  }

  removeVolunteer(roleId: string, userId: string): Observable<Role> {
    return this.http.delete<Role>(`${this.apiUrl}/${roleId}/assign/${userId}`);
  }
}
