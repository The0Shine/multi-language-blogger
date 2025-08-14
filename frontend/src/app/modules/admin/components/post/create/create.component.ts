// import { Component, OnInit, OnDestroy } from '@angular/core';
// import {
//   FormBuilder,
//   FormGroup,
//   Validators,
//   ReactiveFormsModule,
// } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';

// import { PostService } from '../../../post.service';
// import { LanguageService } from '../../../language.service';

// @Component({
//   selector: 'app-create',
//   standalone: true,
//   templateUrl: './create.component.html',
//   styleUrls: ['./create.component.css'],
//   imports: [CommonModule, ReactiveFormsModule, NgxEditorModule, RouterModule],
// })
// export class AdminPostCreateComponent implements OnInit, OnDestroy {
//   postForm!: FormGroup;
//   editor!: Editor;

//   currentUser: any = {};
//   languages: any[] = [];
//   currentLang: 'vi' | 'en' = 'vi';
//   translated = false;

//   toolbar: Toolbar = [
//     ['bold', 'italic'],
//     ['underline', 'strike'],
//     ['code', 'blockquote'],
//     ['ordered_list', 'bullet_list'],
//     ['link', 'image'],
//   ];

//   statuses = [
//   { value: 0, label: 'Pending Review' },
//   { value: 1, label: 'Published' }
// ];


//   // Nội dung từng ngôn ngữ
//   contentVi = '';
//   contentEn = '';
//   titleVi = '';
//   titleEn = '';

//   // ID ngôn ngữ
//   viLangId!: number;
//   enLangId!: number;

//   originalId: number | null = null;

//   isVietnamese = true;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private postService: PostService,
//     private languageService: LanguageService
//   ) {}

//   ngOnInit(): void {
//     this.editor = new Editor();
//     const user = localStorage.getItem('user');
//     if (user) {
//       this.currentUser = JSON.parse(user);
//     }

//     this.initForm();
//     this.loadLanguages();

//     this.postForm.get('content')?.valueChanges.subscribe((val) =>
//       this.validateContent(val)
//     );
//   }

//   ngOnDestroy(): void {
//     this.editor?.destroy();
//   }

//   initForm() {
//     this.postForm = this.fb.group({
//       author: [{ value: this.currentUser.username || 'Unknown', disabled: true }],
//       language: ['', Validators.required],
//       title: ['', [Validators.required, Validators.pattern(/\S+/)]],
//       status: ['', Validators.required],
//       content: ['', [Validators.required, this.noWhitespaceValidator]],
//     });
//   }

// loadLanguages() {
//   this.languageService.getLanguages().subscribe((res) => {
//     console.log('API raw response:', res);

//     if (
//       res &&
//       res.success &&
//       res.data &&
//       Array.isArray(res.data.data)
//     ) {
//       this.languages = res.data.data;
//       console.log('Languages array:', this.languages);

//       const viLang = this.languages.find(l =>
//         l.locale_code?.toLowerCase().includes('vi')
//       );
//       const enLang = this.languages.find(l =>
//         l.locale_code?.toLowerCase().includes('en')
//       );

//       console.log('viLang:', viLang);
//       console.log('enLang:', enLang);

//       if (viLang && enLang) {
//         this.viLangId = viLang.languageid;
//         this.enLangId = enLang.languageid;

//         console.log('Default patch language ID:', this.viLangId);
//         this.postForm.patchValue({ language: this.viLangId });
//       }
//     } else {
//       console.warn('Languages not found or invalid format');
//       this.languages = [];
//     }
//   });
// }


//   onSubmit(): void {
//   if (this.postForm.invalid) {
//     this.postForm.markAllAsTouched();
//     return;
//   }

//   if (this.currentLang === 'vi') {
//     this.contentVi = this.postForm.get('content')?.value;
//     this.titleVi = this.postForm.get('title')?.value;
//   } else {
//     this.contentEn = this.postForm.get('content')?.value;
//     this.titleEn = this.postForm.get('title')?.value;
//   }

//   const status = Number(this.postForm.get('status')?.value);

//   const payloadVi = {
//     title: this.titleVi,
//     content: this.contentVi,
//     status,
//     user_id: String(this.currentUser.id),
//     language_id: this.viLangId,
//     original_id: null,
//   };

//   this.postService.addPost(payloadVi).subscribe({
//     next: (viPost: any) => {
//       if (this.translated && this.contentEn && this.titleEn) {
//         const payloadEn = {
//           title: this.titleEn,
//           content: this.contentEn,
//           status,
//           user_id: String(this.currentUser.id),
//           language_id: this.enLangId,
//           original_id: viPost.id,
//         };

//         this.postService.addPost(payloadEn).subscribe({
//           next: () => this.router.navigate(['/admin/post/list']),
//           error: () => alert('Lỗi khi tạo bản dịch tiếng Anh'),
//         });
//       } else {
//         this.router.navigate(['/admin/post/list']);
//       }
//     },
//     error: () => alert('Lỗi khi tạo bài viết'),
//   });
// }


//   validateContent(value: string) {
//     const plainText = this.stripHtml(value || '');
//     const control = this.postForm.get('content');
//     if (plainText.trim().length === 0) {
//       control?.setErrors({ whitespace: true });
//     } else {
//       control?.setErrors(null);
//     }
//   }

//   getErrorMessage(field: string): string {
//     const control = this.postForm.get(field);
//     if (control?.hasError('required')) {
//       if (field === 'language') return 'Bạn chưa chọn Ngôn ngữ';
//       if (field === 'title') return 'Bạn chưa nhập tiêu đề';
//       if (field === 'content') return 'Bạn chưa nhập nội dung';
//     }
//     if (control?.hasError('whitespace') || control?.hasError('pattern')) {
//       return 'Không được chỉ nhập khoảng trắng';
//     }
//     return '';
//   }
// //Hàm này là một validator tùy chỉnh để kiểm tra xem giá trị của trường có phải chỉ là khoảng trắng hay không:
//   noWhitespaceValidator(control: any) {
//     const isWhitespace = (control.value || '').trim().length === 0;
//     return isWhitespace ? { whitespace: true } : null;
//   }
// // hàm stripHtml sẽ loại bỏ các thẻ <p> và <strong>
//   stripHtml(html: string): string {
//     const div = document.createElement('div');
//     div.innerHTML = html;
//     return div.textContent || div.innerText || '';
//   }

// switchLang(lang: 'vi' | 'en') {
//   // Lưu lại trước khi chuyển
//   if (this.currentLang === 'vi') {
//     this.contentVi = this.postForm.get('content')?.value;
//     this.titleVi = this.postForm.get('title')?.value;
//   } else {
//     this.contentEn = this.postForm.get('content')?.value;
//     this.titleEn = this.postForm.get('title')?.value;
//   }

//   // Cập nhật form theo ngôn ngữ mới
//   this.currentLang = lang;
//   this.postForm.patchValue({
//     language: lang === 'vi' ? this.viLangId : this.enLangId, // phải khớp languageid
//     title: lang === 'vi' ? this.titleVi : this.titleEn,
//     content: lang === 'vi' ? this.contentVi : this.contentEn,
//   });
// }
//   translateToEnglish() {
//     // Gọi khi muốn tạo bản dịch
//     this.translated = true;
//     this.switchLang('en');
//   }

//   switchToVietnamese() {
//   this.switchLang('vi');
//   this.isVietnamese = true;
// }

// switchToEnglish() {
//   this.switchLang('en');
//   this.isVietnamese = false;
//   this.translated = true; // đánh dấu đã dịch, để khi submit sẽ tạo bản tiếng Anh
// }


// }
