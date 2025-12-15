import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterDTO, User } from '../../models/user.model';
import { environment } from '../../../environments/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';

const LS_USER_KEY = 'auth.user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  /** Login and save user in localStorage **/
  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${environment.apiBaseUrlAuth}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((user) => {
          localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
        }),
        catchError((error) => {
          console.error('error logging in', error);
          return throwError(() => new Error('Credenciales inválidas'));
        })
      );
  }

  register(dto: RegisterDTO): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrlAuth}/users`, dto);
  }

  /** Get user from localStorage */
  getUser(): User | null {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  /** Check if there is a session */
  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  /** Logout */
  logout(): void {
    localStorage.removeItem(LS_USER_KEY);
  }
}
