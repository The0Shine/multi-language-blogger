import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl =
    'https://nodejs-core-backend-hvlfihn4a-the-shines-projects.vercel.app/api/posts';

  constructor(private http: HttpClient) {}

  // Lấy tất cả bài post (Admin)

  getAllPosts(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/all`, { params });
  }

  getPostById(postId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${postId}`);
  }

  // Tạo bài post (User)
  create(postData: any): Observable<any> {
    // Giữ nguyên, hàm này đã đúng
    return this.http.post(this.apiUrl, postData);
  }

  // Duyệt bài post (Admin)
  acceptPost(postId: number): Observable<any> {
    // SỬA LẠI: Backend dùng 'approve' chứ không phải 'accept'
    return this.http.patch(`${this.apiUrl}/${postId}/approve`, {});
  }

  // Từ chối bài post (Admin)
  rejectPost(postId: number): Observable<any> {
    // Giữ nguyên, hàm này đã đúng
    return this.http.patch(`${this.apiUrl}/${postId}/reject`, {});
  }

  // Xóa bài post (Admin)
  deletePost(postId: number): Observable<any> {
    // Giữ nguyên, hàm này đã đúng
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }

  // Upload file cho bài post (User/Admin)
  upload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // SỬA LẠI: URL upload thường là một endpoint riêng, không nằm trong /posts
    return this.http.post(
      'https://nodejs-core-backend-hvlfihn4a-the-shines-projects.vercel.app/api/upload',
      formData
    );
  }

  // XÓA BỎ: Hàm addPost bị thừa và sai URL, dùng hàm create() ở trên
}
