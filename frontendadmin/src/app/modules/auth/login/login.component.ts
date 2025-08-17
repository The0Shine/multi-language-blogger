import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  ngOnInit() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
      this.loginForm.patchValue({
        username: savedUsername,
        rememberMe: true,
      });
    }
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

    const { username, password, rememberMe } = this.loginForm.value;

    const formattedUsername = username.charAt(0).toUpperCase() + username.slice(1);
    if (username !== formattedUsername) {
      this.errorMessage = 'Username must be capitalized.';
      this.isLoading = false;
      return;
    }

    this.authService.login(formattedUsername, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success) {
          const { accessToken, refreshToken } = res.data;
          const decoded: any = jwtDecode(accessToken);

          if (rememberMe) {
            localStorage.setItem('savedUsername', formattedUsername);
          } else {
            localStorage.removeItem('savedUsername');
          }

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem(
            'user',
            JSON.stringify({
              userid: decoded.userid,
              roleid: decoded.roleid,
              username: formattedUsername,
            })
          );
          this.router.navigate(['/admin/home']);
        } else {
          this.errorMessage = res.message || 'Incorrect login information.';
        }
      },
      // ✅ SỬA LOGIC TRONG KHỐI NÀY
      error: (err) => {
        this.isLoading = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        console.error('Login error:', err);

        // Lấy thông báo lỗi từ server
        const serverMessage = err.error?.message;

        // Kiểm tra nếu lỗi là "Invalid credentials." thì đổi thành "Sai mật khẩu"
        if (serverMessage === 'Invalid credentials.') {
          this.errorMessage = 'Password is incorrect.';
        } else {
          // Với các lỗi khác, giữ nguyên thông báo từ server hoặc báo lỗi chung
          this.errorMessage = serverMessage || 'Login failed, please try again';
        }
      },
    });
  }
  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
