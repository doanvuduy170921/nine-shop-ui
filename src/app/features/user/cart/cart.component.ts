import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {CartProductItem, CheckoutSummary, UpdateAllCartRequest} from "../../../core/models/cart.model";
import {CartService} from "../../../core/services/cart.service";
import {ToastService} from "../../../core/services/toast.service";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartProductItem[] = [];
  isLoading = false;
  errorMessage = '';

  selectedShipping: 'standard' | 'express' | 'free' = 'standard';

  // THAY ĐỔI: Mapping tên shipping
  shippingMethodNames = {
    standard: 'Standard Delivery',
    express: 'Express Delivery',
    free: 'Free Shipping'
  };

  // GIỮ LẠI ĐỂ HIỂN THỊ TRONG UI (chỉ để reference)
  shippingFees = {
    standard: 4.99,
    express: 12.99,
    free: 0
  };

  // THAY ĐỔI: Không tính local nữa, sẽ lấy từ API
  tax = this.getSubtotal() * 0.01;
  calculatedSubtotal = 0;
  calculatedShipping = 0;
  calculatedTotal = 0;

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.isLoading = true;
    this.cartService.getAllInCart().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems = response.data;
          // Tính toán subtotal local để hiển thị trước khi gọi API
          this.calculatedSubtotal = this.getLocalSubtotal();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.errorMessage = 'Không thể tải giỏ hàng. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }

  // 1. Tăng số lượng (Sử dụng cart_id hoặc index)
  increaseQuantity(index: number): void {
    const item = this.cartItems[index];
    // Lưu ý: Đảm bảo backend có trả về stock_quantity trong API get-all
    item.quantity++;
    this.calculatedSubtotal = this.getLocalSubtotal();
  }

  decreaseQuantity(index: number): void {
    const item = this.cartItems[index];

    if (item.quantity > 1) {
      // Nếu số lượng > 1 thì giảm bình thường
      item.quantity--;
      this.calculatedSubtotal = this.getLocalSubtotal();
      // Chỗ này bạn nên cân nhắc gọi API update số lượng luôn nếu muốn đồng bộ ngay lập tức
    } else {
      // Nếu số lượng = 1 mà bấm giảm, gọi hàm xóa
      // THAY ĐỔI: Truyền item.variant_id thay vì item.cart_id
      this.removeItem(item.variant_id, index);
    }
  }

  // 2. Xóa item (Sử dụng cart_id thay vì product_id)
  // Trong file cart.component.ts
  removeItem(variantId: number, index: number): void { // Đổi tên biến cho rõ nghĩa
    if (confirm(`Bạn có chắc muốn xóa sản phẩm này?`)) {
      this.isLoading = true;

      // TRUYỀN variantId vào đây
      this.cartService.deleteCartItem(variantId).subscribe({
        next: () => {
          this.cartItems.splice(index, 1);
          this.calculatedSubtotal = this.getLocalSubtotal();
          this.isLoading = false;
          this.toastService.success('Thành công', 'Đã xóa sản phẩm');
        },
        error: (err) => {
          console.error('Lỗi xóa:', err);
          this.errorMessage = 'Không thể xóa sản phẩm.';
          this.isLoading = false;
        }
      });
    }
  }

  // TÍNH LOCAL (chỉ để hiển thị tạm)
  getLocalSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // HIỂN THỊ GIÁ TRỊ (ưu tiên từ API nếu có)
  getSubtotal(): number {
    return this.calculatedSubtotal || this.getLocalSubtotal();
  }

  getShippingFee(): number {
    // Nếu có giá trị từ API thì dùng, không thì tính local
    if (this.calculatedShipping > 0) {
      return this.calculatedShipping;
    }
    // Tính local dựa trên shipping method được chọn
    return this.shippingFees[this.selectedShipping];
  }

  getTax(): number {
    return this.getSubtotal() * 0.01;
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const shipping = this.getShippingFee();
    const tax = this.getTax();
    return this.calculatedTotal || (subtotal + shipping);
  }

  onShippingChange(type: 'standard' | 'express' | 'free'): void {
    this.selectedShipping = type;
  }

  isFreeShippingAvailable(): boolean {
    return this.getSubtotal() > 300;
  }

  // HÀM PROCEED TO CHECKOUT - GỌI API VÀ LƯU DATA
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) return;

    const updateRequest: UpdateAllCartRequest = {
      items: this.cartItems.map(item => ({
        variant_id: item.variant_id, // SỬA TỪ product_id -> variant_id
        quantity: item.quantity,
        price: item.price
      })),
      shipping_method: this.shippingMethodNames[this.selectedShipping]
    };

    this.cartService.updateAllCart(updateRequest).subscribe({
      next: (response) => {
        console.log('Cart updated successfully:', response);

        // Lưu summary data vào localStorage để checkout page sử dụng
        const checkoutSummary: CheckoutSummary = {
          items: this.cartItems,
          subtotal: response.data.subtotal,
          total: response.data.total,
          shipping_price: response.data.shipping_price,
          tax: response.data.tax,
          shipping_method: this.shippingMethodNames[this.selectedShipping]
        };

        localStorage.setItem('checkout_summary', JSON.stringify(checkoutSummary));

        this.isLoading = false;

        // Chuyển sang trang checkout
        this.router.navigate(['/checkout']);
      },
      error: (error) => {
        console.error('Error updating cart:', error);
        this.errorMessage = 'Không thể cập nhật giỏ hàng. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }
}
