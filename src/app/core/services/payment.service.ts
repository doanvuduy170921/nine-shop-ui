import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetAllPaymentMethodsResponse } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = '${API_BASE_URL}/payment';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllPaymentMethods(): Observable<GetAllPaymentMethodsResponse> {
    return this.http.get<GetAllPaymentMethodsResponse>(
      `${this.apiUrl}/get-all`,
      { headers: this.getAuthHeaders() }
    );
  }
}
