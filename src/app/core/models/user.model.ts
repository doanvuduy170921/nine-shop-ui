export interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  user_uuid: string;
}

export interface PaginationData {
  Data: User[];
  Total: number;
  Page: number;
  Limit: number;
  TotalPage: number;
}

export interface UsersResponse {
  data: PaginationData;
  message?: string;
  success?: boolean;
}


export interface UpdateUserRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  is_active: boolean;
}

export interface UpdateUserResponse {
  data: User;
  message: string;
  success: boolean;
}


export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface RegisterData {
  email: string;
  expired_at: string;
}
