import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private loggedIn = false;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(users => {
        const user = users.find(u =>
          u.username === username && (u.password ? u.password === password : true)
        );

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.loggedIn = true;
          return true;
        } else {
          this.loggedIn = false;
          return false;
        }
      })
    );
  }

  isLoggedIn(): boolean {
    if (!this.loggedIn) {
      this.loggedIn = !!localStorage.getItem('user');
    }
    return this.loggedIn;
  }

  logout(): void {
    localStorage.removeItem('user');
    this.loggedIn = false;
    this.router.navigate(['/login']);
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
