import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { LoginRequest } from "../../models/login-request.model";
import { RegisterRequest } from "../../models/register-request.model";
import { User } from "../../models/user.model";

const baseUrl = '/api/auth';

interface AuthResponse {
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiClient {

  constructor(
    private readonly http: HttpClient
  ) {}

  login(request: LoginRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/login`, request, { withCredentials: true })
      .pipe(map(response => response.user));
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/register`, request, { withCredentials: true })
      .pipe(map(response => response.user));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${baseUrl}/logout`, {}, { withCredentials: true });
  }

  getCurrentUser(): Observable<User> {
    return this.http
      .get<AuthResponse>(`${baseUrl}/me`, { withCredentials: true })
      .pipe(map(response => response.user));
  }

}
