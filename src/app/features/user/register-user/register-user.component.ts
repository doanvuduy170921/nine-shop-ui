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
  validationErrors: { [key: string]: string } = {};
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

  getFieldError(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }


  onSubmit() {
    if (this.signUpForm.invalid) return;

    this.isLoading = true;
    this.authService.register(this.signUpForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Thành công', 'Vui lòng kiểm tra mã OTP trong email');

          // SỬA TẠI ĐÂY: Thêm queryParams để truyền email đi
          this.router.navigate(['/validate-otp-register-user'], {
            queryParams: { email: this.signUpForm.value.email }
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        // Duy nên thêm log lỗi ở đây để dễ debug nếu backend báo lỗi
        this.errorMessage = error.error?.message || 'Đăng ký thất bại';
        console.log(error)
      }
    });
  }

}
