import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      resetCode: ['', [
        Validators.required,
        Validators.pattern(/^\d{6}$/) // Mã 6 số
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  get email() {
    return this.resetForm.get('email');
  }

  get resetCode() {
    return this.resetForm.get('resetCode');
  }

  get newPassword() {
    return this.resetForm.get('newPassword');
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin hợp lệ';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.http.post('http://localhost:4000/api/auth/reset-password', {
      email: this.email?.value,
      resetCode: this.resetCode?.value,
      newPassword: this.newPassword?.value
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage =  'Bạn đã đổi mật khẩu thành công. Hãy chờ trong giây lát...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Đã xảy ra lỗi kiểm tra lại thông tin nhập';
      }
    });
  }
}
