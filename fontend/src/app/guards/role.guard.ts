import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if user is authenticated
    if (!authService.isAuthenticated) {
      router.navigate(['/login']);
      return false;
    }

    // Get user role
    const userRole = authService.getUserRole();

    // Check if user has required role
    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Redirect based on user role
    if (userRole === 'admin') {
      router.navigate(['/admin/home']);
    } else {
      router.navigate(['/']);
    }

    return false;
  };
};

// Specific guards for convenience
export const adminGuard: CanActivateFn = roleGuard(['admin']);
export const userGuard: CanActivateFn = roleGuard(['user']);
export const adminOrUserGuard: CanActivateFn = roleGuard(['admin', 'user']);
