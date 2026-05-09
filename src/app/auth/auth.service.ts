import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, AuthResponse } from './auth.models';
import { environment } from '../../environments/environment';

export type UserRole = 'admin' | 'organizer' | 'volunteer';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // ✅ LOGIN
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  // ✅ LOGOUT
  logout(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }

  // ✅ REGISTER
  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  // ✅ GET USERS (ADMIN)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  // ✅ TOKEN
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isOrganizer(): boolean {
    return this.getRole() === 'organizer';
  }

  isVolunteer(): boolean {
    return this.getRole() === 'volunteer';
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getRole();
    return !!userRole && roles.includes(userRole);
  }

  // Merged from volunteer branch
  canManageVolunteers(): boolean {
    return this.isAdmin() || this.isOrganizer();
  }

  isOwner(resourceOwnerId: string): boolean {
    return this.currentUserValue?.id === resourceOwnerId;
  }
}