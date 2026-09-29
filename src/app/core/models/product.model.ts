export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand_name: string;
  category_name: string;
  description: string;
  short_description: string;
  price: number;
  discount_price: number;
  stock_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
  thumbnail: string;
}

export interface CreateProductRequest {
  name: string;
  brand_id: number;
  category_id: number;
  description: string;
  short_description: string;
  status: string;
  has_variant: boolean;
  thumbnail: string;
  images: string[];
  specifications: {
    spec_key: string;
    spec_value: string;
    display_order: number;
  }[];
  variants: {
    attributes: any;
    price: number;
    stock_quantity: number;
    image: string;
    is_active: boolean;
  }[];
}


export interface Top8SellerResponse {
  id: number;
  name: string;
  price: number;
  discount_price: number;
  thumbnail: string;
  slug : string;
}


export interface CreateProductResponse {
  data: Product;
  message: string;
  success: boolean;
}

export interface GetProductBySlugResponse {
  data: Product;
  message: string;
  success: boolean;
}


export interface UploadedImage {
  id: number;
  product_id: number;
  image_url: string;
}

export interface UploadImageResponse {
  failed_count: number;
  failed_files: string[];
  message: string;
  saved_images: UploadedImage[];
  success_count: number;
}

export interface ProductFilterParams {
  search?: string;
  min_price?: number;
  max_price?: number;
  category_id?: number;
  brand_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProductPagination {
  Data: Product[];
  Total: number;
  Page: number;
  Limit: number;
  TotalPage: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ProductTrendingItem {
  name: string;
  thumbnail: string;
  min_price: number;
  brand_name: string;
  slug?: string; // Thêm slug nếu Backend của bạn có trả về để làm link
}

export interface GetTop3TrendingRes {
  images:  ProductTrendingItem[];
  laptops: ProductTrendingItem[];
  keyboards: ProductTrendingItem[];
  screens: ProductTrendingItem[];
  mouses: ProductTrendingItem[];
}

export interface ProductVariant {
  variant_id: number;
  sku: string;
  price: number;
  stock_quantity: number;
  attributes: {
    [key: string]: string; // Ví dụ: { "Screen": "FHD+ IPS", "Storage": "512GB SSD" }
  };
}

export interface ProductDetail {
  id: number;
  name: string;
  thumbnail: string;
  status: string;
  brand_name: string;
  category_name: string;
  description: string;
  gallery: string[]
  variants: ProductVariant[];
  technical_specs: TechnicalSpec[];
}

export interface TechnicalSpec {
  key: string;
  value: string;
}
