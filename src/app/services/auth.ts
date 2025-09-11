import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { AuthApiResponse, LoginUser, RegisterUser } from '../models/auth/auth.model';
import { map, Observable } from 'rxjs';
import { AuthApiResponseDTO } from '../models/auth/auth.dto';
import { MapAuthResponse } from '../models/auth/auth.mappers';
import { TokenService } from './token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  aBaseUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);

  register(u: RegisterUser): Observable<AuthApiResponse> {
    return this.http
      .post<AuthApiResponseDTO>(`${this.aBaseUrl}/register`, u, { withCredentials: true })
      .pipe(map(MapAuthResponse));
  }

  refresh(): Observable<AuthApiResponse> {
    return this.http
      .post<AuthApiResponseDTO>(`${this.aBaseUrl}/refresh`, {}, { withCredentials: true })
      .pipe(map(MapAuthResponse));
  }

  login(u: LoginUser): Observable<AuthApiResponse> {
    return this.http
      .post<AuthApiResponseDTO>(`${this.aBaseUrl}/login`, u, {
        withCredentials: true,
      })
      .pipe(map(MapAuthResponse));
  }

  logout() {
    return this.http.post(`${this.aBaseUrl}/logout`, {}, { withCredentials: true });
  }
}
