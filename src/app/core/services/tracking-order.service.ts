import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TrackingOrderResponse, TrackingOrderResponseV2} from '../models/tracking-order.model';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TrackingOrderService {

  private baseUrl = `${environment.apiUrl}/order/get-tracking`;
  private baseUrlV2 = `${environment.apiUrl}/order/get-tracking-v2`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getTracking(orderId: number): Observable<TrackingOrderResponse> {
    return this.http.get<TrackingOrderResponse>(
      `${this.baseUrl}/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getTrackingV2(orderId: number): Observable<TrackingOrderResponseV2> {
    return this.http.get<TrackingOrderResponseV2>(
      `${this.baseUrlV2}/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
