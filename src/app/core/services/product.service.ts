import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  CreateProductRequest,
  CreateProductResponse, GetProductBySlugResponse, GetTop3TrendingRes, ProductDetail,
  ProductFilterParams,
  ProductPagination, Top8SellerResponse,
  UploadImageResponse
} from '../models/product.model';
import {API_BASE_URL} from "../../../../environment.prod";

interface Variant {
  id: number;
  attributes: { [key: string]: string };
  price: number;
  stock_quantity: number;
  image: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '${API_BASE_URL}/product';
  private imageApiUrl = '${API_BASE_URL}/media';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createProduct(productData: CreateProductRequest): Observable<CreateProductResponse> {
    return this.http.post<CreateProductResponse>(`${this.apiUrl}/add`, productData, {
      headers: this.getAuthHeaders()
    });
  }




  getProductBySlug(slug: string): Observable<ApiResponse<ProductDetail>> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<ProductDetail>>(`${this.apiUrl}/get-by-slug/${slug}`,{headers});
  }

  private getAuthHeadersForUpload(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  getImagesBySlug(slug: string): Observable<ApiResponse<string[]>> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<string[]>>(
      `${this.apiUrl}/get-images-by-slug/${slug}`,{headers}
    );
  }


  uploadProductImages(productId: number, files: File[]): Observable<UploadImageResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    return this.http.post<UploadImageResponse>(`${this.imageApiUrl}/uploads/${productId}`, formData, {
      headers: this.getAuthHeadersForUpload()
    });
  }


  getProductsByFilter(filters: ProductFilterParams): Observable<ApiResponse<ProductPagination>> {
    let params = new HttpParams();

    // Thêm các params vào URL nếu có giá trị
    if (filters.search !== undefined && filters.search !== null && filters.search !== '') {
      params = params.set('search', filters.search);
    }

    if (filters.min_price !== undefined && filters.min_price !== null) {
      params = params.set('min_price', filters.min_price.toString());
    }

    if (filters.max_price !== undefined && filters.max_price !== null) {
      params = params.set('max_price', filters.max_price.toString());
    }

    if (filters.category_id !== undefined && filters.category_id !== null) {
      params = params.set('category_id', filters.category_id.toString());
    }

    // ✅ Thêm brand_id
    if (filters.brand_id !== undefined && filters.brand_id !== null) {
      params = params.set('brand_id', filters.brand_id.toString());
    }

    if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
      params = params.set('status', filters.status);
    }

    if (filters.page !== undefined && filters.page !== null) {
      params = params.set('page', filters.page.toString());
    }

    if (filters.limit !== undefined && filters.limit !== null) {
      params = params.set('limit', filters.limit.toString());
    }

    console.log('📡 API Request:', `${this.apiUrl}/get-by-filter?${params.toString()}`);

    return this.http.get<ApiResponse<ProductPagination>>(`${this.apiUrl}/get-by-filter`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  uploadMultipleImages(files: File[]): Observable<{urls: string[]}> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file)); // Key 'files' phải khớp với Backend

    return this.http.post<{urls: string[]}>(`${this.imageApiUrl}/upload`, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      })
    });
  }


  getProductVariants(productId: number): Observable<{
    data: Variant[],
    message: string,
    success: boolean
  }> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<{ data: Variant[], message: string, success: boolean }>(
      `${API_BASE_URL}/product/list-variant/${productId}`,
      { headers }
    );
  }

// Optional: If you need to update variant status
  updateVariantStatus(variantId: number, isActive: boolean): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.patch(
      `${API_BASE_URL}/product/variant/${variantId}/status`,
      { is_active: isActive },
      { headers }
    );
  }

  getTop3Trending(): Observable<ApiResponse<GetTop3TrendingRes>> {
    return this.http.get<ApiResponse<GetTop3TrendingRes>>(`${this.apiUrl}/top-3-thumbnail`);
  }



}
