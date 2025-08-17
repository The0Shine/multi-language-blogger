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
    // Password strength is now handled by the PasswordStrengthComponent
    // No need to calculate here anymore
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.errorMessage = '';
    this.errorList = [];

    // Basic validation
    if (!this.userData.first_name.trim()) {
      this.errorMessage = 'First name is required';
      return;
    }

    if (!this.userData.last_name.trim()) {
      this.errorMessage = 'Last name is required';
      return;
    }

    if (!this.userData.email.trim()) {
      this.errorMessage = 'Email is required';
      return;
    }

    if (!this.userData.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }

    if (!this.userData.password) {
      this.errorMessage = 'Password is required';
      return;
    }

    // Check password strength requirements
    if (
      this.passwordStrengthComponent &&
      !this.passwordStrengthComponent.isPasswordValid()
    ) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (this.userData.password !== this.userData.password_confirmation) {
      this.errorMessage = 'Passwords do not match';
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
