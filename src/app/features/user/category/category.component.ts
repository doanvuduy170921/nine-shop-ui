import { Component, OnInit } from '@angular/core';
import { Category } from "../../../core/models/category.model";
import { CategoryService } from "../../../core/services/category.service";
import { BrandService } from "../../../core/services/brand.service";
import { Brand } from "../../../core/models/brand.model";
import { ProductService } from 'src/app/core/services/product.service';
import { Product, ProductFilterParams } from 'src/app/core/models/product.model';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  // Products
  products: Product[] = [];
  totalProducts: number = 0;
  currentPage: number = 1;
  totalPages: number = 0;
  perPage: number = 15;
  isLoadingProducts: boolean = false;

  // Filters
  searchText: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedCategory: number | null = null;
  selectedBrand: number | null = null;
  selectedPriceRange: string | null = null;
  productStatus: string = 'active'; // Mặc định lấy sản phẩm active

  // Categories
  categories: Category[] = [];
  isLoadingCategories: boolean = false;

  // Brands
  brands: Brand[] = [];
  isLoadingBrands: boolean = false;

  // Price Ranges
  priceRanges = [
    { id: 'range-1', label: '$0 - $50', min: 0, max: 50 },
    { id: 'range-2', label: '$50 - $100', min: 50, max: 100 },
    { id: 'range-3', label: '$100 - $200', min: 100, max: 200 },
    { id: 'range-4', label: '$200 - $500', min: 200, max: 500 },
    { id: 'range-5', label: '$500 - $1000', min: 500, max: 1000 },
    { id: 'range-6', label: '$1000+', min: 1000, max: 99999999 }
  ];

  // Search debounce
  private searchSubject = new Subject<string>();

  constructor(
    private categoryService: CategoryService,
    private brandService: BrandService,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadBrandName();

    // Lấy query params từ URL nếu có
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchText = params['search'];
      }
      if (params['category_id']) {
        this.selectedCategory = +params['category_id'];
      }
      this.loadFilteredProducts();
    });

    // Setup search debounce (chờ 500ms sau khi user ngừng gõ)
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(searchValue => {
        this.searchText = searchValue;
        this.currentPage = 1; // Reset về trang 1 khi search
        this.loadFilteredProducts();
      });
  }

  // Load categories từ API
  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data;
        } else {
          console.error('Failed to load categories:', response.message);
        }
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoadingCategories = false;
      }
    });
  }

  // Load brands từ API
  loadBrands(): void {
    this.isLoadingBrands = true;
    this.brandService.getAllBrand().subscribe({
      next: (response) => {
        if (response.success) {
          this.brands = response.data;
        } else {
          console.error('Failed to load brands:', response.message);
        }
        this.isLoadingBrands = false;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.isLoadingBrands = false;
      }
    });
  }

  // ✅ Load products với filter
  loadFilteredProducts(): void {
    this.isLoadingProducts = true;

    // Chuẩn bị params cho API
    const filters: ProductFilterParams = {
      page: this.currentPage,
      limit: this.perPage,
      status: this.productStatus
    };

    // Thêm search nếu có
    if (this.searchText && this.searchText.trim()) {
      filters.search = this.searchText.trim();
    }

    // Thêm category nếu có
    if (this.selectedCategory) {
      filters.category_id = this.selectedCategory;
    }

    // Thêm brand nếu có
    if (this.selectedBrand) {
      filters.brand_id = this.selectedBrand;
    }

    // Thêm price range nếu có
    if (this.minPrice !== null) {
      filters.min_price = this.minPrice;
    }
    if (this.maxPrice !== null) {
      filters.max_price = this.maxPrice;
    }

    console.log('🔍 Calling API with filters:', filters);

    // Gọi API
    this.productService.getProductsByFilter(filters).subscribe({
      next: (response) => {
        this.isLoadingProducts = false;

        if (response.success && response.data) {
          this.products = response.data.Data || [];
          this.totalProducts = response.data.Total || 0;
          this.totalPages = response.data.TotalPage || 0;
          this.currentPage = response.data.Page || 1;

          console.log('✅ Products loaded:', {
            count: this.products.length,
            total: this.totalProducts,
            pages: this.totalPages
          });
        } else {
          this.products = [];
          this.totalProducts = 0;
          console.warn('⚠️ No products found');
        }
      },
      error: (error) => {
        this.isLoadingProducts = false;
        console.error('❌ Error loading products:', error);
        this.products = [];
        this.totalProducts = 0;
      }
    });
  }

  // ✅ Category selection handler
  onCategorySelect(categoryId: number): void {
    this.selectedCategory = this.selectedCategory === categoryId ? null : categoryId;
    this.currentPage = 1; // Reset về trang 1
    this.loadFilteredProducts();
  }

  // ✅ Price range selection handler
  onPriceRangeSelect(rangeId: string): void {
    this.selectedPriceRange = this.selectedPriceRange === rangeId ? null : rangeId;

    if (this.selectedPriceRange) {
      const range = this.priceRanges.find(r => r.id === rangeId);
      if (range) {
        this.minPrice = range.min;
        this.maxPrice = range.max;
      }
    } else {
      this.minPrice = null;
      this.maxPrice = null;
    }

    this.currentPage = 1; // Reset về trang 1
    this.loadFilteredProducts();
  }

  // ✅ Brand selection handler
  onBrandSelect(brandId: number): void {
    this.selectedBrand = this.selectedBrand === brandId ? null : brandId;
    this.currentPage = 1; // Reset về trang 1
    this.loadFilteredProducts();
  }

  // ✅ Search handler (sẽ được gọi từ header)
  onSearch(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  // ✅ Pagination handlers
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFilteredProducts();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  // ✅ Reset all filters
  resetFilters(): void {
    this.searchText = '';
    this.selectedCategory = null;
    this.selectedBrand = null;        // ← sửa từ selectedBrandDemo
    this.selectedPriceRange = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.currentPage = 1;
    this.loadFilteredProducts();
  }
  // ✅ Get page numbers for pagination UI
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

// ✅ Thêm method xử lý click brand
  onBrandDemoSelect(brandId: number | null): void {
    // Nếu click lại brand đang chọn → bỏ chọn (toggle)
    this.selectedBrand = this.selectedBrand === brandId ? null : brandId;

    // Reset về trang 1 và gọi API ngay lập tức
    this.currentPage = 1;
    this.loadFilteredProducts();
  }

  listBrand: Brand[] = [];

  loadBrandName() {
    this.brandService.getAllBrand().subscribe(
      (res) => {
        this.listBrand = res.data.slice(0,this.listBrand.length-1)
      }
    )
  }

}
