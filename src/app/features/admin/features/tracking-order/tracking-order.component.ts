import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrackingOrderService } from 'src/app/core/services/tracking-order.service';
import {OrderHistoryDes, TrackingEvent} from 'src/app/core/models/tracking-order.model';
import { ToastService } from 'src/app/core/services/toast.service';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-tracking-order',
  templateUrl: './tracking-order.component.html',
  styleUrls: ['./tracking-order.component.css']
})
export class TrackingOrderComponent implements OnInit {

  orderId!: number;
  isLoading = false;
  errorMessage = '';

  trackingEvents: TrackingEvent[] = [];

  // Trạng thái cuối cùng
  lastStatus: string | null = null;

  // Index của tracking cuối cùng
  lastIndex: number = -1;

  // Current active step
  currentStep = 1;

  statusSteps = [
    { code: 'pending', label: 'Receiving orders' },
    { code: 'processing', label: 'Order processing' },
    { code: 'shipping', label: 'Being delivered' },
    { code: 'delivered', label: 'Delivered' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trackingService: TrackingOrderService,
    private orderService: OrderService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Invalid order ID';
      return;
    }

    this.orderId = Number(id);
    this.loadTrackingData();
    this.loadHistoryDescription(this.orderId);
  }

  // ============================
  // LOAD TRACKING
  // ============================
  loadTrackingData(): void {
    this.isLoading = true;

    this.trackingService.getTracking(this.orderId).subscribe({
      next: (res) => {
        if (res.success) {
          this.trackingEvents = res.data;

          if (this.trackingEvents.length > 0) {
            this.lastIndex = this.trackingEvents.length - 1;
            this.lastStatus = this.trackingEvents[this.lastIndex].order_history_status ?? null;
            this.currentStep = this.mapStatusToStep(this.lastStatus ?? undefined);
          }
        } else {
          this.errorMessage = res.message;
        }

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load tracking information';
        this.isLoading = false;
      }
    });
  }


  mapStatusToStep(status: string | undefined): number {
    if (!status) return 1;
    const index = this.statusSteps.findIndex(s => s.code === status);
    return index >= 0 ? index + 1 : 1;
  }

  getStepTime(stepCode: string): string {
    const ev = this.trackingEvents.find(e => e.order_history_status === stepCode);
    return ev ? new Date(ev.order_history_created_at).toLocaleString() : 'Pending';
  }


  capitalize(text: string | undefined): string {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }


  onClickStep(nextStatus: string) {
    // Nếu chưa load
    if (!this.lastStatus) return;

    const nextStep = this.mapStatusToStep(nextStatus);

    // Không cho update lùi
    if (nextStep <= this.currentStep) return;

    const ok = confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng sang "${nextStatus}"?`);
    if (!ok) return;

    this.updateOrderStatus(nextStatus);
  }

  updateOrderStatus(status: string) {
    const payload = {
      status: status,
      order_id: this.orderId
    };

    this.orderService.updateOrderStatus(payload).subscribe({
      next: () => {
        // Cập nhật UI ngay
        this.lastStatus = status;
        this.currentStep = this.mapStatusToStep(status);

        this.toast.success("Update thành công", `Đơn hàng đã chuyển sang trạng thái: ${status.toUpperCase()}`);
        // 👉 LOAD LẠI order history description
        this.loadHistoryDescription(this.orderId);
      },
      error: () => {
        this.toast.error("Update thất bại", "Không thể cập nhật trạng thái đơn hàng.");
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/account/orders']);
  }

  orderDesList : OrderHistoryDes[] = []

  loadHistoryDescription(order_id :number): void {
    this.trackingService.getTrackingV2(order_id).subscribe({
      next: (res) => {
        this.orderDesList = res.data;
      }
    })
  }
}
