import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser = signal<AuthResponse | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  inscrire(data: { nom: string; prenom: string; telephone: string; email?: string; motDePasse: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/inscription`, data)
      .pipe(tap(res => this.saveSession(res.data)));
  }

  connecter(data: { telephone: string; motDePasse: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/connexion`, data)
      .pipe(tap(res => this.saveSession(res.data)));
  }

  deconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/connexion']);
  }

  getToken(): string | null { return localStorage.getItem('token'); }
  isAdmin(): boolean { return this.currentUser()?.role === 'ADMIN'; }
  isCaissier(): boolean { return ['ADMIN','CAISSIER'].includes(this.currentUser()?.role ?? ''); }
  isLoggedIn(): boolean { return !!this.currentUser(); }

  private saveSession(user: AuthResponse) {
    localStorage.setItem('token', user.token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUser(): AuthResponse | null {
    try { return JSON.parse(localStorage.getItem('user') ?? 'null'); }
    catch { return null; }
  }
}
