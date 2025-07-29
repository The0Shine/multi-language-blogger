import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-admin-role-update',
    templateUrl: './update.component.html',
    standalone: true,
    imports: [FormsModule, CommonModule,ReactiveFormsModule],
    styleUrl: './update.component.css',
})
export class AdminRoleUpdateComponent implements OnInit {
    roleForm!: FormGroup;
    submitted = false;
    id!: string;


    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.id = this.route.snapshot.params['id'];

        this.roleForm = this.fb.group({
          name: ['', Validators.required],
          status: [1],
        });

        this.loadRole();
    }

    get f() {
        return this.roleForm.controls;
      }


    loadRole() {
        this.http.get<any>(`http://localhost:4000/api/v1/role/${this.id}`).subscribe({
            next: (res) => {
              const data = res.data;
              console.log('Dữ liệu role:', data);
              this.roleForm.patchValue({
                name: data.name,
              });
            },
            error: (err) => {
              console.error('Lỗi khi load role:', err);
            },
          });
        }

        saveRole() {
          this.submitted = true;

          if (this.roleForm.invalid) {
            return;
          }

          this.http.put(`http://localhost:4000/api/v1/role/${this.id}`, this.roleForm.value).subscribe({
            next: () => {
              alert('Cập nhật thành công!');
              this.router.navigate(['/administrator/role/list']);
            },
            error: (err) => {
              console.error('Lỗi khi cập nhật:', err);
              alert('Cập nhật thất bại!');
            },
          });
        }
      }
