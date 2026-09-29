
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    refresh_token: string;
    ttl: number;
  };
  message: string;
  success: boolean;
}
