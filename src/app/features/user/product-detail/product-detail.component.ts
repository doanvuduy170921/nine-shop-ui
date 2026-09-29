import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Product, ProductDetail, ProductVariant, TechnicalSpec} from "../../../core/models/product.model";
import { ProductService } from "../../../core/services/product.service";
import { CartService } from "../../../core/services/cart.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  productImages: string[] = [];
  activeTab: string = 'overview';
  isLoading = true;
  errorMessage = '';
  mainImage: string = '';
  quantity: number = 1;
  isAddingToCart: boolean = false;
  product?: ProductDetail; // Sử dụng Interface mới
  selectedVariant?: ProductVariant;
  selectedAttributes: { [key: string]: string } = {};
  gallery : string[] = [];

  techSpecs: TechnicalSpec[] = []
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProduct(slug);
      this.loadProductImages(slug);
    }
  }

  loadProduct(slug: string): void {
    this.isLoading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.product = res.data;
          this.mainImage = this.product.thumbnail;
          this.gallery = res.data.gallery
          this.techSpecs = res.data.technical_specs
          // Khởi tạo variant mặc định là variant đầu tiên
          if (this.product.variants && this.product.variants.length > 0) {
            this.selectedVariant = this.product.variants[0];
            this.selectedAttributes = { ...this.selectedVariant.attributes };
          }
        } else {
          this.errorMessage = res.message;
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load product details';
        this.isLoading = false;
      }
    });
  }

  getAttributeKeys(): string[] {
    if (!this.product?.variants?.[0]?.attributes) return [];
    return Object.keys(this.product.variants[0].attributes);
  }

  // Lấy tất cả giá trị có thể có của một thuộc tính (vd: Screen -> ["FHD+", "4K"])
  getAttributeValues(key: string): string[] {
    const values = this.product?.variants.map(v => v.attributes[key]);
    return [...new Set(values)]; // Lọc trùng
  }

  // Hàm khi người dùng click chọn option
  selectAttribute(key: string, value: string): void {
    this.selectedAttributes[key] = value;
    this.findMatchingVariant();
  }

  findMatchingVariant(): void {
    this.selectedVariant = this.product?.variants.find(v =>
      Object.keys(this.selectedAttributes).every(
        key => v.attributes[key] === this.selectedAttributes[key]
      )
    );
    // Reset số lượng nếu vượt quá kho của variant mới
    if (this.selectedVariant && this.quantity > this.selectedVariant.stock_quantity) {
      this.quantity = 1;
    }
  }

  // Cập nhật lại các hàm tính toán theo selectedVariant
  getDisplayPrice(): number {
    return this.selectedVariant ? this.selectedVariant.price : 0;
  }


  loadProductImages(slug: string): void {
    this.productService.getImagesBySlug(slug).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.productImages = res.data;
          if (!this.mainImage && this.productImages.length > 0) {
            this.mainImage = this.productImages[0];
          }
        }
      },
      error: (err) => {
        console.error('❌ Error loading images:', err);
      }
    });
  }

  changeMainImage(imgUrl: string) {
    this.mainImage = imgUrl;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }



  // ✅ Add to Cart
  addToCart(): void {
    if (!this.selectedVariant) {
      this.toastService.error('Lỗi', 'Vui lòng chọn đầy đủ cấu hình sản phẩm');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.toastService.warning('Đăng nhập', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
      this.router.navigate(['/login']);
      return;
    }

    this.isAddingToCart = true;

    // Gửi đúng variant_id của cấu hình người dùng đang chọn
    const cartData = {
      variant_id: this.selectedVariant.variant_id,
      quantity: this.quantity
    };

    this.cartService.addToCart(cartData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Thành công', 'Đã thêm vào giỏ hàng');
          // Option: Chuyển hướng hoặc cập nhật icon giỏ hàng trên header
          this.router.navigate(['/cart']);
        }
        this.isAddingToCart = false;
      },
      error: (err) => {
        this.toastService.error('Lỗi', err.error?.message || 'Không thể thêm vào giỏ hàng');
        this.isAddingToCart = false;
      }
    });
  }

  // Thêm logic tăng số lượng
  increaseQuantity(): void {
    if (this.selectedVariant && this.quantity < this.selectedVariant.stock_quantity) {
      this.quantity++;
    } else {
      this.toastService.warning('Giới hạn kho', 'Số lượng đã đạt tối đa trong kho');
    }
  }
}
