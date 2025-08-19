import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, type RegisterData } from '../../../services/auth.service';
import { PasswordStrengthComponent } from '../../../components/password-strength/password-strength.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PasswordStrengthComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../auth.css'],
})
export class RegisterComponent {
  @ViewChild(PasswordStrengthComponent)
  passwordStrengthComponent!: PasswordStrengthComponent;

  userData: RegisterData = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  };

  isLoading = false;
  showPassword = false;
  errorMessage = '';
  errorList: string[] = [];

  // Validation state for each field
  fieldErrors = {
    first_name: false,
    last_name: false,
    username: false,
    email: false,
    password: false,
    password_confirmation: false,
  };

  // Error messages for each field
  fieldErrorMessages = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  };

  // Track if form has been submitted to show validation
  submitted = false;

  constructor(private authService: AuthService, private router: Router) {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onPasswordChange(): void {
    // Clear password error when user starts typing
    if (this.fieldErrors.password) {
      this.clearFieldError('password');
    }

    // Also clear password confirmation error if it exists
    if (this.fieldErrors.password_confirmation) {
      this.clearFieldError('password_confirmation');
    }
  }

  // Clear field error
  clearFieldError(fieldName: keyof typeof this.fieldErrors): void {
    this.fieldErrors[fieldName] = false;
    this.fieldErrorMessages[fieldName] = '';
  }

  // Set field error
  setFieldError(
    fieldName: keyof typeof this.fieldErrors,
    message: string
  ): void {
    this.fieldErrors[fieldName] = true;
    this.fieldErrorMessages[fieldName] = message;
  }

  // Validate individual field
  validateField(fieldName: keyof typeof this.fieldErrors): void {
    // Clear previous error
    this.clearFieldError(fieldName);

    switch (fieldName) {
      case 'first_name':
        if (!this.userData.first_name?.trim()) {
          this.setFieldError('first_name', 'First name is required');
        }
        break;
      case 'last_name':
        if (!this.userData.last_name?.trim()) {
          this.setFieldError('last_name', 'Last name is required');
        }
        break;
      case 'username':
        if (!this.userData.username?.trim()) {
          this.setFieldError('username', 'Username is required');
        } else if (this.userData.username.length < 3) {
          this.setFieldError(
            'username',
            'Username must be at least 3 characters'
          );
        }
        break;
      case 'email':
        if (!this.userData.email?.trim()) {
          this.setFieldError('email', 'Email is required');
        } else if (!this.isValidEmail(this.userData.email)) {
          this.setFieldError('email', 'Please enter a valid email address');
        }
        break;
      case 'password':
        if (!this.userData.password) {
          this.setFieldError('password', 'Password is required');
        } else if (
          this.passwordStrengthComponent &&
          !this.passwordStrengthComponent.isPasswordValid()
        ) {
          this.setFieldError(
            'password',
            'Password must be at least 6 characters long'
          );
        }
        break;
      case 'password_confirmation':
        if (!this.userData.password_confirmation) {
          this.setFieldError(
            'password_confirmation',
            'Password confirmation is required'
          );
        } else if (
          this.userData.password !== this.userData.password_confirmation
        ) {
          this.setFieldError('password_confirmation', 'Passwords do not match');
        }
        break;
    }
  }

  // Validate all fields
  validateAllFields(): boolean {
    // Đảm bảo tất cả fields được validate
    const fieldsToValidate: (keyof typeof this.fieldErrors)[] = [
      'first_name',
      'last_name',
      'username',
      'email',
      'password',
      'password_confirmation',
    ];

    fieldsToValidate.forEach((field) => {
      this.validateField(field);
    });

    return !Object.values(this.fieldErrors).some((error) => error);
  }

  // Email validation helper
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Handle backend validation errors
  handleBackendErrors(error: any): void {
    // Clear all previous errors
    Object.keys(this.fieldErrors).forEach((key) => {
      this.clearFieldError(key as keyof typeof this.fieldErrors);
    });

    // Handle validation errors from backend
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: any) => {
        if (err.path && err.msg) {
          const fieldName = this.mapBackendFieldName(err.path);
          if (fieldName) {
            this.setFieldError(fieldName, err.msg);
          }
        }
      });
    }

    // Handle specific error messages
    if (error.message) {
      if (
        error.message.includes('Email already in use') ||
        error.message.includes('email')
      ) {
        this.setFieldError('email', 'This email is already registered');
      } else if (
        error.message.includes('Username already exists') ||
        error.message.includes('username')
      ) {
        this.setFieldError('username', 'This username is already taken');
      } else {
        this.errorMessage = error.message;
      }
    }
  }

  // Map backend field names to frontend field names
  private mapBackendFieldName(
    backendField: string
  ): keyof typeof this.fieldErrors | null {
    const fieldMapping: Record<string, keyof typeof this.fieldErrors> = {
      first_name: 'first_name',
      last_name: 'last_name',
      username: 'username',
      email: 'email',
      password: 'password',
      password_confirmation: 'password_confirmation',
    };

    return fieldMapping[backendField] || null;
  }

  // Get CSS classes for input fields
  getInputClasses(fieldName: keyof typeof this.fieldErrors): string {
    const baseClasses =
      'placeholder:text-gray-400 input-focus block w-full px-3 py-3 border rounded-lg focus:outline-none transition duration-200';
    const normalClasses =
      'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
    const errorClasses =
      'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50';

    // Show error styling if field has error (regardless of submit status)
    if (this.fieldErrors[fieldName]) {
      return `${baseClasses} ${errorClasses}`;
    }
    return `${baseClasses} ${normalClasses}`;
  }

  // Get CSS classes for input fields with padding (for icon fields)
  getInputClassesWithPadding(
    fieldName: keyof typeof this.fieldErrors,
    leftPadding: boolean = true,
    rightPadding: boolean = false
  ): string {
    let paddingClasses = '';
    if (leftPadding && rightPadding) {
      paddingClasses = 'pl-10 pr-10';
    } else if (leftPadding) {
      paddingClasses = 'pl-10 pr-3';
    } else if (rightPadding) {
      paddingClasses = 'pl-3 pr-10';
    } else {
      paddingClasses = 'px-3';
    }

    const baseClasses = `placeholder:text-gray-400 input-focus block w-full ${paddingClasses} py-3 border rounded-lg focus:outline-none transition duration-200`;
    const normalClasses =
      'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
    const errorClasses =
      'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50';

    // Show error styling if field has error (regardless of submit status)
    if (this.fieldErrors[fieldName]) {
      return `${baseClasses} ${errorClasses}`;
    }
    return `${baseClasses} ${normalClasses}`;
  }

  // Handle field blur events for real-time validation
  onFieldBlur(fieldName: keyof typeof this.fieldErrors): void {
    // Always validate on blur for immediate feedback
    this.validateField(fieldName);
  }

  // Handle field input events for real-time validation
  onFieldInput(fieldName: keyof typeof this.fieldErrors): void {
    // Clear error when user starts typing (if field was previously invalid)
    if (this.fieldErrors[fieldName]) {
      this.clearFieldError(fieldName);
    }
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.submitted = true;
    this.errorMessage = '';
    this.errorList = [];

    // Validate all fields
    if (!this.validateAllFields()) {
      this.errorMessage = 'Please fix the errors below and try again.';
      return;
    }

    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);

        // Handle backend validation errors
        this.handleBackendErrors(error);

        // Set general error message if no specific field errors
        if (!Object.values(this.fieldErrors).some((hasError) => hasError)) {
          this.errorMessage =
            error.message || 'Registration failed. Please try again.';
        }
      },
    });
  }
}
