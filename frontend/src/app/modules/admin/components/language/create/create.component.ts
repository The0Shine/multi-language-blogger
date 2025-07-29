import { Component,OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-create-language',
    templateUrl: './create.component.html',
    standalone: true,
    imports: [FormsModule,CommonModule,ReactiveFormsModule],
    styleUrl: './create.component.css',

})

export class AdminLanguageCreateComponent implements OnInit {
    url = 'http://localhost:4000/api/v1/language/create';
    LanguageForm!: FormGroup;
    submitted = false;

    constructor(private http: HttpClient, private router: Router, private fb: FormBuilder) {}

    ngOnInit() {
      this.LanguageForm = this.fb.group({
      name: ['', Validators.required],
      locale:[ '', Validators.required],
      image: ['']

    });
    }

    get f() {
        return this.LanguageForm.controls;
      }

    saveLanguage() {
        this.submitted = true;

    if (this.LanguageForm.invalid) {
      return;
    }
    const body = this.LanguageForm.value;

        this.http.post(this.url, body).subscribe(
          (data: any) => {
            if (data) {
              this.router.navigate(['/administrator/language/list']);
            } else {
              alert('Tạo thất bại');
            }
          },
          (error) => {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi tạo ngôn ngữ');
          }
        );
      }

  }
