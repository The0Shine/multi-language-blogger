import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-user-update',
  templateUrl: './update.component.html',
  styleUrl: './update.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AdminUserUpdateComponent implements OnInit {
  userForm!: FormGroup;
  submitted = false;
  id!: string;
  roles: any[] = [];
  avatarPreview: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role_id: [null, Validators.required],
  avatar: [''], // ✅ thêm dòng này để dùng input text
      status: [1],
    });

    this.loadUser();
    this.getRoles();
  }

  get f() {
    return this.userForm.controls;
  }

  getRoles() {
    this.http
      .get<any>('http://localhost:4000/api/v1/role/list')
      .subscribe((res) => {
        this.roles = res.data || [];
      });
  }

  loadUser() {
  this.http.get<any>(`http://localhost:4000/api/v1/user/${this.id}`).subscribe({
    next: (res) => {
      const data = res.data;

      this.userForm.patchValue({
        username: data.username,
        email: data.email,
        password: data.password,
        role_id: +data.role_id,
        status: data.status,


        // ❌ Không patch avatar nếu không cần dùng giá trị này từ form
      });

      // ✅ Sau cùng, xử lý avatarPreview
    if (data.avatar && typeof data.avatar === 'string') {
  this.avatarPreview =
    data.avatar.startsWith('http') || data.avatar.startsWith('data:image')
      ? data.avatar
      : `http://localhost:4000${data.avatar.startsWith('/') ? '' : '/'}${data.avatar}`;
} else {
  this.avatarPreview = 'assets/images/default-avatar.png';
}


    },
    error: (err) => {
      console.error('Lỗi khi load user:', err);
    },

  });
}



  onAvatarFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}


 onAvatarLinkChange() {
  const value = this.userForm.value.avatar;
  this.avatarPreview = value.startsWith('http') || value.startsWith('data:image')
    ? value
    : 'http://localhost:4000/' + value;
}

 saveUser() {
  this.submitted = true;
  if (this.userForm.invalid) return;


  const formData = new FormData();
  formData.append('username', this.userForm.get('username')?.value);
  formData.append('email', this.userForm.get('email')?.value);
  formData.append('password', this.userForm.get('password')?.value);
  formData.append('role_id', this.userForm.get('role_id')?.value);
  formData.append('status', this.userForm.get('status')?.value);

  const avatarInput = document.getElementById('avatar') as HTMLInputElement;


  if (avatarInput?.files?.length) {
    // Gửi file
    formData.append('avatar', avatarInput.files[0]);
  } else {
    // Nếu không upload file, kiểm tra nếu có dán link
    const avatarLink = this.userForm.get('avatar')?.value;
    if (avatarLink) {
      formData.append('avatar', avatarLink); // Gửi link như text field
    }
  }

  this.http
    .put(`http://localhost:4000/api/v1/user/${this.id}`, formData)
    .subscribe({
      next: (res: any) => {
        alert('Cập nhật avatar thành công!');
        this.router.navigate(['/administrator/user/list']);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật:', err);
        alert('Lỗi cập nhật!');
      },
    });

}



onAvatarError(event: any) {
  event.target.src = 'assets/images/default-avatar.png';
}

}
