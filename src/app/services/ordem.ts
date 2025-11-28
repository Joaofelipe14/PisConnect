import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ordem {
  private baseUrl = 'https://rfxrzgdfiehcqhfqxxlz.supabase.co/functions/v1/criar-ordem-assinatura';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) { }

  private getStoredToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private getHeaders() {
    const token = this.getStoredToken();
    const headersConfig: any = {};
    if (token) headersConfig['X-Auth-Token'] = token;
    headersConfig['Authorization'] = `Bearer ${environment.supabase.key}`;
    return new HttpHeaders(headersConfig);
  }

  gerarOrdemAssinatura(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data, { headers: this.getHeaders() })
      .pipe(
        map(res => {
            console.log(res)
          if (!res.success) {
            throw new Error(res.error || 'Erro no cadastro');
          }
          return res;
        }),
        catchError(err => {
          console.error('Erro no cadastro:', err);
          return throwError(() => err);
        })
      );
  }



}