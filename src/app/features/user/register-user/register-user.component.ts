import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import {ToastService} from "../../../core/services/toast.service";
import {AuthService} from "../../../core/services/auth.service";
@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {
  signUpForm!: FormGroup;
  isLoading = false;
  errorMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

// Lưu danh sách lỗi chi tiết theo từng field
  validationErrors: { [key: string]: string } = {};

  // Hàm kiểm tra lỗi cho từng ô input (dùng cho HTML)
  getFieldError(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.validationErrors = {}; // Reset lỗi cũ

    this.authService.register(this.signUpForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastService.success('Thành công', 'Vui lòng kiểm tra mã OTP trong email');
          this.router.navigate(['/validate-otp-register-user'], {
            queryParams: { email: this.signUpForm.value.email }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        const serverError = error.error;

        if (serverError) {
          // 1. Nếu backend trả về lỗi theo từng field (như errors: { Name: '...', Password: '...' })
          if (serverError.errors) {
            this.validationErrors = serverError.errors;
            this.errorMessage = ''; // Ẩn thông báo chung đi vì đã có lỗi hiện chi tiết dưới từng ô
          }
          // 2. Nếu backend trả về lỗi dạng message chung (như email trùng)
          else if (serverError.message) {
            this.errorMessage = serverError.message;
            this.validationErrors = {};
          }
          else {
            this.errorMessage = 'Đăng ký thất bại';
            this.validationErrors = {};
          }
        } else {
          this.errorMessage = 'Đăng ký thất bại';
          this.validationErrors = {};
        }
      }
    });
  }

}
