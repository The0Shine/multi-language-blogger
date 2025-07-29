import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';

@Component({
  selector: 'app-admin-post-update',
  templateUrl: './update.component.html',
  styleUrl: './update.component.css',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule],
})
export class AdminPostUpdateComponent implements OnInit, OnDestroy {
  postForm!: FormGroup;
  submitted = false;
  id!: string;
  categoryList: any[] = [];
  languageList: any[] = [];
  editor!: Editor;
  post!: any; // <-- Thêm dòng này

  selectedFile: File | null = null;

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
  ];
    currentUser: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');}

  async ngOnInit(): Promise<void> {
    this.editor = new Editor();
    this.id = this.route.snapshot.params['id'];

    this.postForm = this.fb.group({
      user_id: ['', Validators.required],
      category_id: ['', Validators.required],
      language_id: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      content: ['', Validators.required],
      status: [1],
      avatar: ['',Validators.required] // thêm dòng này,
    });

    // Đợi load category + language xong
    await Promise.all([
      this.loadCategories(),
      this.loadLanguages()
    ]);

    this.loadPostData();
  }


  ngOnDestroy(): void {
    this.editor.destroy();
  }

  get f() {
    return this.postForm.controls;
  }

  loadCategories(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any>('http://localhost:4000/api/v1/category/list').subscribe((res) => {
        this.categoryList = res.data;
        resolve();
      });
    });
  }

  loadLanguages(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any>('http://localhost:4000/api/v1/language/list').subscribe((res) => {
        this.languageList = res.data;
        resolve();
      });
    });
  }

  loadPostData() {
    this.http.get<any>(`http://localhost:4000/api/v1/post/${this.id}`).subscribe({
      next: (res) => {
        const data = res.data;
        this.post = data; // <-- thêm dòng này

        const translation = data.translations?.[0] || {};

        this.postForm.patchValue({
          user_id: data.user_id.toString(),
          category_id: data.category_id.toString(),
          language_id: translation.language_id?.toString(),
          title: translation.title || '',
          description: translation.description || '',
          content: translation.content || '',
          status: data.status,
          avatar: data.avatar || null // ← dòng này giúp hiển thị ảnh cũ
        });
      },
      error: (err) => {
        console.error('Lỗi khi load bài viết:', err);
      },
    });
  }

  savePost() {
    this.submitted = true;
    if (this.postForm.invalid) return;

    const formValue = this.postForm.value;

    const formData = new FormData();
    formData.append('user_id', this.currentUser.id);
    formData.append('category_id', formValue.category_id);
    formData.append('status', formValue.status.toString());
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    // Gửi chuỗi JSON cho translations
    const translations = [
      {
        language_id: formValue.language_id,
        title: formValue.title,
        description: formValue.description,
        content: formValue.content,
      }
    ];
    formData.append('translations', JSON.stringify(translations));

    this.http.put(`http://localhost:4000/api/v1/post/${this.id}`, formData).subscribe({
      next: () => {
        alert('Cập nhật thành công!');
        this.router.navigate(['/administrator/post/list']);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật:', err);
        alert('Cập nhật thất bại!');
      },
    });
}
onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.postForm.patchValue({ avatar: file });
    }
  }
}

