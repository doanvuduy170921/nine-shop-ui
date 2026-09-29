
export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface GetAllPaymentMethodsResponse {
  data: PaymentMethod[];
  message: string;
  success: boolean;
}
