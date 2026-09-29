import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from "../../../../core/services/user.service";
import { UpdateUserRequest } from "../../../../core/models/user.model";

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent implements OnInit {

  createUserForm: FormGroup;
  roles = ['customer', 'admin'];
  userUuid: string = '';
  isLoading: boolean = false;
  isLoadingData: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.createUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      role: ['customer', Validators.required],
      is_active: [true, Validators.required] // Khởi tạo với boolean true
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userUuid = params['uuid'];
      if (this.userUuid) {
        this.loadUserData();
      }
    });
  }

  loadUserData(): void {
    this.isLoadingData = true;
    this.userService.getUserByUuid(this.userUuid).subscribe({
      next: (response) => {
        console.log('User data loaded:', response);
        const user = response.data;

        // Đổ data vào form với is_active là boolean
        this.createUserForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          is_active: user.is_active === true || user.is_active === 'true' // Đảm bảo là boolean
        });

        this.isLoadingData = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        alert('Failed to load user data: ' + (error.error?.message || 'Unknown error'));
        this.isLoadingData = false;
        this.router.navigate(['/admin/users-list']);
      }
    });
  }

  onSubmit(): void {
    if (this.createUserForm.valid) {
      this.isLoading = true;

      // Lấy giá trị is_active và chuyển sang boolean
      const isActiveValue = this.createUserForm.value.is_active;
      let isActiveBool: boolean;

      // Xử lý tất cả các trường hợp có thể
      if (typeof isActiveValue === 'boolean') {
        isActiveBool = isActiveValue;
      } else if (typeof isActiveValue === 'string') {
        isActiveBool = isActiveValue === 'true';
      } else {
        isActiveBool = Boolean(isActiveValue);
      }

      const userData: UpdateUserRequest = {
        name: this.createUserForm.value.name,
        email: this.createUserForm.value.email,
        phone: this.createUserForm.value.phone,
        address: this.createUserForm.value.address,
        role: this.createUserForm.value.role,
        is_active: isActiveBool // Đảm bảo luôn là boolean
      };

      console.log('Updating user with data:', userData);
      console.log('is_active type:', typeof userData.is_active);
      console.log('is_active value:', userData.is_active);

      this.userService.updateUser(this.userUuid, userData).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          alert('User updated successfully!');
          this.router.navigate(['/admin/users-list']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          console.log('=== ERROR DETAILS ===');
          console.log('Error details:', error.error);
          console.log('Error errors:', error.error?.errors);
          console.log('Error message:', error.error?.message);

          let errorMessage = 'Failed to update user: ';
          if (error.error?.errors) {
            // Hiển thị các lỗi validation
            const errors = Object.values(error.error.errors).join(', ');
            errorMessage += errors;
          } else if (error.error?.message) {
            errorMessage += error.error.message;
          } else {
            errorMessage += 'Unknown error';
          }

          alert(errorMessage);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      alert('Please fill in all required fields correctly!');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createUserForm.controls).forEach(key => {
      const control = this.createUserForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createUserForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.createUserForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }
}
