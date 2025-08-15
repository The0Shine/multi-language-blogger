import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('🔥 Admin Auth Interceptor called for:', req.url);

    let authReq = req;
    const token = this.authService.getToken();

    console.log(
      '🔥 Admin token:',
      token ? `${token.substring(0, 20)}...` : 'null'
    );

    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      console.log('🔥 Admin Authorization header added');
    }
    if (req.url.includes('/login')) {
      // Không gắn Authorization header khi gọi API login
      return next.handle(req);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;
          return this.authService.refreshToken().pipe(
            switchMap((res) => {
              this.isRefreshing = false;
              const newToken = res.data?.accessToken;
              if (newToken) {
                localStorage.setItem('accessToken', newToken);
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });
                return next.handle(retryReq);
              }
              return throwError(() => error);
            }),
            catchError((refreshErr) => {
              this.isRefreshing = false;
              this.authService.logout();
              return throwError(() => refreshErr);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
