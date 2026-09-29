import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: 'app-validate-otp-register-user',
  templateUrl: './validate-otp-register-user.component.html',
  styleUrls: ['./validate-otp-register-user.component.css']
})
export class ValidateOtpRegisterUserComponent implements OnInit {
  // ViewChild để quản lý việc tự động chuyển ô input
  @ViewChild('otp1') otp1!: ElementRef;
  @ViewChild('otp2') otp2!: ElementRef;
  @ViewChild('otp3') otp3!: ElementRef;
  @ViewChild('otp4') otp4!: ElementRef;
  @ViewChild('otp5') otp5!: ElementRef;
  @ViewChild('otp6') otp6!: ElementRef;

  otpForm!: FormGroup;
  userEmail: string = '';
  isLoading = false;
  errorMessage = '';
  isVerified = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Lấy email từ trang Register truyền sang qua URL
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || '';
      if (!this.userEmail) {
        this.toastService.warning('Thông báo', 'Vui lòng thực hiện đăng ký trước.');
        this.router.navigate(['/register-user']);
      }
    });

    // Khởi tạo form 6 ô số
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
    });
  }

  // Ghép 6 ô input thành chuỗi OTP hoàn chỉnh
  private getOtp(): string {
    const f = this.otpForm.value;
    return `${f.digit1}${f.digit2}${f.digit3}${f.digit4}${f.digit5}${f.digit6}`;
  }

  onVerifyOtp(event?: Event): void {
    if (event) event.preventDefault();

    if (this.otpForm.invalid) {
      this.errorMessage = 'Vui lòng nhập đầy đủ 6 chữ số.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const otpValue = this.getOtp();


    this.authService.validateRegisterOtp({
      otp: otpValue,
      email: this.userEmail
    }).subscribe({
      next: () => {
        // Xử lý thành công (204 No Content)
        this.isLoading = false;
        this.isVerified = true;
        this.toastService.success('Thành công', 'Tài khoản của bạn đã được kích hoạt!');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
        this.toastService.error('Lỗi xác thực', this.errorMessage);
      }
    });
  }

  // Tự động chuyển focus sang ô tiếp theo khi nhập
  onInput(event: any, currentIndex: number): void {
    const input = event.target;
    const value = input.value;

    if (!/^[0-9]$/.test(value)) {
      input.value = '';
      return;
    }

    if (value.length === 1 && currentIndex < 6) {
      const nextInput = this.getInputByIndex(currentIndex + 1);
      if (nextInput) nextInput.nativeElement.focus();
    }

    if (this.otpForm.valid) {
      this.onVerifyOtp();
    }
  }

  // Xử lý khi bấm nút Xóa (Backspace) để quay lại ô trước
  onKeyDown(event: KeyboardEvent, currentIndex: number): void {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (input.value === '' && currentIndex > 1) {
        const prevInput = this.getInputByIndex(currentIndex - 1);
        if (prevInput) prevInput.nativeElement.focus();
      }
    }
  }

  private getInputByIndex(index: number): ElementRef | null {
    const inputs = [this.otp1, this.otp2, this.otp3, this.otp4, this.otp5, this.otp6];
    return inputs[index - 1] || null;
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData && /^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      this.otpForm.patchValue({
        digit1: digits[0], digit2: digits[1], digit3: digits[2],
        digit4: digits[3], digit5: digits[4], digit6: digits[5],
      });
      this.onVerifyOtp();
    }
  }
}
