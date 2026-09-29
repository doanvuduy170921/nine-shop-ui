import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderDetailResponse } from '../../../core/models/order.model';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css']
})
export class PaymentResultComponent implements OnInit {

  loading = true;

  order: {
    id: number;
    email: string;
    customer_name: string;
    phone: string;
    address: string;
    payment_method_name: string;
    transaction_id?: string;
    order_created_at: string;
    subtotal: number;
    shipping_price: number;
    tax: number;
    total_amount: number;
    items: {
      product_name: string;
      quantity: number;
      price: number;
      product_thumbnail: string;
    }[];
  } | null = null;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const orderId = Number(params['order_id']);

      if (status === 'success' && orderId) {
        this.loadOrderDetails(orderId);
      }
    });
  }

  loadOrderDetails(orderId: number): void {
    this.orderService.getOrderDetail(orderId).subscribe(res => {
      this.mapOrder(res);
      this.loading = false;
    });
  }

  private mapOrder(rows: OrderDetailResponse[]): void {
    if (!rows || rows.length === 0) return;

    const first = rows[0];

    this.order = {
      id: first.id,
      email: first.email,
      customer_name: first.customer_name,
      phone: first.phone,
      address: first.address,
      payment_method_name: first.payment_method_name,
      transaction_id: first.transaction_id,
      order_created_at: first.order_created_at,
      subtotal: first.subtotal,
      shipping_price: first.shipping_price,
      tax: first.tax,
      total_amount: first.total_amount,
      items: rows.map(r => ({
        product_name: r.product_name,
        quantity: r.quantity,
        price: r.item_price,
        product_thumbnail: r.product_thumbnail
      }))
    };
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + ' ₫';
  }

  getItemTotal(item: any): number {
    return item.price * item.quantity;
  }
  formatUSDCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }
}

