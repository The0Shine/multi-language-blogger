import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = 'http://localhost:3000/roles'; // API giả, sau này đổi thành API thật

  constructor(private http: HttpClient) {}

  // Lấy danh sách roles
  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Lấy 1 role theo ID
  getRoleById(roleid: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roleid}`);
  }

  // Tạo role mới
  createRole(role: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, role);
  }

  // Cập nhật role
  updateRole(roleid: number, role: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${roleid}`, role);
  }

  // Xóa role
  deleteRole(roleid: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${roleid}`);
  }
}
