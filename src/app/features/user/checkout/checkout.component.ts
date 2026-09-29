import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from "../../../core/services/cart.service";
import { PaymentService } from "../../../core/services/payment.service";
import { PendingOrderService } from "../../../core/services/pending-order.service";
import { CartProductItem, CheckoutSummary } from "../../../core/models/cart.model";
import { PaymentMethod } from "../../../core/models/payment.model";
import {CreatePendingOrderRequest} from "../../../core/models/pending_order.model";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartProductItem[] = [];
  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethodId: number | null = null;

  isLoading = false;
  errorMessage = '';

  // Form data
  customerInfo = {
    name: '',
    email: '',
    phone: ''
  };

  shippingAddress = {
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  };

  // Data từ cart
  subtotal = 0;
  shippingPrice = 0;
  tax = 0;
  total = 0;
  shippingMethod = '';

  constructor(
    private cartService: CartService,
    private paymentService: PaymentService,
    private pendingOrderService: PendingOrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCheckoutData();
    this.loadPaymentMethods();
  }

  loadCheckoutData(): void {
    const savedSummary = localStorage.getItem('checkout_summary');
    if (savedSummary) {
      const checkoutSummary: CheckoutSummary = JSON.parse(savedSummary);
      this.cartItems = checkoutSummary.items;
      this.subtotal = checkoutSummary.subtotal;
      this.total = checkoutSummary.total;
      this.shippingPrice = checkoutSummary.shipping_price;
      this.tax = checkoutSummary.tax;
      this.shippingMethod = checkoutSummary.shipping_method;
    } else {
      this.loadCartItemsFallback();
    }
  }

  loadPaymentMethods(): void {
    this.paymentService.getAllPaymentMethods().subscribe({
      next: (response) => {
        if (response.success) {
          this.paymentMethods = response.data.filter(pm => pm.is_active);
          if (this.paymentMethods.length > 0) {
            this.selectedPaymentMethodId = this.paymentMethods[0].id;
          }
        }
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
      }
    });
  }

  onPaymentMethodChange(paymentMethodId: number): void {
    this.selectedPaymentMethodId = paymentMethodId;
  }

  getPaymentIcon(name: string): string {
    const icons: { [key: string]: string } = {
      'COD': 'bi-cash-coin',
      'VNPAY': 'bi-wallet2'
    };
    return icons[name.toUpperCase()] || 'bi-credit-card';
  }

  // PLACE ORDER
  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.selectedPaymentMethodId) {
      alert('Vui lòng chọn phương thức thanh toán!');
      return;
    }

    if (!this.customerInfo.name || !this.customerInfo.email || !this.customerInfo.phone) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng!');
      return;
    }

    if (!this.shippingAddress.address) {
      alert('Vui lòng điền địa chỉ giao hàng!');
      return;
    }

    this.isLoading = true;

    // Tạo full address
    const fullAddress = [
      this.shippingAddress.address,
      this.shippingAddress.apartment,
      this.shippingAddress.city,
      this.shippingAddress.state,
      this.shippingAddress.zip,
      this.shippingAddress.country
    ].filter(Boolean).join(', ');

    // Sửa đoạn map items trong hàm onSubmit
    const orderRequest: CreatePendingOrderRequest = {
      payment_id: Number(this.selectedPaymentMethodId),
      address: fullAddress,
      name: this.customerInfo.name,
      email: this.customerInfo.email,
      phone: this.customerInfo.phone,
      total: Math.round(this.total),
      subtotal: Math.round(this.subtotal),
      shipping: Math.round(this.shippingPrice),
      tax: Math.round(this.tax),
      items: this.cartItems.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: Math.round(item.price)
      }))
    };

    console.log('Sending Order Request:', orderRequest); // Debug để kiểm tra body trước khi gửi

    this.pendingOrderService.createPendingOrder(orderRequest).subscribe({
      next: (response) => {
        if (!response.success) {
          this.errorMessage = response.message;
          this.isLoading = false;
          return;
        }

        const pendingOrder = response.data.pending_order;
        const vnpayUrl = response.data.vnpay_url;

        localStorage.setItem('checkout_email', this.customerInfo.email);
        localStorage.setItem('pending_order_id', pendingOrder.id.toString());

        this.isLoading = false;

        // ✅ VNPAY → redirect ra cổng thanh toán
        if (vnpayUrl) {
          window.location.href = vnpayUrl;
          return;
        }

        // ✅ COD → validate OTP
        this.router.navigate(['/validate-otp']);
      },
      error: () => {
        this.errorMessage = 'Không thể tạo đơn hàng';
        this.isLoading = false;
      }
    });
  }

  loadCartItemsFallback(): void {
    this.isLoading = true;
    this.cartService.getAllInCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems = response.data;
          if (this.cartItems.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            this.router.navigate(['/cart']);
          } else {
            alert('Vui lòng quay lại giỏ hàng!');
            this.router.navigate(['/cart']);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.isLoading = false;
      }
    });
  }

  getSubtotal(): number { return this.subtotal; }
  getShippingFee(): number { return this.shippingPrice; }
  getTax(): number { return this.tax; }
  getTotal(): number { return this.total; }
  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
  getShippingMethod(): string { return this.shippingMethod; }
}
