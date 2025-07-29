import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-create-role',
    templateUrl: './create.component.html',
    standalone: true,
    imports: [FormsModule,CommonModule,ReactiveFormsModule],
    styleUrl: './create.component.css',

})

export class AdminRoleCreateComponent implements OnInit {
    url = 'http://localhost:4000/api/v1/role/create';
    roleForm!: FormGroup;
    submitted = false;

    constructor(private http: HttpClient,
                    private router: Router,
                    private fb: FormBuilder) {}

    ngOnInit() {
      this.roleForm = this.fb.group({
      name: ['', Validators.required],
    });
}
get f() {
    return this.roleForm.controls;
  }

    saveRole() {
        this.submitted = true;

        if (this.roleForm.invalid) {
          return;
        }

      const body =  this.roleForm.value;

      this.http.post(this.url, body).subscribe(
          (data: any) => {
            if(data){
              this.router.navigate(['/administrator/role/list'])
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
