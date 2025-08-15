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
    // 🔹 Xóa token khi vào trang login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // 🔹 Nếu đã lưu username → điền vào form
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

    this.authService.login(username, password).subscribe({
      next: (res) => {
        console.log('📌 Login API response:', res);

        if (res && res.success) {
          const { accessToken, refreshToken, message } = res.data;

          const decoded: any = jwtDecode(accessToken);

          if (+decoded.roleid !== 2) {
            this.errorMessage = 'Bạn không có quyền truy cập!';
            this.isLoading = false;
            return;
          }

          if (rememberMe) {
            localStorage.setItem('savedUsername', username);
          } else {
            localStorage.removeItem('savedUsername');
          }

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // ✅ Lưu username kèm vào user object
          localStorage.setItem(
            'user',
            JSON.stringify({
              userid: decoded.userid,
              roleid: decoded.roleid,
              username: username, // lấy từ form login
            })
          );

          this.router.navigate(['/admin/home']);
        } else {
          this.errorMessage = 'Invalid username or password.';
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);

        // Xóa token và user nếu login fail
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        this.errorMessage = err.error?.message || 'Login failed';
        this.isLoading = false;
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
