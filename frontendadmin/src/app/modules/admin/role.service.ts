import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Định nghĩa interface Role theo cấu trúc backend trả về
export interface Role {
  roleid: number;
  name: string;
  status: number;
  discription: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Permission {
  permissionid: number;
  description: string;
}

// Định nghĩa interface cho response của API lấy roles
interface RoleApiResponse {
  success: boolean;
  data: {
    message: string;
    data: Role[];
  };
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private baseUrl = 'https://multi-language-blogger.onrender.com/api/roles';
  private adminUrl = `${this.baseUrl}/admin/roles`;

  constructor(private http: HttpClient) {}

  // Lấy danh sách roles (trả về đúng interface RoleApiResponse)
  getRoles(): Observable<RoleApiResponse> {
    return this.http.get<RoleApiResponse>(this.adminUrl);
  }

  // Lấy 1 role theo ID (giả sử backend trả về object role)
  getRoleById(
    roleid: number
  ): Observable<{ success: boolean; data: { data: Role } }> {
    return this.http.get<{ success: boolean; data: { data: Role } }>(
      `${this.adminUrl}/${roleid}`
    );
  }

  // Tạo role mới
  createRole(
    role: Partial<Role> & { permissionid?: number[] }
  ): Observable<{ success: boolean; data: { data: Role } }> {
    return this.http.post<{ success: boolean; data: { data: Role } }>(
      this.adminUrl,
      role
    );
  }

  // Cập nhật role
  updateRole(
    roleid: number,
    role: Partial<Role> & { permissionid?: number[] }
  ): Observable<{ success: boolean; data: { data: Role } }> {
    return this.http.put<{ success: boolean; data: { data: Role } }>(
      `${this.adminUrl}/${roleid}`,
      role
    );
  }

  // Soft delete role
  deleteRole(
    roleid: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.adminUrl}/${roleid}`
    );
  }

  // Hard delete role
  permanentDeleteRole(
    roleid: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.adminUrl}/${roleid}/hard`
    );
  }

  // Khôi phục role
  restoreRole(
    roleid: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.adminUrl}/${roleid}/restore`,
      {}
    );
  }
}
