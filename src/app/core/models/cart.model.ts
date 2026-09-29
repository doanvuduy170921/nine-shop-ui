export interface AddToCartRequest {
  variant_id: number;
  quantity: number;
}

export interface CartItem {
  id: number;
  user_id: number;
  variant_id: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface AddToCartResponse {
  data: CartItem;
  message: string;
  success: boolean;
}

export interface CartProductItem {
  cart_id: number;     // Khớp với JSON
  variant_id: number;  // Cực kỳ quan trọng
  product_id: number;
  name: string;
  quantity: number;
  thumbnail: string;
  price: number;
  sku: string;
  attributes: { [key: string]: string }; // Lưu Color, Size...
  stock_quantity: number; // Nên trả thêm từ backend để validate
}

export interface GetCartResponse {
  data: CartProductItem[];
  message: string;
  success: boolean;
}

// CẬP NHẬT INTERFACES CHO UPDATE ALL
export interface UpdateAllCartItem {
  variant_id: number;
  quantity: number;
  price: number; // THÊM PRICE
}

export interface UpdateAllCartRequest {
  items: UpdateAllCartItem[];
  shipping_method: string; // THÊM SHIPPING METHOD
}

// CẬP NHẬT RESPONSE
export interface UpdateAllCartData {
  data: CartItem[];
  subtotal: number;
  total: number;
  shipping_price: number;
  tax: number;
}

export interface UpdateAllCartResponse {
  data: UpdateAllCartData; // Đổi từ CartItem[] thành UpdateAllCartData
  message: string;
  success: boolean;
}

// THÊM INTERFACE MỚI CHO CHECKOUT SUMMARY
export interface CheckoutSummary {
  items: CartProductItem[];
  subtotal: number;
  total: number;
  shipping_price: number;
  tax: number;
  shipping_method: string;
}
