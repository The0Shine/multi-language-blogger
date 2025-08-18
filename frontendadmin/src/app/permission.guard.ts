
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './modules/auth/auth.service'; // Chỉnh lại đường dẫn nếu cần

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    // Lấy ra quyền yêu cầu được định nghĩa trong 'data' của route
    const requiredPermission = route.data['permission'];

    // Nếu route không yêu cầu quyền gì cả, cho qua
    if (!requiredPermission) {
      return true;
    }

    // Dùng hàm hasPermission mà chúng ta đã hoàn thiện trong AuthService
    if (this.authService.hasPermission(requiredPermission)) {
      return true; // ✅ Có quyền, cho phép truy cập
    } else {
      // ❌ Không có quyền, điều hướng về trang chủ admin hoặc trang báo lỗi
      console.error(`Access Denied: User does not have the required permission: '${requiredPermission}'`);
      this.router.navigate(['/admin/home']); // Hoặc bạn có thể tạo trang '/unauthorized'
      return false;
    }
  }
}
