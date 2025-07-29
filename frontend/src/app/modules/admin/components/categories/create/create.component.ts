import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-category',
  templateUrl: './create.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrl: './create.component.css',
})
export class AdminCategorieCreateComponent implements OnInit {
  url = 'http://localhost:4000/api/v1/category/create';
  categoryForm!: FormGroup;
  submitted = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']

    });
  }

  get f() {
    return this.categoryForm.controls;
  }

  saveCategory() {
    this.submitted = true;

    if (this.categoryForm.invalid) {
      return;
    }

    const body = this.categoryForm.value;

    this.http.post(this.url, body).subscribe({
      next: (data: any) => {
        if (data) {
          this.router.navigate(['/administrator/category/list']);
        } else {
          alert('Tạo thất bại');
        }
      },
      error: (err) => {
        console.error('Lỗi:', err);
        alert('Có lỗi xảy ra khi tạo danh mục');
      },
    });
  }
}
