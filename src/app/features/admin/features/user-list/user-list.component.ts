import { Component, OnInit } from '@angular/core';
import { User } from "../../../../core/models/user.model";
import { UserService } from "../../../../core/services/user.service";
import { ToastService } from "../../../../core/services/toast.service";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading = false;

  // Filters
  searchText = '';
  selectedRole = '';
  selectedStatus = '';
  perPage = 12;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pages: number[] = [];

  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchText = value;
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    this.loadUsers();

  }

  // 🧠 Load danh sách user có phân trang + filter
  loadUsers(): void {
    this.isLoading = true;

    const params: any = {
      page: this.currentPage,
      limit: this.perPage,
      search: this.searchText.trim() || '',
      role: this.selectedRole || ''
    };

    if (this.selectedStatus) {
      params.is_active = this.selectedStatus === 'active' ? 'true' : 'false';
    }

    this.userService.getAllUsersV2(params).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const data = res.data;
          this.users = data.Data || [];
          this.totalItems = data.Total;
          this.currentPage = data.Page;
          this.totalPages = data.TotalPage;

          // Tạo danh sách trang (hiển thị tối đa 5 trang)
          const start = Math.max(1, this.currentPage - 2);
          const end = Math.min(this.totalPages, start + 4);
          this.pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
          console.log(this.users)
        } else {
          this.users = [];
        }
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading = false;
        this.users = [];
        this.toastService.error(
          err.status === 401 ? 'Phiên đăng nhập hết hạn' : 'Lỗi tải dữ liệu',
          err.status === 401 ? 'Vui lòng đăng nhập lại' : 'Không thể tải danh sách người dùng'
        );
      }
    });
  }

  // 🎯 Search
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  // 🎭 Filters
  onRoleChange(role: string): void {
    this.selectedRole = role;
    this.currentPage = 1;
    this.loadUsers();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadUsers();
  }

  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.currentPage = 1;
    this.loadUsers();
  }

  // 📄 Pagination
  goToPage(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  // 🧩 Helpers
  getRoleClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin': return 'danger';
      case 'customer': return 'primary';
      case 'moderator': return 'warning';
      default: return 'secondary';
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'success' : 'secondary';
  }

  getUserInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }
  onSoftDelete(user: User): void {
    if (!confirm(`Bạn có chắc muốn vô hiệu hóa người dùng "${user.name}" không?`)) {
      return;
    }

    this.userService.softDeleteUser(user.user_uuid).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('Thành công', 'Đã vô hiệu hóa người dùng');
          // Cập nhật ngay trên UI mà không cần reload
          user.is_active = false;
        } else {
          this.toastService.error('Thất bại', res.message || 'Không thể vô hiệu hóa');
        }
      },
      error: (err) => {
        console.error('Soft delete error:', err);
        this.toastService.error('Lỗi', 'Không thể kết nối tới máy chủ');
      }
    });
  }



}
