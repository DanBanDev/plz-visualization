import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { LoginRequest } from "../../models/login-request.model";
import { RegisterRequest } from "../../models/register-request.model";
import { User } from "../../models/user.model";

const baseUrl = '/api/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthApiClient {

  constructor(
    private readonly http: HttpClient
  ) {}

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(`${baseUrl}/login`, request, { withCredentials: true });
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${baseUrl}/register`, request, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${baseUrl}/logout`, {}, { withCredentials: true });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${baseUrl}/me`, { withCredentials: true });
  }

}
