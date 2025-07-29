import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-create-user',
    templateUrl: './create.component.html',
    standalone: true,
    imports: [FormsModule, CommonModule, ReactiveFormsModule],
    styleUrl: './create.component.css',
})
export class AdminUserCreateComponent implements OnInit {
    url = 'http://localhost:4000/api/v1/user/create';
    userForm!: FormGroup;
    submitted = false;
    roles: any[] = [];
    previewImage: string | null = null;

    constructor(
        private http: HttpClient,
        private router: Router,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.userForm = this.fb.group({
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            role_id: ['', Validators.required],
            avatar: [''],
        });
        this.getRoles(); // gọi API lấy danh sách role
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
    saveUser() {
        this.submitted = true;

        if (this.userForm.invalid) {
            return;
        }

        const body = this.userForm.value;

        this.http.post(this.url, body).subscribe(
            (data: any) => {
                if (data) {
                    this.router.navigate(['/administrator/user/list']);
                } else {
                    alert('Tạo thất bại');
                }
            },
            (error) => {
                console.error('Lỗi:', error);
                alert('Có lỗi xảy ra khi tạo User');
            }
        );
    }
   onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            this.previewImage = result;
            this.userForm.patchValue({ avatar: result });  // ĐÚNG: sau khi load xong
        };
        reader.readAsDataURL(file);
    }
}


    previewAvatar() {
        const url = this.userForm.value.avatar;
        this.previewImage = url;
    }
}
