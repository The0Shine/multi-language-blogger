import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private apiUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  // Admin: lấy danh sách user
  // user.service.ts
  getAllUsers(): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/admin/users`)
      .pipe(
        map((res) =>
          res.success && res.data && Array.isArray(res.data.data)
            ? res.data.data
            : []
        )
      );
  }

  // Owner hoặc Admin: xem profile
  getUserById(userid: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/users/${userid}`)
      .pipe(map((res) => res?.data?.data)); // Trả ra luôn object user
  }

  // Owner hoặc Admin: cập nhật thông tin
  updateUser(userid: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userid}`, user);
  }

  // Admin: đổi role
  updateUserRole(userid: number, roleId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/users/${userid}/role`, {
      roleId,
    });
  }

  // Admin: tạo user
  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/users`, user);
  }

  // Owner hoặc Admin: soft delete
  deleteUser(userid: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userid}`);
  }

  // Admin: hard delete
  hardDeleteUser(userid: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/users/${userid}`);
  }

  // Admin: thống kê user
  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/users/stats`);
  }

  // Admin: thống kê chi tiết user
  getDetailedUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/users/stats/detailed`);
  }

  // Admin: lấy danh sách role
  getAllRoles(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:4000/api/role/admin/roles`);
  }
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      map((res) => res?.data?.data) // trả về object user
    );
  }
}
