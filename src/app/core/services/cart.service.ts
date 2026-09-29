// src/app/core/services/cart.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddToCartRequest,
  AddToCartResponse, CartItem,
  GetCartResponse,
  UpdateAllCartRequest,
  UpdateAllCartResponse
} from '../models/cart.model';
import {ApiResponse} from "../models/product.model";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = '${API_BASE_URL}/cart';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  addToCart(params: { variant_id: number, quantity: number }): Observable<ApiResponse<CartItem>> {
    return this.http.post<ApiResponse<CartItem>>(`${this.apiUrl}/add-to-cart`, params,{ headers: this.getAuthHeaders() });
  }
  getAllInCart(): Observable<GetCartResponse> {
    return this.http.get<GetCartResponse>(
      `${this.apiUrl}/get-all-in-cart`,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteCartItem(variant_id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete`,
      {
        headers: this.getAuthHeaders(),
        body: { variant_id: variant_id }
      }
    );
  }

  updateAllCart(request: UpdateAllCartRequest): Observable<UpdateAllCartResponse> {
    return this.http.put<UpdateAllCartResponse>(
      `${this.apiUrl}/update-all`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }


}
