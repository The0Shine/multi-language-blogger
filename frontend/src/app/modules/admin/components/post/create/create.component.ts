import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';

@Component({
  selector: 'app-create-post',
  templateUrl: './create.component.html',
  standalone: true,
  styleUrl: './create.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxEditorModule]
})
export class AdminPostCreateComponent implements OnInit, OnDestroy {
  postForm!: FormGroup;
  submitted = false;
  selectedFile: File | null = null;

  categoryList: any[] = [];
  languageList: any[] = [];
  currentUser: any = {};
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
  ];
  imageUrl: string = '';
previewImage: string | ArrayBuffer | null = null;

  url = 'http://localhost:4000/api/v1/post/create';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  }

  ngOnInit(): void {
    this.editor = new Editor();

    // Khởi tạo form
    this.postForm = this.fb.group({
      language_id: ['', Validators.required],
      category_id: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      content: ['', Validators.required],
      status: [1, Validators.required],
      avatar: ['',Validators.required] // thêm dòng này,
    });

    // Gọi API
    this.http.get('http://localhost:4000/api/v1/category/list').subscribe((res: any) => {
      this.categoryList = res.data;
    });

    this.http.get('http://localhost:4000/api/v1/language/list').subscribe((res: any) => {
      this.languageList = res.data;
    });
    const userData = localStorage.getItem('user');
       if (userData) {
       this.currentUser = JSON.parse(userData);
       this.postForm.patchValue({ user_id: this.currentUser.id });
}


  }


  ngOnDestroy(): void {
    this.editor.destroy();
  }

  get f() {
    return this.postForm.controls;
  }




  savePost() {
  this.submitted = true;

  // ✅ Nếu avatar đang trống, nhưng bạn có imageUrl hợp lệ, thì patch lại
  if (!this.postForm.get('avatar')?.value && this.imageUrl?.trim()) {
    this.postForm.patchValue({ avatar: this.imageUrl });
  }

  if (this.postForm.invalid) return;

  const raw = this.postForm.value;

  const formData = new FormData();
  formData.append('user_id', this.currentUser.id);
  formData.append('category_id', raw.category_id);
  formData.append('status', raw.status);

  if (this.selectedFile) {
    formData.append('avatar', this.selectedFile);
  } else {
    formData.append('avatar', this.imageUrl);
  }

  formData.append('translate', JSON.stringify([
    {
      language_id: raw.language_id,
      title: raw.title,
      description: raw.description,
      content: raw.content,
    }
  ]));

  this.http.post(this.url, formData).subscribe({
    next: (res: any) => {
      alert('Tạo bài viết thành công!');
      this.router.navigate(['/administrator/post/list']);
    },
    error: (err) => {
      console.error('Lỗi tạo bài viết:', err);
      alert('Tạo bài viết thất bại!');
    },
  });
}






onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.previewImage = URL.createObjectURL(file);
    this.imageUrl = ''; // Reset link nếu chọn file
    this.postForm.patchValue({ avatar: file });
  }
}
onImageUrlChange() {
  if (this.imageUrl?.trim()) {
    this.selectedFile = null;
    this.previewImage = this.imageUrl.trim(); // ✅ loại bỏ khoảng trắng
    this.postForm.patchValue({ avatar: this.imageUrl.trim() }); // ✅ Gán đúng link
    this.postForm.get('avatar')?.setErrors(null); // ✅ Xóa lỗi required nếu có
  }
}


}
