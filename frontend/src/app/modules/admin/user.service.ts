import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
 private apiUrl = 'http://localhost:3000/users'; // API giả, sau đổi thành backend thật

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserById(userid: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userid}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  updateUser(userid: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userid}`, user);
  }

  deleteUser(userid: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userid}`);
  }
}
