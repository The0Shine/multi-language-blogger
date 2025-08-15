import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ToastService } from './toast.service';

export interface ErrorMessage {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private toastService: ToastService) {}
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: ErrorMessage;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = {
        title: 'Network Error',
        message: 'Please check your internet connection and try again.',
        type: 'error',
      };
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = {
            title: 'Bad Request',
            message:
              error.error?.message ||
              'Invalid request. Please check your input.',
            type: 'warning',
          };
          break;
        case 401:
          errorMessage = {
            title: 'Unauthorized',
            message: 'Please log in to continue.',
            type: 'warning',
          };
          break;
        case 403:
          errorMessage = {
            title: 'Forbidden',
            message: 'You do not have permission to perform this action.',
            type: 'error',
          };
          break;
        case 404:
          errorMessage = {
            title: 'Not Found',
            message: 'The requested resource was not found.',
            type: 'warning',
          };
          break;
        case 422:
          errorMessage = {
            title: 'Validation Error',
            message: this.extractValidationErrors(error.error),
            type: 'warning',
          };
          break;
        case 500:
          errorMessage = {
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again later.',
            type: 'error',
          };
          break;
        default:
          errorMessage = {
            title: 'Unknown Error',
            message: 'An unexpected error occurred. Please try again.',
            type: 'error',
          };
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => errorMessage);
  }

  private extractValidationErrors(errorResponse: any): string {
    if (errorResponse?.errors) {
      const errors = Object.values(errorResponse.errors).flat();
      return errors.join(', ');
    }
    return errorResponse?.message || 'Validation failed';
  }

  showError(error: ErrorMessage): void {
    this.toastService.error(error.message, error.title);
  }

  showSuccess(message: string, title?: string): void {
    this.toastService.success(message, title);
  }

  showWarning(message: string, title?: string): void {
    this.toastService.warning(message, title);
  }

  showInfo(message: string, title?: string): void {
    this.toastService.info(message, title);
  }
}
