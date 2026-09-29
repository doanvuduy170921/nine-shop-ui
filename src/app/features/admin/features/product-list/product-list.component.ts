import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductService } from '../../../../core/services/product.service';

interface Product {
  id: number;
  name: string;
  status: string;
  thumbnail: string;
  category_name: string;
  brand_name: string;
  total_stock: number;
  min_price: number;
  max_price: number;
  variant_count: number;
  created_at: string;
  expanded?: boolean; // UI state
}

interface Variant {
  id: number;
  attributes: { [key: string]: string };
  price: number;
  stock_quantity: number;
  image: string;
  is_active: boolean;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  Math = Math; // Expose Math to template
  pages: number[] = [];

  // Filter parameters
  searchText: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedCategoryId: number = 0;
  selectedStatus: string = '';
  selectedPriceRange: string = '';
  perPage: number = 12;
  currentPage: number = 1;

  // Data
  products: Product[] = [];
  categories: Category[] = [];
  totalProducts: number = 0;
  totalPages: number = 0;

  // Variants data
  productVariants: { [productId: number]: Variant[] } = {};
  loadingVariants: { [productId: number]: boolean } = {};

  // UI state
  isLoading: boolean = false;
  isLoadingCategories: boolean = false;

  private searchSubject = new Subject<string>();

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.searchText = searchValue;
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success) this.categories = response.data;
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories = false;
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    const filters = {
      search: this.searchText,
      min_price: this.minPrice || 0,
      max_price: this.maxPrice || 999999999,
      category_id: this.selectedCategoryId || undefined,
      status: this.selectedStatus || undefined,
      page: this.currentPage,
      limit: this.perPage
    };

    this.productService.getProductsByFilter(filters).subscribe({
      next: (res) => {
        // SỬA TẠI ĐÂY: Backend trả về res.data là mảng sản phẩm trực tiếp
        if (res.success && Array.isArray(res.data)) {
          this.products = res.data.map((p: any) => ({
            ...p,
            expanded: false
          }));

          // Vì Backend chưa có Pagination, ta tạm tính toán dựa trên mảng trả về
          this.totalProducts = res.data.length;
          this.totalPages = Math.ceil(this.totalProducts / this.perPage) || 1;
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        } else {
          this.products = [];
          this.totalProducts = 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.products = [];
        this.isLoading = false;
      }
    });
  }

  // Toggle variants expansion
  toggleVariants(product: Product): void {
    product.expanded = !product.expanded;

    // Load variants if not already loaded
    if (product.expanded && !this.productVariants[product.id]) {
      this.loadProductVariants(product.id);
    }
  }

  // Load variants for a specific product
  loadProductVariants(productId: number): void {
    this.loadingVariants[productId] = true;

    // Call API to get variants
    // Assuming you have this endpoint: GET /api/v1/product/:id/variants
    this.productService.getProductVariants(productId).subscribe({

      next: (response) => {

        if (response.success) {
          this.productVariants[productId] = response.data;
        }
        this.loadingVariants[productId] = false;
      },
      error: (err) => {
        console.error('Error loading variants:', err);
        this.loadingVariants[productId] = false;
      }
    });
  }

  // Helper to convert attributes object to array for display
  getAttributesArray(attributes: any): { key: string; value: string; colorClass: string }[] {
    if (!attributes) return [];

    return Object.entries(attributes).map(([key, value]) => {
      return {
        key: key,
        value: String(value),
        colorClass: this.getAttributeColor(key) // Gọi hàm để lấy màu
      };
    });
  }

// Hàm hỗ trợ định nghĩa màu sắc cho từng loại thuộc tính
  private getAttributeColor(key: string): string {
    const k = key.toLowerCase();

    if (k.includes('color') || k.includes('màu')) return 'badge-color';
    if (k.includes('storage') || k.includes('dung lượng') || k.includes('ssd')) return 'badge-storage';
    if (k.includes('ram') || k.includes('memory')) return 'badge-ram';
    if (k.includes('screen') || k.includes('màn hình')) return 'badge-screen';
    if (k.includes('cpu') || k.includes('chip')) return 'badge-cpu';

    return 'badge-default'; // Màu mặc định cho các loại khác
  }

  // Toggle variant active status
  toggleVariantStatus(productId: number, variantId: number, event: any): void {
    const isActive = event.target.checked;

  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPriceRangeChange(range: string): void {
    if (!range) {
      this.minPrice = null;
      this.maxPrice = null;
    } else {
      const [min, max] = range.split('-').map(v => Number(v));
      this.minPrice = min;
      this.maxPrice = max === 0 ? null : max;
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.loadProducts();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadProducts();
  }

  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.currentPage = 1;
    this.loadProducts();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }
}
