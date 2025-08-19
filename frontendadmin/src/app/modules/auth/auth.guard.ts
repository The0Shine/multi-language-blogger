import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Guard này chỉ làm MỘT việc: kiểm tra đã đăng nhập chưa.
    if (this.authService.isLoggedIn()) {
      return true; // ✅ Đã đăng nhập, cho phép truy cập khu vực admin
    }

    // ❌ Chưa đăng nhập, đưa về trang login
    this.router.navigate(['/login']);
    return false;
  }
}
