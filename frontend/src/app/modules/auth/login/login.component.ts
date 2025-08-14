import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service'; // ✅ Import đúng AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // ✅ Thêm vào constructor
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

 onSubmit(): void {
  if (this.isLoading) return;
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.isLoading = true;
  this.errorMessage = null;

  const { username, password } = this.loginForm.value;

this.authService.login(username, password).subscribe({
  next: (res) => {
    if (res && res.success) {
      this.router.navigate(['/admin/home']);
    } else {
      this.errorMessage = 'Invalid username or password.';
    }
    this.isLoading = false;
  },
  error: (err) => {
    this.errorMessage = err.error?.message || 'Login failed. Please try again.';
    this.isLoading = false;
  }
});

}
  goToRegister() {
    this.router.navigate(['/register']);
  }
    goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }



ngOnInit() {
  // Khi vào trang login thì xóa token và user info để logout
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}


}
