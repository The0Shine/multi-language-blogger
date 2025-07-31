import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { PostService } from '../../../post.service';

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

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image']
  ];

  currentUser = 'Hải Đăng ';

  languages = [
    { id: 1, name: 'Tiếng Việt' },
    { id: 2, name: 'Tiếng Anh' },
    { id: 3, name: 'Tiếng Nhật' },
    { id: 4, name: 'Tiếng Hàn' }
  ];

  statuses = [
    { value: 0, label: 'Pending Review' },
    { value: 1, label: 'Published' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.postForm = this.fb.group({
      author: [{ value: this.currentUser, disabled: true }],
      language: ['', Validators.required],
      title: ['', Validators.required],
      status: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

savePost() {
  if (this.postForm.valid) {
    const { title, content, status } = this.postForm.getRawValue();
    this.postService.addPost({
      title,
      content,
      author: this.currentUser,
      status: Number(status) // ✅ ép kiểu về số
    });
    this.router.navigate(['/admin/post/list']);
  } else {
    this.postForm.markAllAsTouched();
  }
}


onSubmit(): void {
  if (this.postForm.valid) {
    const rawData = {
      ...this.postForm.getRawValue(),
      author: this.currentUser,
      status: Number(this.postForm.get('status')?.value) // ✅ ép kiểu
    };
    this.postService.addPost(rawData);
    this.router.navigate(['/admin/post/list']);
  } else {
    this.postForm.markAllAsTouched();
  }
}


  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
