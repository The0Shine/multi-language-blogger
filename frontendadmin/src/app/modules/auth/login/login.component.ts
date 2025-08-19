import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import jwtDecode from 'jwt-decode';
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute

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
  loginMessage: string | null = null; // Biến để lưu thông báo

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute // Thêm ActivatedRoute vào constructor
  ) {
   this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
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
     this.route.queryParams.subscribe(params => {
      this.loginMessage = params['message'] || null;
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

  const { username, password, rememberMe } = this.loginForm.value;


   // chuẩn hóa username về lowercase
  const normalizedUsername = username.trim().toLowerCase();

  // AuthService sẽ tự động lưu token và user vào localStorage khi thành công
  this.authService.login(normalizedUsername, password).subscribe({
    next: (res) => {
      this.isLoading = false;

      // Lấy thông tin user mà AuthService vừa lưu để kiểm tra
      const user = this.authService.getUser();

      // Kiểm tra roleid sau khi đã chắc chắn đăng nhập thành công
      if (user && user.roleid === 1) {
        this.errorMessage = 'User does not have access.';
        // Xóa token vừa được lưu vì user này không có quyền
        this.authService.logout();
        return;
      }

      // Nếu mọi thứ ổn, điều hướng đến trang chủ
      // Ghi nhớ username nếu người dùng chọn
      if (rememberMe) {
        localStorage.setItem('savedUsername', normalizedUsername);
      } else {
        localStorage.removeItem('savedUsername');
      }
      this.router.navigate(['/admin/home']);
    },
    error: (err) => {
      this.isLoading = false;
      console.error('Login error:', err);

      // Luồng xử lý lỗi của bạn được giữ nguyên
      const serverMessage = err.error?.message;
      if (serverMessage === 'Refresh token is required.') {
        this.errorMessage = 'Wrong account or password';
      } else {
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
