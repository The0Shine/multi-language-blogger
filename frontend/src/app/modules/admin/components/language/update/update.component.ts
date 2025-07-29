import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-admin-language-update',
    templateUrl: './update.component.html',
    standalone: true,
    imports: [FormsModule, CommonModule,ReactiveFormsModule],
    styleUrl: './update.component.css',
})
export class AdminLanguageUpdateComponent implements OnInit {
    languageForm!: FormGroup;
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

        this.languageForm = this.fb.group({
          name: ['', Validators.required],
          locale: ['', Validators.required],
          image: [''],
          status: [1],
        });

        this.loadLanguage();
    }

    get f() {
        return this.languageForm.controls;
      }


    loadLanguage() {
        this.http.get<any>(`http://localhost:4000/api/v1/language/${this.id}`).subscribe({
            next: (res) => {
              const data = res.data;
              console.log('Dữ liệu language:', data);
              this.languageForm.patchValue({
                name: data.name,
                locale: data.locale,
                image: data.image,
              });
            },
            error: (err) => {
              console.error('Lỗi khi load language:', err);
            },
          });
        }

        saveLanguage() {
          this.submitted = true;

          if (this.languageForm.invalid) {
            return;
          }

          this.http.put(`http://localhost:4000/api/v1/language/${this.id}`, this.languageForm.value).subscribe({
            next: () => {
              alert('Cập nhật thành công!');
              this.router.navigate(['/administrator/language/list']);
            },
            error: (err) => {
              console.error('Lỗi khi cập nhật:', err);
              alert('Cập nhật thất bại!');
            },
          });
        }
      }
