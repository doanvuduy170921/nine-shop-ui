export interface TrackingEvent {
  id: number;
  order_status: string;
  amount_item: number;
  order_created_at: string;
  order_history_status: string | undefined;
  note: string | null;
  order_history_created_at: string;
  product_thumbnail: string;
}

export interface TrackingOrderResponse {
  success: boolean;
  message: string;
  data: TrackingEvent[];
}
export interface TrackingOrderResponseV2 {
  success: boolean;
  message: string;
  data: OrderHistoryDes[];
}

export interface OrderHistoryDes {
  id: number,
  status : string,
  note: string
  created_at : string;
}
