import { Component, OnInit } from '@angular/core';
import {ProductService} from "../../../core/services/product.service";
import {GetTop3TrendingRes, ProductTrendingItem, Top8SellerResponse} from "../../../core/models/product.model";
import {BrandService} from "../../../core/services/brand.service";
import {interval, Subscription} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  top8Earphone : Top8SellerResponse[] = [];
  top3Thumbnail: ProductTrendingItem[] = [];
  trendingData?: GetTop3TrendingRes;
  screens : ProductTrendingItem[] = [];
  keyboards : ProductTrendingItem[] = [];
  laptops : ProductTrendingItem[] = [];
  mouses : ProductTrendingItem[] = [];
  constructor(private productService: ProductService) { }

  private subscription!: Subscription;

  // Ngày kết thúc (Bạn có thể đổi ngày tại đây)
  public endDate = new Date('2026-12-31T23:59:59');

  public days: number = 0;
  public hours: number = 0;
  public minutes: number = 0;
  public seconds: number = 0;

  ngOnInit(): void {
    this.loadHomeData()
    // Chạy mỗi giây một lần
    this.subscription = interval(1000).subscribe(() => {
      this.calculateTime();
    });
  }

  loadHomeData() {
    this.productService.getTop3Trending().subscribe(
      (res) => {
        this.trendingData = res.data;
        this.top3Thumbnail = res.data.images; // Gán mảng ảnh vào đây để HTML cũ không bị lỗi
        this.screens = res.data.screens.slice(0,3);
        this.laptops = res.data.laptops.slice(0,3);
        this.keyboards = res.data.keyboards;
        this.mouses = res.data.mouses;
        console.log('Dữ liệu trang chủ:', this.trendingData);
      },
      (err) => console.error(err)
    );
  }

  private calculateTime() {
    const now = new Date().getTime();
    const diff = this.endDate.getTime() - now;

    if (diff > 0) {
      this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((diff % (1000 * 60)) / 1000);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
