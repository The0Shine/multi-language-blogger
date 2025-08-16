import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, type RegisterData } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['../auth.css'],
})
export class RegisterComponent {
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
  passwordStrength = { strength: 0, label: 'Very Weak', color: '#ef4444' };

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
    this.passwordStrength = this.authService.getPasswordStrength(
      this.userData.password
    );
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.errorList = [];

    this.authService.register(this.userData).subscribe({
      next: (user) => {
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
