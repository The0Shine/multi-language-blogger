import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // <<< Thêm import Router

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {} // <<< Inject router vào constructor luôn

  login(email: string, password: string) {
    return this.http.post('http://localhost:4000/api/v1/auth/login', { email, password });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // <<< Lúc này this.router đã tồn tại
  }
}
