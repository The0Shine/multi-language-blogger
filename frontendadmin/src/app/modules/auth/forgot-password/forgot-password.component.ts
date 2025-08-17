import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true, // nếu bạn muốn dùng standalone component
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  errorMessage: string = '';
   successMessage: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/) // Chỉ nhận @gmail.com
      ]]
    });
  }

  get email() {
    return this.forgotForm.get('email');
  }

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.errorMessage = 'Bạn đã nhập sai email hoặc email không tồn tại';
       this.successMessage = '';
      return;
    }

    this.errorMessage = '';
      this.successMessage = '';
    this.isLoading = true;

    this.http.post('http://localhost:4000/api/auth/forgot-password', {
      email: this.email?.value
    }).subscribe({
      next: () => {
        this.isLoading = false;

        this.successMessage = 'Thành công! Xin bạn hãy đợi trong giây lát...';

         setTimeout(() => {
        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.email?.value }
        });
         }, 5000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Email của bạn nhập hiện không tồn tại';
      }
    });
  }
}
