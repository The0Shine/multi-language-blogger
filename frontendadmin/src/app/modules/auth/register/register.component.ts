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
          Validators.pattern(/^[a-zA-Z0-9]+$/), // ✅ Chỉ cho chữ & số
          noWhitespaceValidator, // Thêm validator không dấu cách

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
          console.error('Register error:', err);
          const errorData = err.error;

          // ✅ Trường hợp UNIQUE constraint (username / email trùng)
          if (errorData?.name === 'SequelizeUniqueConstraintError') {
            const field = errorData.errors?.[0]?.path;
            if (field === 'username') {
              this.f['username'].setErrors({
                backend: 'Username này đã được sử dụng.',
              });
            } else if (field === 'email') {
              this.f['email'].setErrors({
                backend: 'Email này đã được sử dụng.',
              });
            }
            return;
          }

          // ✅ Trường hợp ValidationError (BE custom message)
          if (errorData?.name === 'SequelizeValidationError') {
            const field = errorData.errors?.[0]?.path;
            const message = errorData.errors?.[0]?.message;
            if (field && this.f[field]) {
              this.f[field].setErrors({ backend: message });
              return;
            }
          }

          // ✅ Nếu BE trả về code riêng
          if (errorData?.code === 'USERNAME_EXISTS') {
            this.f['username'].setErrors({
              backend: 'Username này đã được sử dụng.',
            });
            return;
          }
          if (errorData?.code === 'EMAIL_EXISTS') {
            this.f['email'].setErrors({
              backend: 'Email này đã được sử dụng.',
            });
            return;
          }

          // ✅ Fallback error
          this.errorMessage =
            errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
