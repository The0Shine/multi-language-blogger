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
    // Reset password confirmation error when password changes
    if (this.submitted) {
      this.validateField('password');
      this.validateField('password_confirmation');
    }
  }

  // Validate individual field
  validateField(fieldName: keyof typeof this.fieldErrors): void {
    switch (fieldName) {
      case 'first_name':
        this.fieldErrors.first_name = !this.userData.first_name.trim();
        break;
      case 'last_name':
        this.fieldErrors.last_name = !this.userData.last_name.trim();
        break;
      case 'username':
        this.fieldErrors.username = !this.userData.username.trim();
        break;
      case 'email':
        this.fieldErrors.email =
          !this.userData.email.trim() ||
          !this.isValidEmail(this.userData.email);
        break;
      case 'password':
        this.fieldErrors.password =
          !this.userData.password ||
          (this.passwordStrengthComponent &&
            !this.passwordStrengthComponent.isPasswordValid());
        break;
      case 'password_confirmation':
        this.fieldErrors.password_confirmation =
          !this.userData.password_confirmation ||
          this.userData.password !== this.userData.password_confirmation;
        break;
    }
  }

  // Validate all fields
  validateAllFields(): boolean {
    this.validateField('first_name');
    this.validateField('last_name');
    this.validateField('username');
    this.validateField('email');
    this.validateField('password');
    this.validateField('password_confirmation');

    return !Object.values(this.fieldErrors).some((error) => error);
  }

  // Email validation helper
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get CSS classes for input fields
  getInputClasses(fieldName: keyof typeof this.fieldErrors): string {
    const baseClasses =
      'placeholder:text-gray-400 input-focus block w-full px-3 py-3 border rounded-lg focus:outline-none transition duration-200';
    const normalClasses =
      'border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
    const errorClasses =
      'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50';

    if (this.submitted && this.fieldErrors[fieldName]) {
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

    if (this.submitted && this.fieldErrors[fieldName]) {
      return `${baseClasses} ${errorClasses}`;
    }
    return `${baseClasses} ${normalClasses}`;
  }

  // Handle field blur events for real-time validation
  onFieldBlur(fieldName: keyof typeof this.fieldErrors): void {
    if (this.submitted) {
      this.validateField(fieldName);
    }
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.submitted = true;
    this.errorMessage = '';
    this.errorList = [];

    // Validate all fields
    if (!this.validateAllFields()) {
      // Set general error message
      const errorFields = Object.keys(this.fieldErrors).filter(
        (key) => this.fieldErrors[key as keyof typeof this.fieldErrors]
      );
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
        this.errorMessage =
          error.message || 'Registration failed. Please try again.';
        this.errorList = error.errors || [];
      },
    });
  }
}
