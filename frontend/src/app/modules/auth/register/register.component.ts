import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RoleService } from '../../admin/role.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  errorMessage: string | null = null;

  roles: any[] = []; // ← sẽ lấy từ API

  statuses = [
    { value: 1, label: 'Active' },
    { value: 0, label: 'Inactive' },
  ];

  private apiUrl = 'http://localhost:3000/users';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private roleService: RoleService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role_id: ['', Validators.required],
      status: ['', Validators.required],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    this.errorMessage = null;
  }

  private passwordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe((data) => (this.roles = data));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const {
      firstName,
      lastName,
      email,
      role_id,
      username,
      password,
      confirmPassword,
      status,
    } = this.registerForm.value;

    if (!this.passwordsMatch(password, confirmPassword)) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // ✅ Kiểm tra username trùng
    this.http.get<any[]>(this.apiUrl).subscribe((users) => {
      if (users.some((u) => u.username === username)) {
        this.errorMessage = 'Username already exists';
        return;
      }

      // ✅ Tạo user object đúng format db.json
      const newUser = {
        roleid: Number(role_id),
        first_name: firstName,
        last_name: lastName,
        username,
        password,
        status: Number(status),
        extra_info: email,
        created_at: new Date().toISOString(), // 👈 Thêm thời gian tạo
      };

      // ✅ Lưu user vào db.json
      this.http.post(this.apiUrl, newUser).subscribe(() => {
        alert('Bạn đã tạo tài khoản thành công!');
        this.router.navigate(['/login']);
      });
    });
  }
}
