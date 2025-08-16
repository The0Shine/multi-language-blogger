import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpService } from './http.service';

// Backend response interface
interface BackendUser {
  userid: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
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
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  username?: string;
  status?: number;
}

export interface UsersResponse {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpService: HttpService) {}

  getUsers(page: number = 1, limit: number = 10): Observable<UserProfile[]> {
    const params = { page, limit };

    return this.httpService.get<any>('/users', params).pipe(
      map((response: any) => {
        const users: BackendUser[] = response.data.items;
        return users.map((user: BackendUser) => this.mapUserToFrontend(user));
      })
    );
  }

  getUser(id: number): Observable<UserProfile> {
    return this.httpService.get<any>(`/users/${id}`).pipe(
      map((response: any) => {
        const userData: BackendUser = response.data.user || response.data;
        return this.mapUserToFrontend(userData);
      })
    );
  }

  updateUser(id: number, userData: UpdateUserRequest): Observable<UserProfile> {
    return this.httpService.put<any>(`/users/${id}`, userData).pipe(
      map((response: any) => {
        const user: BackendUser = response.data.user || response.data;
        return this.mapUserToFrontend(user);
      })
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.httpService
      .delete<any>(`/users/${id}`)
      .pipe(map((response: any) => response.data));
  }

  getUserPosts(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Observable<any[]> {
    const params = { page, limit };

    return this.httpService.get<any>(`/users/${userId}/posts`, params).pipe(
      map((response: any) => {
        const posts: any[] = response.data.items;
        return posts;
      })
    );
  }

  updateProfile(profileData: UpdateUserRequest): Observable<UserProfile> {
    console.log('🔄 UserService: Updating profile via /users/profile endpoint');
    console.log('🔄 UserService: Profile data:', profileData);

    // Use /users/profile endpoint - no userid needed (gets from JWT token)
    return this.httpService.put<any>('/users/profile', profileData).pipe(
      map((response: any) => {
        console.log('✅ UserService: Profile update response:', response);
        // Handle nested response structure: { data: { data: actualUserData } }
        const userData: BackendUser =
          response.data.user || response.data.data || response.data;
        const mappedUser = this.mapUserToFrontend(userData);
        console.log('✅ UserService: Mapped user data:', mappedUser);
        return mappedUser;
      })
    );
  }

  deleteAccount(): Observable<any> {
    return this.httpService
      .delete<any>('/auth/profile')
      .pipe(map((response: any) => response.data));
  }

  private mapUserToFrontend(user: any): UserProfile {
    console.log(user);

    return {
      userid: user.userid,
      username: user.username,
      email: user.email || '',
      first_name: user.first_name,
      last_name: user.last_name,
      roleid: user.roleid,
      role: user.role
        ? {
            name: user.role.name,
            description: user.role.description,
          }
        : undefined,
      status: user.status,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at),
    };
  }
}
