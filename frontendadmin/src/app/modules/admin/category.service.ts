import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = 'http://localhost:4000/api/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<{ success: boolean; data: { message: string; data: any[] } }> {
    return this.http.get<{ success: boolean; data: { message: string; data: any[] } }>(this.apiUrl);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, category);
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateCategory(id: number, category: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    // Chỉ giữ lại hàm này, nó đã gọi đúng API
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ ĐÃ XÓA BỎ HÀM permanentDeleteCategory()
}
