export interface OrderItem {
  variant_id: number;
  product_name: string;
  product_thumbnail: string;
  quantity: number;
  item_price: number;
  sku?: string;
}

export interface OrderItemForAdmin {
  product_name: string;
  quantity: number;
  item_price: number;
  product_thumbnail: string;
}
