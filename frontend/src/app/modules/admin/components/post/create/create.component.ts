import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';

import { PostService } from '../../../post.service';
import { LanguageService } from '../../../language.service';
import { CategoryService } from '../../../category.service';

@Component({
  selector: 'app-create',
  standalone: true,
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, RouterModule]
})
export class AdminPostCreateComponent implements OnInit, OnDestroy {
  postForm!: FormGroup;
  editor!: Editor;

  currentUser: any = {};
  languages: any[] = [];
  categories: any[] = [];

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image']
  ];

  statuses = [
    { value: 0, label: 'Pending Review' },
    { value: 1, label: 'Published' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private postService: PostService,
    private languageService: LanguageService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();

    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
    } else {
      alert('Không tìm thấy người dùng trong localStorage');
    }

    this.initForm();
    this.loadLanguages();
    this.loadCategories();
  }

  initForm() {
    this.postForm = this.fb.group({
      author: [{ value: this.currentUser.username || 'Unknown', disabled: true }],
      language: ['', Validators.required],
      category: ['', Validators.required],
      title: ['', Validators.required],
      status: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  loadLanguages() {
    this.languageService.getLanguages().subscribe(data => {
      this.languages = data;
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  savePost(): void {
    if (this.postForm.valid) {
      const formData = this.postForm.getRawValue();
      const payload = {
        title: formData.title,
        content: formData.content,
        status: Number(formData.status),
        author: this.currentUser.username,
        user_id: this.currentUser.id,
        language_id: Number(formData.language),
        category_id: Number(formData.category)
      };

      this.postService.addPost(payload).subscribe(() => {
        this.router.navigate(['/admin/post/list']);
      });
    } else {
      this.postForm.markAllAsTouched();
    }
  }

  onSubmit(): void {
    this.savePost();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
