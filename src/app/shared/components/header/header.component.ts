import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false; // ✅ thêm biến này


  // ✅ Search text cho cả desktop và mobile
  searchText: string = '';
  searchTextMobile: string = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Lấy trạng thái đăng nhập
    this.isLoggedIn = this.auth.isLoggedIn();

    // ✅ Lắng nghe thay đổi trạng thái (nếu AuthService có BehaviorSubject)
    this.auth.authStatus$.subscribe(status => {
      this.isLoggedIn = status;
    });

    // ✅ Clear search khi điều hướng
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!event.url.includes('/category')) {
          this.searchText = '';
          this.searchTextMobile = '';
        }
      }
    });
  }

  onLogout() {
    this.auth.logout();
    this.isLoggedIn = false; // ✅ cập nhật luôn
    this.router.navigate(['/']);
  }

  /**
   * ✅ Xử lý search - Desktop
   */
  onSearch(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const searchTerm = this.searchText?.trim();

    if (searchTerm) {
      // Navigate đến category page với search query param
      this.router.navigate(['/category'], {
        queryParams: { search: searchTerm }
      });
    } else {
      // Nếu search rỗng, navigate về category không có search param
      this.router.navigate(['/category']);
    }
  }

  /**
   * ✅ Xử lý search - Mobile
   */
  onSearchMobile(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const searchTerm = this.searchTextMobile?.trim();

    if (searchTerm) {
      // Navigate đến category page với search query param
      this.router.navigate(['/category'], {
        queryParams: { search: searchTerm }
      });

      // ✅ Đóng mobile search collapse sau khi search
      const mobileSearchCollapse = document.getElementById('mobileSearch');
      if (mobileSearchCollapse) {
        const bsCollapse = (window as any).bootstrap?.Collapse?.getInstance(mobileSearchCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    } else {
      this.router.navigate(['/category']);
    }
  }

  /**
   * ✅ Xử lý khi nhấn Enter trong search input - Desktop
   */
  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearch();
    }
  }

  /**
   * ✅ Xử lý khi nhấn Enter trong search input - Mobile
   */
  onSearchKeyPressMobile(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearchMobile();
    }
  }

  /**
   * ✅ Clear search - Desktop
   */
  clearSearch(): void {
    this.searchText = '';
    this.router.navigate(['/category']);
  }

  /**
   * ✅ Clear search - Mobile
   */
  clearSearchMobile(): void {
    this.searchTextMobile = '';
    this.router.navigate(['/category']);
  }
}
