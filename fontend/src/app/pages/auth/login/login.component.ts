import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginCredentials } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['../auth.css'],
})
export class LoginComponent {
  credentials: LoginCredentials = {
    username: '',
    password: '',
    rememberMe: false,
  };

  isLoading = false;
  showPassword = false;
  errorMessage = '';

  // Validation state for each field
  fieldErrors = {
    username: false,
    password: false,
  };

  // Track if form has been submitted to show validation
  submitted = false;

  constructor(public authService: AuthService, private router: Router) {
    // Don't auto-redirect, let user choose to logout
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  forceLogout(): void {
    this.authService.logout();
    // Clear any error messages
    this.errorMessage = '';
  }

  // Validate individual field
  validateField(fieldName: keyof typeof this.fieldErrors): void {
    switch (fieldName) {
      case 'username':
        this.fieldErrors.username = !this.credentials.username.trim();
        break;
      case 'password':
        this.fieldErrors.password = !this.credentials.password.trim();
        break;
    }
  }

  // Validate all fields
  validateAllFields(): boolean {
    this.validateField('username');
    this.validateField('password');

    return !Object.values(this.fieldErrors).some((error) => error);
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

    // Validate all fields
    if (!this.validateAllFields()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;

    // Clear any existing session before login
    this.authService.clearSession();

    this.authService.login(this.credentials).subscribe({
      next: (authResponse) => {
        this.isLoading = false;

        // Redirect based on user role
        const userRole = this.authService.getUserRole();
        console.log('🔍 Login redirect - User role:', userRole);
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('🔍 Current user:', currentUser);

        if (userRole === 'admin') {
          console.log('🔍 Redirecting to admin home');
          this.router.navigate(['/admin/home']);
        } else {
          console.log('🔍 Redirecting to user home');
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);

        // Handle specific error cases
        if (error.message === 'Already logged in.') {
          // Force logout and try again
          this.authService.logout();
          this.errorMessage =
            'Session conflict detected. Please try logging in again.';
        } else {
          this.errorMessage =
            error.message || 'Login failed. Please try again.';
        }
      },
    });
  }
}
