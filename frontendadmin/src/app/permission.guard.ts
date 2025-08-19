// src/app/permission.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './modules/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission = route.data['permission'];

    if (!requiredPermission) {
      return true;
    }

    if (this.authService.hasPermission(requiredPermission)) {
      return true; // ✅ Có quyền, cho phép truy cập
    } else {
      // <<< THAY ĐỔI Ở ĐÂY >>>
      // Thay vì điều hướng về home, hãy gọi hàm đăng xuất và thông báo.
      // Điều này đảm bảo người dùng phải đăng nhập lại để nhận được bộ quyền mới.
      this.authService.logoutAndRedirect(
        `Access denied. Please re-login to continue.`
      );
      return false; // ❌ Không có quyền, chặn truy cập
    }
  }
}
