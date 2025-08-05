import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private apiUrl = 'http://localhost:3000/posts'; // API backend giả

  constructor(private http: HttpClient) {}

  // Lấy danh sách bài viết
  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Lấy bài viết mới nhất
  getRecentPosts(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?_sort=postid&_order=desc&_limit=${limit}`);
  }

  // Thêm bài viết mới
  addPost(post: any): Observable<any> {
    if (post.status === undefined || post.status === null) {
      post.status = 0; // Pending review
    }
    post.createdAt = new Date().toISOString();
    return this.http.post(this.apiUrl, post);
  }

 deletePost(id: number): Observable<any> {
  return this.http.delete(`http://localhost:3000/posts/${id}`);
}

updatePost(post: any): Observable<any> {
  return this.http.put(`http://localhost:3000/posts/${post.id}`, post);
}

getPostById(id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/${id}`);
}


}
