import { Component, OnInit } from '@angular/core';

import { OrderService } from "../../../../../core/services/order.service";
import {OrderDetailItem, OrderTracking, PreViewOrderItem} from "../../../../../core/models/order.model";

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {

  // Danh sách orders từ API
  orders: PreViewOrderItem[] = [];
  filteredOrders: PreViewOrderItem[] = []; // dùng để hiển thị (sau filter/search)

  loading = true;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;        // bạn có thể thay đổi: 6, 10, 20...
  totalItems: number = 0;
  totalPages: number = 1;

  // Filter & Search
  selectedStatus: string = 'all'; // 'all', 'pending', 'processing', 'shipping', 'delivered'
  searchQuery: string = '';

  // Debounce cho search realtime
  private searchTimeout: any;

  // Tracking
  trackingData: { [orderId: number]: OrderTracking[] } = {};
  trackingLoading: { [orderId: number]: boolean } = {};

  // Details
  orderDetailsData: { [orderId: number]: OrderDetailItem[] } = {};
  detailsLoading: { [orderId: number]: boolean } = {};

  // State mở/đóng
  trackingState: { [key: number]: boolean } = {};
  detailsState: { [key: number]: boolean } = {};

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    this.orderService.getAllOrdersByUser(
      this.currentPage,
      this.pageSize,
      this.selectedStatus === 'all' ? undefined : this.selectedStatus,
      this.searchQuery.trim() || undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data;
          this.filteredOrders = response.data;

          // Ước lượng totalItems nếu backend không trả (thường thì nên trả thêm totalCount)
          // Nếu backend có trả total, bạn có thể thêm field vào ApiResponse và dùng ở đây
          this.totalItems = response.data.length < this.pageSize
            ? (this.currentPage - 1) * this.pageSize + response.data.length
            : this.currentPage * this.pageSize + 10; // giả định còn trang sau

          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  // Search realtime khi gõ
  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadOrders();
    }, 600);
  }

  // Search khi nhấn Enter (tùy chọn)
  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.currentPage = 1;
    this.loadOrders();
  }

  // Filter theo status
  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadOrders();
  }

  // Pagination
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loadOrders();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  getPagesArray(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Toggle Tracking
  toggleTracking(orderId: number): void {
    this.trackingState[orderId] = !this.trackingState[orderId];

    if (this.trackingState[orderId] && !this.trackingData[orderId]) {
      this.loadTracking(orderId);
    }

    if (this.trackingState[orderId]) {
      this.detailsState[orderId] = false;
    }
  }

  private loadTracking(orderId: number): void {
    this.trackingLoading[orderId] = true;
    this.orderService.getOrderTracking(orderId).subscribe({
      next: (res) => {
        if (res.success) {
          this.trackingData[orderId] = res.data.sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
        this.trackingLoading[orderId] = false;
      },
      error: () => this.trackingLoading[orderId] = false
    });
  }

  // Toggle Details
  toggleDetails(orderId: number): void {
    this.detailsState[orderId] = !this.detailsState[orderId];

    if (this.detailsState[orderId] && !this.orderDetailsData[orderId]) {
      this.loadOrderDetails(orderId);
    }

    if (this.detailsState[orderId]) {
      this.trackingState[orderId] = false;
    }
  }

  private loadOrderDetails(orderId: number): void {
    this.detailsLoading[orderId] = true;
    this.orderService.viewOrderDetailForMyOrder(orderId).subscribe({
      next: (res) => {
        if (res.success) {
          this.orderDetailsData[orderId] = res.data;
        }
        this.detailsLoading[orderId] = false;
      },
      error: () => this.detailsLoading[orderId] = false
    });
  }

  // Helper functions
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'delivered' ? 'status-delivered' : 'status-processing';
  }

  getStatusDisplay(status: string): string {
    const map: { [key: string]: string } = {
      pending: 'Pending',
      processing: 'Processing',
      shipping: 'Shipping',
      delivered: 'Delivered'
    };
    return map[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  getTrackStepClass(track: OrderTracking, currentOrderStatus: string): string {
    const order = ['pending', 'processing', 'shipping', 'delivered'];
    const trackIdx = order.indexOf(track.status.toLowerCase());
    const currentIdx = order.indexOf(currentOrderStatus.toLowerCase());

    if (trackIdx < currentIdx) return 'completed';
    if (trackIdx === currentIdx) return 'active';
    return 'pending';
  }
}
