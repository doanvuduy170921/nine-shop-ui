// src/app/features/user/validate-otp/validate-otp.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PendingOrderService } from '../../../core/services/pending-order.service';

@Component({
  selector: 'app-validate-otp',
  templateUrl: './validate-otp.component.html',
  styleUrls: ['./validate-otp.component.css']
})
export class ValidateOtpComponent implements OnInit {
  @ViewChild('otp1') otp1!: ElementRef;
  @ViewChild('otp2') otp2!: ElementRef;
  @ViewChild('otp3') otp3!: ElementRef;
  @ViewChild('otp4') otp4!: ElementRef;
  @ViewChild('otp5') otp5!: ElementRef;
  @ViewChild('otp6') otp6!: ElementRef;

  otpForm!: FormGroup;
  pendingOrderId!: number;
  userEmail: string = '';
  isLoading = false;
  errorMessage = '';
  isVerified = false;

  constructor(
    private fb: FormBuilder,
    private pendingOrderService: PendingOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('pending_order_id');
    const storedEmail = localStorage.getItem('checkout_email');

    if (!storedId) {
      alert('Không tìm thấy thông tin đơn hàng!');
      this.router.navigate(['/checkout']);
      return;
    }

    this.pendingOrderId = Number(storedId);
    this.userEmail = storedEmail || 'your email';

    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]],
    });
  }

  private getOtp(): string {
    const f = this.otpForm.value;
    return `${f.digit1}${f.digit2}${f.digit3}${f.digit4}${f.digit5}${f.digit6}`;
  }

  onVerifyOtp(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    if (this.otpForm.invalid) {
      this.errorMessage = 'Vui lòng nhập đầy đủ 6 chữ số OTP.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const otp = this.getOtp();

    this.pendingOrderService.validateOtp({
      otp: otp,
      p_order_id: this.pendingOrderId
    }).subscribe({
      next: (response) => {
        console.log('OTP validated successfully:', response);
        this.isLoading = false;
        this.isVerified = true;

        localStorage.setItem('order_id', response.data.id.toString());
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('checkout_summary');
        localStorage.removeItem('checkout_email');

        setTimeout(() => {
          this.router.navigate(['/payment-result'], {
            queryParams: {
              status: 'success',
              order_id: response.data.id
            }
          });
        }, 800);
      },
      error: (error) => {
        console.error('OTP validation error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại.';
      }
    });
  }

  // SỬA: Dùng index để xác định ô tiếp theo
  onInput(event: any, currentIndex: number): void {
    const input = event.target;
    const value = input.value;

    if (!/^[0-9]$/.test(value)) {
      input.value = '';
      return;
    }

    // Focus ô tiếp theo
    if (value.length === 1 && currentIndex < 6) {
      const nextInput = this.getInputByIndex(currentIndex + 1);
      if (nextInput) {
        nextInput.nativeElement.focus();
      }
    }

    // Auto submit khi đủ 6 số
    if (this.otpForm.valid) {
      this.onVerifyOtp();
    }
  }

  // SỬA: Dùng index
  onKeyDown(event: Event, currentIndex: number): void {
    const keyboardEvent = event as KeyboardEvent;
    const input = event.target as HTMLInputElement;

    if (keyboardEvent.key === 'Backspace' && input.value === '' && currentIndex > 1) {
      const prevInput = this.getInputByIndex(currentIndex - 1);
      if (prevInput) {
        prevInput.nativeElement.focus();
      }
    }
  }

  // Helper: Lấy input theo index
  private getInputByIndex(index: number): ElementRef | null {
    switch (index) {
      case 1: return this.otp1;
      case 2: return this.otp2;
      case 3: return this.otp3;
      case 4: return this.otp4;
      case 5: return this.otp5;
      case 6: return this.otp6;
      default: return null;
    }
  }

  onPaste(event: any): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');

    if (pastedData && /^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      this.otpForm.patchValue({
        digit1: digits[0],
        digit2: digits[1],
        digit3: digits[2],
        digit4: digits[3],
        digit5: digits[4],
        digit6: digits[5],
      });

      this.onVerifyOtp();
    }
  }
}
