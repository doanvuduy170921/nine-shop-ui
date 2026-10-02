import { Component, OnInit } from '@angular/core';

import { Category } from "../../../../core/models/category.model";
import { Brand } from "../../../../core/models/brand.model";
import { CategoryService } from "../../../../core/services/category.service";
import { BrandService } from "../../../../core/services/brand.service";

import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";

interface Specification {
  spec_key: string;
  spec_value: string;
  display_order: number;
}

interface VariantAttribute {
  name: string;
  values: string[];
}

export interface Variant {
  id?: number;
  sku?: string;
  attributes: { [key: string]: string };
  price: number;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
}


@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',

  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit {
  product = {
    name: '',
    brand_id: null as number | null,
    category_id: null as number | null,
    description: '',
    short_description: '',
    status: 'active',
    has_variant: false,
    thumbnail: '',
    images: [] as string[],
    specifications: [] as Specification[],
    variants: [] as Variant[]
  };

  // Dropdowns data
  brands: Brand[] = [];
  categories: Category[] = [];

  // Images
  thumbnailPreview: string = '';
  imagesPreviews: string[] = [];
  uploadingImages = false;

  // Specifications
  specSuggestions = ['CPU', 'RAM', 'GPU', 'Storage', 'Display', 'Battery', 'Weight', 'OS', 'Warranty'];
  newSpec = { spec_key: '', spec_value: '' };
  showSpecSuggestions = false;
  filteredSpecSuggestions: string[] = [];

  // Variants
  variantAttributes: VariantAttribute[] = [];
  newAttribute = { name: '', values: '' };
  generatedVariants: Variant[] = [];
  showVariantSection = false;

  // UI States
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private brandService: BrandService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadBrands();
    this.loadCategories();
    this.loadDraft();
  }

  loadBrands(): void {
    this.brandService.getAllBrand().subscribe({
      next: (response) => {
        this.brands = response.data;
      },
      error: (err) => console.error('Error loading brands:', err)
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  // IMAGE UPLOAD
  onThumbnailSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadImage(file, true);
    }
  }

  onImagesSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => this.uploadImage(file, false));
  }

  uploadImage(file: File, isThumbnail: boolean): void {
    this.uploadingImages = true;
    const formData = new FormData();
    formData.append('images', file);

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<{ data: string[], message: string, success: boolean }>(
      `${environment.apiUrl}/media/upload`,
      formData,
      { headers }
    ).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          const imageUrl = response.data[0];
          if (isThumbnail) {
            this.product.thumbnail = imageUrl;
            this.thumbnailPreview = imageUrl;
          } else {
            this.product.images.push(imageUrl);
            this.imagesPreviews.push(imageUrl);
          }
          this.saveDraft();
        }
        this.uploadingImages = false;
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.uploadingImages = false;
        this.showError('Failed to upload image');
      }
    });
  }

  removeImage(index: number): void {
    this.product.images.splice(index, 1);
    this.imagesPreviews.splice(index, 1);
    this.saveDraft();
  }

  removeThumbnail(): void {
    this.product.thumbnail = '';
    this.thumbnailPreview = '';
    this.saveDraft();
  }

  // SPECIFICATIONS
  filterSpecSuggestions(): void {
    const query = this.newSpec.spec_key.toLowerCase();
    this.filteredSpecSuggestions = this.specSuggestions.filter(s =>
      s.toLowerCase().includes(query)
    );
    this.showSpecSuggestions = this.filteredSpecSuggestions.length > 0;
  }

  selectSpecSuggestion(spec: string): void {
    this.newSpec.spec_key = spec;
    this.showSpecSuggestions = false;
  }

  addSpecification(): void {
    if (this.newSpec.spec_key.trim() && this.newSpec.spec_value.trim()) {
      this.product.specifications.push({
        spec_key: this.newSpec.spec_key.trim(),
        spec_value: this.newSpec.spec_value.trim(),
        display_order: this.product.specifications.length + 1
      });
      this.newSpec = { spec_key: '', spec_value: '' };
      this.saveDraft();
    }
  }

  removeSpecification(index: number): void {
    this.product.specifications.splice(index, 1);
    this.product.specifications.forEach((spec, i) => {
      spec.display_order = i + 1;
    });
    this.saveDraft();
  }

  // VARIANTS
  addVariantAttribute(): void {
    if (this.newAttribute.name.trim() && this.newAttribute.values.trim()) {
      const values = this.newAttribute.values.split(',').map(v => v.trim()).filter(v => v);
      if (values.length > 0) {
        this.variantAttributes.push({
          name: this.newAttribute.name.trim(),
          values: values
        });
        this.newAttribute = { name: '', values: '' };
        this.generateVariants();
        this.showVariantSection = true;
      }
    }
  }

  removeVariantAttribute(index: number): void {
    this.variantAttributes.splice(index, 1);
    this.generateVariants();
    if (this.variantAttributes.length === 0) {
      this.showVariantSection = false;
    }
  }

  generateVariants(): void {
    if (this.variantAttributes.length === 0) {
      this.generatedVariants = [{
        attributes: {},
        price: 0,
        stock_quantity: 0,
        images: this.product.thumbnail ? [this.product.thumbnail] : [],
        is_active: true
      }];
      return;
    }

    const combinations = this.cartesianProduct(
      this.variantAttributes.map(attr => attr.values)
    );

    this.generatedVariants = combinations.map(combo => {
      const attributes: { [key: string]: string } = {};
      combo.forEach((value, index) => {
        attributes[this.variantAttributes[index].name] = value;
      });

      const existing = this.generatedVariants.find(v =>
        JSON.stringify(v.attributes) === JSON.stringify(attributes)
      );

      return existing || {
        attributes,
        price: 0,
        stock_quantity: 0,
        images: this.product.thumbnail ? [this.product.thumbnail] : [],
        is_active: true
      };
    });

    this.saveDraft();
  }

  cartesianProduct(arrays: string[][]): string[][] {
    return arrays.reduce((acc, curr) => {
      return acc.flatMap(a => curr.map(c => [...a, c]));
    }, [[]] as string[][]);
  }

  getAttributeKeys(): string[] {
    return this.variantAttributes.map(attr => attr.name);
  }

  // SUBMIT
  validateForm(): boolean {
    if (!this.product.name.trim()) {
      this.showError('Product name is required');
      return false;
    }
    if (!this.product.brand_id) {
      this.showError('Please select a brand');
      return false;
    }
    if (!this.product.category_id) {
      this.showError('Please select a category');
      return false;
    }
    if (!this.product.thumbnail) {
      this.showError('Thumbnail image is required');
      return false;
    }
    if (this.product.images.length === 0) {
      this.showError('At least one gallery image is required');
      return false;
    }
    if (this.generatedVariants.length === 0) {
      this.showError('At least one variant is required');
      return false;
    }
    for (const variant of this.generatedVariants) {
      if (!variant.price || variant.price <= 0) {
        this.showError('All variants must have a valid price greater than 0');
        return false;
      }
      if (variant.stock_quantity === null || variant.stock_quantity === undefined || variant.stock_quantity < 0) {
        this.showError('Stock quantity cannot be negative');
        return false;
      }
    }
    return true;
  }

  submitProduct(): void {
    if (!this.validateForm()) return;

    this.saving = true;
    this.errorMessage = '';

    const payload = this.preparePayload();

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post(`${environment.apiUrl}/product/add`, payload, { headers })
      .subscribe({
        next: () => {
          this.showSuccess('Product created successfully!');
          this.clearDraft();
          setTimeout(() => this.resetForm(), 2000);
          this.saving = false;
        },
        error: (err) => {
          console.error('Error details:', err.error);
          this.showError(err.error?.message || 'Failed to create product');
          this.saving = false;
        }
      });
  }

  private preparePayload() {
    return {
      ...this.product,
      brand_id: Number(this.product.brand_id),
      category_id: Number(this.product.category_id),
      has_variant: this.variantAttributes.length > 0,
      specifications: this.product.specifications.map((spec, index) => ({
        ...spec,
        display_order: index + 1
      })),
      variants: this.generatedVariants.map(v => ({
        attributes: v.attributes,
        price: Number(v.price),
        stock_quantity: Number(v.stock_quantity),
        images: v.images && v.images.length > 0 ? v.images : [this.product.thumbnail],
        is_active: v.is_active
      }))
    };
  }

  resetForm(): void {
    this.product = {
      name: '',
      brand_id: null,
      category_id: null,
      description: '',
      short_description: '',
      status: 'active',
      has_variant: false,
      thumbnail: '',
      images: [],
      specifications: [],
      variants: []
    };
    this.thumbnailPreview = '';
    this.imagesPreviews = [];
    this.variantAttributes = [];
    this.generatedVariants = [];
    this.showVariantSection = false;
  }

  // DRAFT MANAGEMENT
  saveDraft(): void {
    const draft = {
      product: this.product,
      variantAttributes: this.variantAttributes,
      generatedVariants: this.generatedVariants,
      thumbnailPreview: this.thumbnailPreview,
      imagesPreviews: this.imagesPreviews
    };
    localStorage.setItem('product_draft', JSON.stringify(draft));
  }

  loadDraft(): void {
    const draft = localStorage.getItem('product_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        this.product = parsed.product || this.product;
        this.variantAttributes = parsed.variantAttributes || [];
        this.generatedVariants = parsed.generatedVariants || [];
        this.thumbnailPreview = parsed.thumbnailPreview || '';
        this.imagesPreviews = parsed.imagesPreviews || [];
        this.showVariantSection = this.variantAttributes.length > 0;
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }

  clearDraft(): void {
    localStorage.removeItem('product_draft');
  }

  // NOTIFICATIONS
  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
  }
}
