export interface CreatePendingOrderItem {
  variant_id: number;
  quantity: number;
  price: number;
}

export interface CreatePendingOrderRequest {
  payment_id: number;
  address: string;
  name: string;
  email: string;
  phone: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  items: CreatePendingOrderItem[];
}

export interface PendingOrder {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  payment_method_id: number;
  address: string;
  otp: string;
  otp_expires_at: string;
  subtotal: number;
  total_amount: number;
  shipping_price: number;
  tax: number;
  status: string;
  created_at: string;
}

export interface CreatePendingOrderResponse {
  data: CreatePendingOrderData;
  message: string;
  success: boolean;
}

export interface ValidateOtpRequest {
  otp: string;
  p_order_id: number;
}

export interface Order {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  payment_method_id: number;
  subtotal: number;
  shipping_price: number;
  tax: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ValidateOtpResponse {
  data: Order;
  message: string;
  success: boolean;
}

export interface CreatePendingOrderData {
  pending_order: PendingOrder;
  vnpay_url?: string;
}

