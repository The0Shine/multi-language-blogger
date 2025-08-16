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
  const currentUrl = state.url;

  console.log(
    '🔍 Redirect Guard - Role:',
    userRole,
    'Current URL:',
    currentUrl
  );

  // Check if user is already on the correct page
  if (userRole === 'admin') {
    if (currentUrl.startsWith('/admin')) {
      return true; // Allow access to admin pages
    } else {
      router.navigate(['/admin/home']);
      return false;
    }
  } else {
    if (currentUrl.startsWith('/admin')) {
      router.navigate(['/']); // Redirect non-admin away from admin pages
      return false;
    } else {
      return true; // Allow access to user pages
    }
  }
};
