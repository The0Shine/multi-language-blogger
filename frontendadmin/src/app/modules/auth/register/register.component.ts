import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// ✅ Custom validator: không cho phép dấu cách
export function noWhitespaceValidator(
  control: AbstractControl
): ValidationErrors | null {
  const hasWhitespace = (control.value || '').includes(' ');
  return hasWhitespace ? { whitespace: true } : null;
}

// ✅ Custom validator: bắt buộc viết hoa chữ cái đầu
export function capitalizedFirstLetterValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value || '';
  if (value && value.length > 0 && value[0] !== value[0].toUpperCase()) {
    return { notCapitalized: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  errorMessage: string | null = null;
  showConfirmPassword = false;
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          noWhitespaceValidator, // Thêm validator không dấu cách
          capitalizedFirstLetterValidator, // Thêm validator viết hoa chữ cái đầu
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.errorMessage = null;
  }
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  onSubmit(): void {
    this.errorMessage = null; // Reset lỗi cũ
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, username, password, confirmPassword } =
      this.registerForm.value;

    if (!this.passwordsMatch(password, confirmPassword)) {
      // ✅ Hiển thị lỗi dưới ô confirmPassword thay vì lỗi chung
      this.f['confirmPassword'].setErrors({ mismatch: true });
      return;
    }

    const newAdmin = {
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password,
    };

    this.http
      .post('http://localhost:4000/api/auth/register-admin', newAdmin)
      .subscribe({
        next: () => {
          this.isSuccess = true;
          setTimeout(() => {
            this.isSuccess = false;
            this.goToLogin();
          }, 5000);
        },
        error: (err) => {
          console.error(err);
          // ✅ Xử lý lỗi cụ thể từ back-end
          // Giả định back-end trả về lỗi có `code` hoặc `field`
          const errorData = err.error;
          switch (errorData?.code) {
            case 'USERNAME_EXISTS':
              this.errorMessage = 'Username này đã được sử dụng.';
              break;
            case 'EMAIL_EXISTS':
              this.errorMessage = 'Email này đã được sử dụng.';
              break;
            default:
              this.errorMessage = errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
          }
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
