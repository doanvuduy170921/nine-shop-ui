import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UpdateUserRequest,
  UpdateUserResponse,
  UsersResponse
} from '../models/user.model';
import {ApiResponse} from "../models/product.model";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllUsersV2(params: any): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.apiUrl}/get-all-v2`, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  softDeleteUser(userUuid: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/soft-delete/${userUuid}`,
      {}, // body rỗng vì backend chỉ cần UUID
      { headers: this.getAuthHeaders() }
    );
  }

  updateUser(userUuid: string, userData: UpdateUserRequest): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(
      `${this.apiUrl}/update/${userUuid}`,
      userData,
      { headers: this.getAuthHeaders() }
    );
  }

// Thêm method để lấy thông tin 1 user
  getUserByUuid(userUuid: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/${userUuid}`, {
      headers: this.getAuthHeaders()
    });
  }


}
