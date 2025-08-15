import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { ApiResponse } from '../models/api-response.model';

export interface User {
  userid: number;
  username: string;
  first_name: string;
  last_name: string;
  roleid: number;
  role?: {
    name: string;
    description: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private httpService: HttpService, private router: Router) {
    // Check if user is already logged in
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getUserRole(): string {
    const user = this.currentUserSubject.value;
    if (!user) return '';

    // Check if role object exists
    if (user.role?.name) {
      return user.role.name.toLowerCase();
    }

    // Fallback to roleid mapping
    switch (user.roleid) {
      case 1:
        return 'user';
      case 2:
        return 'admin';
      default:
        return 'user';
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.httpService
      .post<ApiResponse>('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      })
      .pipe(
        map((response) => {
          // Handle backend response: {success, message, data: {accessToken, refreshToken, message}}
          const backendData = response.data as any;
          return {
            token: backendData.accessToken,
            refreshToken: backendData.refreshToken,
            user: {} as User, // Will be filled in tap
          } as AuthResponse;
        }),
        tap((authData) => {
          localStorage.setItem('accessToken', authData.token);
          if (authData.refreshToken) {
            localStorage.setItem('refreshToken', authData.refreshToken);
          }

          // Decode token to get user info
          if (authData.token) {
            try {
              const payload = JSON.parse(atob(authData.token.split('.')[1]));
              const user: User = {
                userid: payload.userid,
                roleid: payload.roleid,
                username: credentials.username,
                first_name: '',
                last_name: '',
              };
              localStorage.setItem('user', JSON.stringify(user));
              this.currentUserSubject.next(user);
            } catch (error) {
              console.error('Error decoding token:', error);
            }
          }

          if (credentials.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.httpService
      .post<AuthResponse>('/auth/register', {
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
      })
      .pipe(
        map((response) => response.data),
        tap((authData) => {
          localStorage.setItem('accessToken', authData.token);
          if (authData.refreshToken) {
            localStorage.setItem('refreshToken', authData.refreshToken);
          }
          localStorage.setItem('user', JSON.stringify(authData.user));
          this.currentUserSubject.next(authData.user);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getProfile(): Observable<User> {
    return this.httpService.get<User>('/auth/profile').pipe(
      map((response) => response.data),
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.httpService.put<User>('/auth/profile', userData).pipe(
      map((response) => response.data),
      tap((user) => {
        console.log(user);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  changePassword(passwordData: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Observable<any> {
    return this.httpService
      .put('/auth/change-password', passwordData)
      .pipe(map((response) => response.data));
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.httpService
      .post<AuthResponse>('/auth/refresh-token', { refreshToken })
      .pipe(
        map((response) => response.data),
        tap((authData) => {
          localStorage.setItem('accessToken', authData.token);
          if (authData.refreshToken) {
            localStorage.setItem('refreshToken', authData.refreshToken);
          }
          // User data should remain the same, no need to update
        })
      );
  }

  hasValidRefreshToken(): boolean {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log(
      'Checking refresh token:',
      refreshToken ? 'exists' : 'not found'
    );
    return !!refreshToken;
  }

  updateCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Utility methods for password validation (kept for frontend validation)
  validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    return errors;
  }

  getPasswordStrength(password: string): {
    strength: number;
    label: string;
    color: string;
  } {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

    return {
      strength: (strength / 5) * 100,
      label: labels[Math.min(strength, 4)],
      color: colors[Math.min(strength, 4)],
    };
  }
}
