import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://rfxrzgdfiehcqhfqxxlz.supabase.co/functions/v1/hyper-responder';
  private tokenKey = 'auth_token';

  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser: Observable<any> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  // ===== UTILITÁRIOS =====
  private getStoredUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private getStoredToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private storeUser(user: any, token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem(this.tokenKey, token);
    this.currentUserSubject.next(user);
  }

  private clearUser() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  private getHeaders() {
    const token = this.getStoredToken();
    const headersConfig: any = {};
    if (token) headersConfig['X-Auth-Token'] = token;
    headersConfig['Authorization'] = `Bearer ${environment.supabase.key}`;
    return new HttpHeaders(headersConfig);
  }

  // ===== MÉTODOS =====
  cadastro(tipo: 'psicologo' | 'paciente', data: any) {
    return this.http.post<any>(`${this.baseUrl}/cadastro`, { tipo, ...data }, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.success) this.storeUser(res.user, res.token);
      })
    );
  }

  login(tipo: 'psicologo' | 'paciente', email: string, senha: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, { tipo, email, senha }, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.success) this.storeUser(res.user, res.token);
      })
    );
  }

  me() {
    return this.http.get<any>(`${this.baseUrl}/me`, { headers: this.getHeaders() }).pipe(
      tap(res => {
        if (res.success) this.currentUserSubject.next(res.user);
      })
    );
  }

  logout() {
    this.clearUser();
  }

  isAuthenticated(): boolean {
    return !!this.getStoredUser();
  }
}
