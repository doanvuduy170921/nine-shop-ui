// === USED FOR USER ORDER LIST & USER ORDER DETAIL ===
export interface Order {
  order_id: number;
  customer_name: string;
  phone: string;
  address: string;
  subtotal: number;
  shipping_price: number;
  tax: number;
  total_amount: number;
  status: string;
  order_created_at: string;
  payment_method_name: string;
  items: OrderItem[];
}

export interface OrderDetailForMyOrder {
  id : number,
  status: string,
  created_at: string,
  amount_item: number,
  total_amount: number,
  preview_thumbnails: string[],
}

export interface OrderItem {
  variant_id: number;
  product_name: string;
  product_thumbnail: string;
  quantity: number;
  item_price: number;
  sku?: string;
}

// List orders for users
export interface OrderListItem {
  id: number;
  name: string;
  created_at: string;
  status: string;
  total_amount: number;
  amount_item: number;
}

export interface OrderApiResponse {
  data: any[];
  message: string;
  success: boolean;
}

// === USED FOR ADMIN ORDER DETAIL PAGE ===
export interface OrderDetailResponse {
  customer_name: string;
  id: number;
  email: string;
  address: string;
  phone: string;
  payment_method_name: string;
  subtotal: number;
  shipping_price: number;
  tax: number;
  total_amount: number;
  status: string;
  order_created_at: string;
  product_name: string;
  quantity: number;
  item_price: number;
  product_thumbnail: string;
  transaction_id: string,
  payment_status: string,
}

// Order Info for admin summary panel
export interface OrderInfo {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  subtotal: number;
  shipping_price: number;
  tax: number;
  total_amount: number;
  status: string;
  order_created_at: string;
  payment_method_name: string;
}

// Items in the admin order detail
export interface OrderItemForAdmin {
  product_name: string;
  quantity: number;
  item_price: number;
  product_thumbnail: string;
}

// order.model.ts
export interface PreViewOrderItem {
  id: number;
  status: string; // pending, processing, shipping, delivered, ...
  created_at: string; // ISO date string
  amount_item: number;
  total_amount: number;
  preview_thumbnails: string[]; // array các URL ảnh thumbnail
}

// order-tracking.model.ts
export interface OrderTracking {
  id: number;
  status: string;
  note: string;
  created_at: string;
}

// order-detail.model.ts
export interface OrderDetailItem {
  payment_method_name: string;
  shipping_method_name: string;
  shipping_price: number;
  product_name: string;
  quantity: number;
  price: number;
  amount_item: number;       // số lượng sản phẩm khác nhau trong order (thường = quantity nếu 1 loại)
  subtotal: number;
  tax: number;
  total_amount: number;
  user_name: string;
  address: string;
  phone: string;
  product_thumbnail: string; // URL ảnh sản phẩm
}
