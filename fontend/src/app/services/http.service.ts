import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';

// Base API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Pagination metadata
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated data structure
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Paginated API Response
export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: PaginatedData<T>;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}api${endpoint}`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.errorHandler.showError({
            title: 'Request Failed',
            message:
              error.error?.message || 'An error occurred while fetching data',
            type: 'error',
          });
          return this.errorHandler.handleError(error);
        })
      );
  }

  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}api${endpoint}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.errorHandler.showError({
            title: 'Request Failed',
            message:
              error.error?.message || 'An error occurred while saving data',
            type: 'error',
          });
          return this.errorHandler.handleError(error);
        })
      );
  }

  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}api${endpoint}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.errorHandler.showError({
            title: 'Update Failed',
            message:
              error.error?.message || 'An error occurred while updating data',
            type: 'error',
          });
          return this.errorHandler.handleError(error);
        })
      );
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}api${endpoint}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.errorHandler.showError({
            title: 'Delete Failed',
            message:
              error.error?.message || 'An error occurred while deleting data',
            type: 'error',
          });
          return this.errorHandler.handleError(error);
        })
      );
  }
}
