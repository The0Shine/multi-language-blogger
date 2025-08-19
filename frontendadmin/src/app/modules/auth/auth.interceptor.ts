import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = this.addToken(req, token);
    }

    return next.handle(req).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          // Xử lý khi token hết hạn
          if (error.status === 401) {
            return this.handle401Error(req, next);
          }

          // <<< THÊM MỚI: Xử lý khi không có quyền >>>
          else if (error.status === 403) {
            // Gọi hàm đăng xuất và hiển thị thông báo mà chúng ta đã tạo
            this.authService.logoutAndRedirect('Your permissions may have changed. Please log in again.');
          }
        }

        // Trả về các lỗi khác (ví dụ: 500 Internal Server Error)
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;

          if (res && res.success && res.data?.accessToken) {
            const newToken = res.data.accessToken;
            this.authService.saveTokensAndUser(newToken); // Giả sử bạn có hàm này
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addToken(request, newToken));
          }

          // Nếu refresh thất bại, đăng xuất
          this.authService.logoutAndRedirect('Your session has expired. Please log in again.');
          return throwError(() => new Error('Refresh token failed.'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Đảm bảo đăng xuất nếu có lỗi trong quá trình refresh
          this.authService.logoutAndRedirect('Your session has expired. Please log in again.');
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => next.handle(this.addToken(request, jwt)))
      );
    }
  }
}
