import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-admin-category-update',
    templateUrl: './update.component.html',
    standalone: true,
    imports: [FormsModule, CommonModule,ReactiveFormsModule],
    styleUrl: './update.component.css',
})
export class AdminCategoriesUpdateComponent implements OnInit {
    categoryForm!: FormGroup;
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

        this.categoryForm = this.fb.group({
          name: ['', Validators.required],
          description: ['', Validators.required],
          status: [1],
        });

        this.loadCategory();
    }

    get f() {
        return this.categoryForm.controls;
      }


    loadCategory() {
        this.http.get<any>(`http://localhost:4000/api/v1/category/${this.id}`).subscribe({
            next: (res) => {
              const data = res.data;
              console.log('Dữ liệu user:', data);
              this.categoryForm.patchValue({
                name: data.name,
                description: data.description,
              });
            },
            error: (err) => {
              console.error('Lỗi khi load category:', err);
            },
          });
        }

        saveCategory() {
          this.submitted = true;

          if (this.categoryForm.invalid) {
            return;
          }

          this.http.put(`http://localhost:4000/api/v1/category/${this.id}`, this.categoryForm.value).subscribe({
            next: () => {
              alert('Cập nhật thành công!');
              this.router.navigate(['/administrator/category/list']);
            },
            error: (err) => {
              console.error('Lỗi khi cập nhật:', err);
              alert('Cập nhật thất bại!');
            },
          });
        }
      }
