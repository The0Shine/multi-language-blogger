import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title?: string, duration?: number): void {
    const options = duration ? { timeOut: duration } : {};
    this.toastr.success(message, title || 'Success', options);
  }

  error(message: string, title?: string, duration?: number): void {
    const options = duration ? { timeOut: duration } : { timeOut: 7000 };
    this.toastr.error(message, title || 'Error', options);
  }

  warning(message: string, title?: string, duration?: number): void {
    const options = duration ? { timeOut: duration } : {};
    this.toastr.warning(message, title || 'Warning', options);
  }

  info(message: string, title?: string, duration?: number): void {
    const options = duration ? { timeOut: duration } : {};
    this.toastr.info(message, title || 'Info', options);
  }

  clearAll(): void {
    this.toastr.clear();
  }

  // Method to show confirmation dialog (replacement for confirm())
  confirm(message: string, title: string = 'Confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      // For now, we'll use the browser's confirm dialog
      // In a real app, you'd want to create a custom modal component
      const result = window.confirm(`${title}\n\n${message}`);
      resolve(result);
    });
  }
}
