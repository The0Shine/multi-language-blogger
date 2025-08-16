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

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

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
