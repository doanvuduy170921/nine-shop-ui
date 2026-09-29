// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  OrderApiResponse,
  Order,
  OrderListItem,
  OrderDetailResponse,
  OrderDetailForMyOrder, PreViewOrderItem, OrderTracking, OrderDetailItem,
} from '../models/order.model';
import {ApiResponse} from "../models/product.model";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = `${environment.apiUrl}/order`;
  private apiUrl = `${environment.apiUrl}/order-item/get-all`;
  private apiUrlForAdmin = `${environment.apiUrl}/order/get-all`;
  private apiUrlForMyOrder = `${environment.apiUrl}/order/view-detail-for-my-order`;
  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<Order[]> {
    return this.http.get<OrderApiResponse>(this.apiUrl).pipe(
      map(response => this.groupOrdersByOrderId(response.data))
    );
  }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  private groupOrdersByOrderId(items: any[]): Order[] {
    const grouped: { [key: number]: Order } = {};

    items.forEach(item => {
      const orderId = item.order_id;

      if (!grouped[orderId]) {
        grouped[orderId] = {
          order_id: orderId,
          customer_name: item.customer_name,
          phone: item.phone,
          address: item.address,
          subtotal: item.subtotal,
          shipping_price: item.shipping_price,
          tax: item.tax,
          total_amount: item.total_amount,
          status: item.status || 'CONFIRMED', // Default nếu rỗng
          order_created_at: item.order_created_at,
          payment_method_name: item.payment_method_name,
          items: []
        };
      }

      grouped[orderId].items.push({
        variant_id: item.variant_id,
        product_name: item.product_name,
        product_thumbnail: item.product_thumbnail,
        quantity: item.quantity,
        item_price: item.item_price,
        sku: `PRD-${item.product_id}`
      });
    });

    return Object.values(grouped);
  }

  getAllOrders(): Observable<{ data: OrderListItem[], message: string, success: boolean }> {
    return this.http.get<{ data: OrderListItem[], message: string, success: boolean }>(
      this.apiUrlForAdmin,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
  getOrderDetail(orderId: number): Observable<OrderDetailResponse[]> {
    return this.http.get<{ data: OrderDetailResponse[] }>(
      `${environment.apiUrl}/order/${orderId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(res => res.data)
    );
  }

  updateOrderStatus(body: { status: string; order_id: number }) {
    return this.http.put(
      `${environment.apiUrl}/order/update`,
      body,
      { headers: this.getAuthHeaders(), observe: 'response' }
    );
  }


  getAllOrdersByUser(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string
  ): Observable<ApiResponse<PreViewOrderItem[]>> {
    let url = `${this.baseUrl}/get-all-by-user?page=${page}&limit=${limit}`;

    if (status && status !== 'all') {
      url += `&status=${status}`;
    }

    if (search && search.trim() !== '') {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }

    return this.http.get<ApiResponse<PreViewOrderItem[]>>(url, {
      headers: this.getAuthHeaders()
    });
  }

  // API 2: Lấy tracking của một order
  getOrderTracking(orderId: number): Observable<ApiResponse<OrderTracking[]>> {
    return this.http.get<ApiResponse<OrderTracking[]>>(
      `${this.baseUrl}/get-tracking-v2/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // API 3: Xem chi tiết order (danh sách sản phẩm)
  viewOrderDetailForMyOrder(orderId: number): Observable<ApiResponse<OrderDetailItem[]>> {
    return this.http.get<ApiResponse<OrderDetailItem[]>>(
      `${this.baseUrl}/view-detail-for-my-order/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
  }

}
