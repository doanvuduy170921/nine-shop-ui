import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import {RegisterData, RegisterRequest} from "../models/user.model";
import {ApiResponse} from "../models/product.model";
import {API_BASE_URL} from "../../../../environment.prod";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '${API_BASE_URL}/auth';

  // ✅ BehaviorSubject để theo dõi trạng thái login
  private authStatus = new BehaviorSubject<boolean>(this.isAuthenticated());
  authStatus$ = this.authStatus.asObservable();

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map((res: any) => {
        if (res.success && res.data) {
          if (res.data.access_token) {
            this.tokenStorage.saveToken(res.data.access_token);
          }
          if (res.data.refresh_token) {
            this.tokenStorage.saveRefreshToken(res.data.refresh_token);
          }
          if (res.data.role) {
            this.tokenStorage.saveRole(res.data.role);
          }

          // ✅ Cập nhật trạng thái đăng nhập
          this.authStatus.next(true);
        }
        return res;
      })
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.authStatus.next(false); // ✅ cập nhật khi logout
  }

  // ✅ Đổi tên lại cho dễ đọc
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAuthenticated(): boolean {
    return !!this.tokenStorage.getToken();
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getToken();
  }

  getRefreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }

  getRole(): string {
    return this.tokenStorage.getRole();
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      map(res => {
        if (res.accessToken) {
          this.tokenStorage.saveToken(res.accessToken);
          return res.accessToken;
        }
        throw new Error('No accessToken in response');
      })
    );
  }

  saveAccessToken(token: string): void {
    this.tokenStorage.saveToken(token);
  }

  register(user: RegisterRequest): Observable<ApiResponse<RegisterData>> {
    return this.http.post<ApiResponse<RegisterData>>(`${this.apiUrl}/create`, user);
  }

  validateRegisterOtp(data: {otp: string, email: string}): Observable<any> {
    return this.http.post(`${API_BASE_URL}/auth/validate-otp`, data);
  }
}
