import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminPostService {
  private apiUrl = 'http://localhost:4000/api/posts';

  constructor(private http: HttpClient) {}

  // Lấy tất cả bài post (Admin) - bao gồm pending/rejected
  getAllPosts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/all`);
  }

  getPostById(postId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${postId}`);
  }

  // Tạo bài post (User)
  create(postData: any): Observable<any> {
    return this.http.post(this.apiUrl, postData);
  }

  // Duyệt bài post (Admin)
  acceptPost(postId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${postId}/accept`, {});
  }

  // Từ chối bài post (Admin)
  rejectPost(postId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${postId}/reject`, {});
  }

  // Xóa bài post (Admin)
  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  // Upload file cho bài post (User/Admin)
  upload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }
  addPost(postData: any) {
    return this.http.post<{ data: any }>(`${this.apiUrl}/posts`, postData);
  }
}
