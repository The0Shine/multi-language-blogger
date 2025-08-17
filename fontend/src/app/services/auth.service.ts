import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { ApiResponse } from '../models/api-response.model';

export interface User {
  userid: number;
  username: string;
  email: string;
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
  email: string;
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
                email: payload.email || '',
                first_name: payload.first_name || '',
                last_name: payload.last_name || '',
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
        email: userData.email,
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

  clearSession(): void {
    // Clear session without redirecting (for login preparation)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getProfile(): Observable<User> {
    console.log(
      '🔄 AuthService: Getting current user profile via /users/profile'
    );

    return this.httpService.get<any>('/users/profile').pipe(
      map((response) => {
        console.log('🔍 AuthService: Raw API response:', response);
        // API returns nested structure: { data: { data: actualUserData } }
        return response.data.data;
      }),
      tap((user) => {
        console.log('✅ AuthService: Profile fetched successfully:', user);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    console.log('🔄 AuthService: Updating profile via /users endpoint');

    // Get current user ID from localStorage
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const userid = currentUser?.userid;

    if (!userid) {
      console.error('🔄 AuthService: No userid found for profile update');
      throw new Error('User ID not found. Please login again.');
    }

    console.log('🔄 AuthService: Updating profile for userid:', userid);
    console.log('🔄 AuthService: Update data:', userData);

    return this.httpService.put<any>(`/users/${userid}`, userData).pipe(
      map((response) => {
        console.log('🔍 AuthService: Raw update response:', response);
        // API returns nested structure: { data: { data: actualUserData } }
        return response.data.user || response.data.data || response.data;
      }),
      tap((user) => {
        console.log('✅ AuthService: Profile updated successfully:', user);
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

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.httpService
      .post<any>('/auth/refresh-token', { refreshToken })
      .pipe(
        map((response) => {
          console.log('🔄 Refresh token response:', response);
          // Backend returns: { success: true, data: { message: "...", accessToken: "..." } }
          return {
            token: response.data.accessToken,
            refreshToken: refreshToken, // Keep existing refresh token
          };
        }),
        tap((authData) => {
          console.log('✅ Refresh token successful, updating localStorage');
          localStorage.setItem('accessToken', authData.token);
          // Keep existing refresh token
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
  forgotPassword(email: string): Observable<any> {
    return this.httpService.post('/auth/forgot-password', { email });
  }

  // Reset password
  resetPassword(
    email: string,
    resetCode: string,
    newPassword: string
  ): Observable<any> {
    return this.httpService.post('/auth/reset-password', {
      email,
      resetCode,
      newPassword,
    });
  }
}
