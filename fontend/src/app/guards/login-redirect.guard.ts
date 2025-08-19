import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    const userRole = authService.getUserRole();

    console.log(
      '🔍 Login Redirect Guard - User already authenticated, role:',
      userRole
    );

    // Redirect dựa trên role của user
    if (userRole === 'admin') {
      router.navigate(['/admin/home']);
    } else {
      router.navigate(['/']);
    }

    return false; // Ngăn truy cập vào login
  }

  // Nếu chưa đăng nhập thì cho phép truy cập login
  return true;
};
