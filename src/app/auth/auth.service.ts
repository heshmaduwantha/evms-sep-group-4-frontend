import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, AuthResponse } from './auth.models';

export type UserRole = 'admin' | 'organizer' | 'volunteer';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
isOwner(arg0: any): any {
throw new Error('Method not implemented.');
}
canManageVolunteers(): any {
throw new Error('Method not implemented.');
}

  private apiUrl = 'http://localhost:3200/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getStoredUser()
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Get user from localStorage
  private getStoredUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // ✅ Current user value (sync access)
  get currentUser(): User | null {
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
    return this.http.get<User[]>('http://localhost:3200/users');
  }

  // ✅ TOKEN
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  

  getRole(): UserRole | null {
    return this.currentUser?.role || null;
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

  // ✅ ACCESS CONTROL (ADVANCED)
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getRole();
    return !!userRole && roles.includes(userRole);
  }
}