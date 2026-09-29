import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderItemForAdmin, OrderDetailResponse, OrderInfo } from "../../../../core/models/order.model";
import { OrderService } from "../../../../core/services/order.service";

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: OrderInfo | null = null;
  orderItems: OrderItemForAdmin[] = [];
  orderId!: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Invalid order ID';
      return;
    }

    this.orderId = Number(id);
    this.loadOrderDetail();
  }

  loadOrderDetail(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrderDetail(this.orderId).subscribe({
      next: (data) => {
        this.isLoading = false;

        if (!data || data.length === 0) {
          this.errorMessage = 'Order not found';
          return;
        }

        const row = data[0];

        // Map order info from first row
        this.order = {
          id: row.id,
          customer_name: row.customer_name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          subtotal: row.subtotal,
          shipping_price: row.shipping_price,
          tax: row.tax,
          total_amount: row.total_amount,
          status: row.status,
          order_created_at: row.order_created_at,
          payment_method_name: row.payment_method_name
        };

        // Map all order items
        this.orderItems = data.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          item_price: item.item_price,
          product_thumbnail: item.product_thumbnail
        }));
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Cannot load order detail. Please try again.';
        console.error('Error loading order detail:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';

    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered'
    };
    return statusMap[status.toLowerCase()] || 'status-default';
  }

  getStatusLabel(status: string): string {
    if (!status) return 'Unknown';

    const statusLabels: { [key: string]: string } = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'shipped': 'Shipped',
      'delivered': 'Delivered'
    };
    return statusLabels[status.toLowerCase()] || status;
  }

  calculateExpectedDelivery(): string {
    if (!this.order?.order_created_at) return 'N/A';

    const orderDate = new Date(this.order.order_created_at);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7); // Add 7 days for delivery

    return deliveryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }


  goToTracking() {
    const order_id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/admin/tracking-order',order_id]);
  }
}
