import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http'; // ✅ Import manquant
import { ApiService } from '../api.service';

export interface User {
  _id: string;
  nom: string;
  email: string;
  role: string;
  poste: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    _id: string;
    nom: string;
    email: string;
    role: string;
    poste: string;
    token: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('current_user');
    const token = localStorage.getItem('auth_token');

    if (userJson && token) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
  }

  register(userData: any): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', userData);
  }

  setUser(user: User, token: string): void {
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  logout(): void {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('Utilisateur non authentifié');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
