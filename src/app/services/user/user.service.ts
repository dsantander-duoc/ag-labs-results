import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
const LS_USER_KEY = 'auth.user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private base = `${environment.apiBaseUrlAuth}/users`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}`);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(`${this.base}`, user);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, user).pipe(
      tap((user) => {
        console.log('user', user);
        localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      }),
      catchError((error) => {
        console.error('error updating user', error);
        return throwError(() => new Error('Error al actualizar el usuario'));
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
