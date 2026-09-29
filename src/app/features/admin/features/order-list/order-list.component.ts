import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderListItem } from "../../../../core/models/order.model";
import { OrderService } from "../../../../core/services/order.service";

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {

  orders: OrderListItem[] = [];
  isLoading = false;
  errorMessage = '';

  // Stats
  totalOrders = 0;
  completedOrders = 0;
  pendingOrders = 0;
  shippedOrders = 0;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        console.log("ORDER RESPONSE = ", res);
        this.orders = res.data;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalOrders = this.orders.length;
    this.completedOrders = this.orders.filter(o => o.status.toLowerCase() === 'completed').length;
    this.pendingOrders = this.orders.filter(o => o.status.toLowerCase() === 'pending').length;
    this.shippedOrders = this.orders.filter(o => o.status.toLowerCase() === 'shipped').length;
  }

  viewOrderDetail(orderId: number): void {
    // Navigate to order detail page
    this.router.navigate(['/admin/order-detail', orderId]);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'completed': 'success',
      'cancelled': 'danger',
      'delivered': 'success'
    };
    return statusMap[status.toLowerCase()] || 'secondary';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'pending': 'bi-clock',
      'processing': 'bi-arrow-repeat',
      'shipped': 'bi-truck',
      'completed': 'bi-check-circle',
      'cancelled': 'bi-x-circle',
      'delivered': 'bi-check2-all'
    };
    return iconMap[status.toLowerCase()] || 'bi-info-circle';
  }
}
