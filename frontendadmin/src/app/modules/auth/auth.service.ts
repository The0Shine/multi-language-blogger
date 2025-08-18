import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';


  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((res) => {
        if (res && res.success && res.data?.accessToken) {
          this.saveTokensAndUser(res.data.accessToken, res.data.refreshToken);
        }
      })
    );
  }

  // Hàm refreshToken bây giờ rất đơn giản, chỉ gọi API
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  hasPermission(permissionName: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    if (user.roleName === 'admin') return true;
    if (!user.permissions || !Array.isArray(user.permissions)) return false;
    return user.permissions.includes(permissionName);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Hàm này là public để Interceptor có thể gọi
  public saveTokensAndUser(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('accessToken', accessToken);

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    try {
      const decoded: any = jwt_decode(accessToken);
      const user = {
        userid: decoded.userid,
        roleid: decoded.roleid,
        username: decoded.username,
        roleName: decoded.roleName,
        permissions: decoded.permissions || []
      };
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error("Failed to decode token", error);
      this.logout();
    }
  }
}
