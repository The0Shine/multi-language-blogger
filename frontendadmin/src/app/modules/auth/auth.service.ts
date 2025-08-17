import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import jwt_decode from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth'; // BE port 4000
  private loggedIn = false;

  constructor(private http: HttpClient, private router: Router) {}

login(username: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
    tap((res) => {
      if (res && res.success && res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);

        // Giải mã token lấy thông tin user
        const decoded: any = jwt_decode(res.data.accessToken);

        const user = {
          userid: decoded.userid || decoded.userId || decoded.id,
          roleid: decoded.roleid || decoded.role_id || decoded.role,
          username: username,  // Lưu username từ form login truyền vào
        };

        localStorage.setItem('user', JSON.stringify(user));
        this.loggedIn = true;
      }
    })
  );
}

  isLoggedIn(): boolean {
    if (!this.loggedIn) {
      this.loggedIn = !!localStorage.getItem('accessToken');
    }
    return this.loggedIn;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');  // xóa luôn user khi logout
    this.loggedIn = false;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  refreshToken(): Observable<any> {
  const refreshToken = localStorage.getItem('refreshToken');
  return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
    tap((res) => {
      if (res && res.success && res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
    })
  );
}

}
