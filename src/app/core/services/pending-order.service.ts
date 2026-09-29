// src/app/core/services/pending-order.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreatePendingOrderRequest,
  CreatePendingOrderResponse,
  ValidateOtpRequest,
  ValidateOtpResponse
} from "../models/pending_order.model";


@Injectable({
  providedIn: 'root'
})
export class PendingOrderService {
  private apiUrl = '${API_BASE_URL}/pending-order';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createPendingOrder(request: CreatePendingOrderRequest): Observable<CreatePendingOrderResponse> {
    return this.http.post<CreatePendingOrderResponse>(
      `${this.apiUrl}/create`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  validateOtp(request: ValidateOtpRequest): Observable<ValidateOtpResponse> {
    return this.http.post<ValidateOtpResponse>(
      `${this.apiUrl}/validate-otp`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

}
