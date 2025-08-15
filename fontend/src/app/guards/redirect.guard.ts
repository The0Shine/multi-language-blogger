import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const redirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If not authenticated, go to login
  if (!authService.isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }

  // Get user role
  const userRole = authService.getUserRole();

  // Redirect based on role
  if (userRole === 'admin') {
    router.navigate(['/admin/home']);
    return false;
  } else {
    router.navigate(['/']);
    return false;
  }
};
