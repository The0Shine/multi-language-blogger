import type {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔥 Main Auth Interceptor called for:', req.url);

  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');

  console.log(
    '🔥 AccessToken from localStorage:',
    token ? `${token.substring(0, 20)}...` : 'null'
  );

  // Clone request and add Authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(
      'Authorization header added:',
      authReq.headers.get('Authorization')
    );
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('HTTP Error:', error.status, error.message);

      // Handle 401 Unauthorized errors
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        // Check if we have a refresh token
        if (authService.hasValidRefreshToken()) {
          console.log('Attempting to refresh token...');

          return authService.refreshToken().pipe(
            switchMap((authData) => {
              isRefreshing = false;
              console.log('Token refreshed successfully:', authData);

              // Retry the original request with new token
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${authData.token}`,
                },
              });

              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              console.log('Token refresh failed:', refreshError);

              // Refresh failed, logout user
              authService.logout();
              router.navigate(['/login']);

              return throwError(() => refreshError);
            })
          );
        } else {
          isRefreshing = false;
          console.log('No refresh token available, logging out...');

          // No refresh token, logout user
          authService.logout();
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
