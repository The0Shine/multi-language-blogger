import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../language.service'; // đảm bảo đường dẫn đúng
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-admin-language-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class AdminLanguageListComponent implements OnInit {
  searchText: string = '';
  statusFilter: string = '';
  languages: any[] = [];

  currentPage: number = 1;
  pageSize: number = 5;

  isSuccess: boolean | null = null;
  createSuccess: boolean | null = null;
  createError: boolean | null = null;
  deleteSuccess: boolean | null = null;
  deleteError: boolean | null = null;
  editSuccess: boolean | null = null;
  editError: boolean | null = null;

  selectedLanguage: any = null;
  showDeleteModal = false;

  showModal = false;
  editingLanguage = false;
  modalLanguage = {
    id: 0,
    language_name: '',
    locale_code: '',
    status: 'Active',
  };

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadLanguages();

    // Lấy page từ query params khi load trang
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1;
    });
  }


  openCreateModal() {
    this.editingLanguage = false;
    this.modalLanguage = {
      id: 0,
      language_name: '',
      locale_code: '',
      status: 'Active',
    };
    this.showModal = true;
  }

  editLanguage(language: any) {
    this.editingLanguage = true;
    this.modalLanguage = { ...language };
    this.showModal = true;
  }


  validationErrors: any = {
    language_name: '',
    locale_code: '',
  };
  validateField(field: string) {
    switch (field) {
      case 'language_name':
        this.validationErrors.language_name =
          this.modalLanguage.language_name.trim()
            ? ''
            : 'Bạn chưa nhập language name';
        break;
      case 'locale_code':
        this.validationErrors.locale_code =
          this.modalLanguage.locale_code.trim()
            ? ''
            : 'Bạn chưa nhập locale code';
        break;
    }
  }

  isLanguageValid(): boolean {
    return (
      !!this.modalLanguage.language_name?.trim() &&
      !!this.modalLanguage.locale_code?.trim()
    );
  }

  saveLanguage() {
    this.validateField('language_name');
    this.validateField('locale_code');

    if (
      this.validationErrors.language_name ||
      this.validationErrors.locale_code
    ) {
      return; // Đừng lưu nếu còn lỗi
    }

    const payload = {
      language_name: this.modalLanguage.language_name,
      locale_code: this.modalLanguage.locale_code,
      status: this.modalLanguage.status || 'Active',
    };

    if (this.editingLanguage) {
      if (!confirm('Bạn có chắc chắn muốn sửa ngôn ngữ này không?')) return;

      this.languageService
        .updateLanguage(this.modalLanguage.id, payload)
        .subscribe({
          next: () => {
            const idx = this.languages.findIndex(
              (l) => l.id === this.modalLanguage.id
            );
            if (idx !== -1) {
              this.languages[idx] = { id: this.modalLanguage.id, ...payload };
            }
            this.closeModal();
            this.editSuccess = true;
            setTimeout(() => (this.editSuccess = null), 1500);
          },
          error: () => {
            this.editError = true;
            setTimeout(() => (this.editError = null), 1500);
          },
        });
    } else {
      this.languageService.createLanguage(payload).subscribe({
        next: (created) => {
          this.languages.push(created);
          this.closeModal();
          this.createSuccess = true;
          setTimeout(() => (this.createSuccess = null), 1500);
        },
        error: () => {
          this.createError = true;
          setTimeout(() => (this.createError = null), 1500);
        },
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.modalLanguage = {
      id: 0,
      language_name: '',
      locale_code: '',
      status: 'Active',
    };
  }

  filteredLanguages() {
    return this.languages.filter((lang) => {
      const keyword = this.searchText.toLowerCase();
      const nameMatch = lang.language_name.toLowerCase().includes(keyword);

      const statusMatch =
        this.statusFilter !== ''
          ? this.statusFilter === '1'
            ? lang.status === 'Active'
            : lang.status === 'Inactive'
          : true;

      return nameMatch && statusMatch;
    });
  }
deleteLanguage(languageid: number) {
  const confirmed = confirm('Bạn có muốn xóa Language này không?');
  if (confirmed) {
    this.languageService.deleteLanguage(languageid).subscribe({
      next: () => {
        // Gọi lại API để load dữ liệu mới
        this.languageService.getLanguages().subscribe((data) => {
          this.languages = data;

          // Nếu currentPage không còn dữ liệu, thì quay về trang trước hoặc trang 1
          const totalPages = this.totalPages();
          if (this.currentPage > totalPages) {
            this.changePage(totalPages || 1); // Nếu totalPages = 0 thì về trang 1
          }

          this.isSuccess = true;
          setTimeout(() => (this.isSuccess = null), 1000);
        });
      },
      error: () => {
        this.isSuccess = false;
        setTimeout(() => (this.isSuccess = null), 1000);
      },
    });
  }
}
 loadLanguages() {
    this.languageService.getLanguages().subscribe((data) => {
      this.languages = data;
    });
  }




  totalPages(): number {
    return Math.ceil(this.filteredLanguages().length / this.pageSize);
  }

  paginatedLanguages(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLanguages().slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      // Update chỉ param page
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.currentPage },
        queryParamsHandling: 'merge',
      });
    }
  }
  onSearchOrFilterChange() {
    this.currentPage = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge',
    });
  }

  openDeleteModal(language: any) {
    this.selectedLanguage = language;
    this.showDeleteModal = true;
  }

confirmDeleteLanguage() {
  if (this.selectedLanguage) {
    this.languageService.deleteLanguage(this.selectedLanguage.id).subscribe({
      next: () => {
        // 1. Xóa phần tử khỏi mảng
        this.languages = this.languages.filter(
          (lang) => lang.id !== this.selectedLanguage.id
        );

        // 2. Tính lại dữ liệu của trang hiện tại
        const filtered = this.filteredLanguages();
        const totalPages = Math.ceil(filtered.length / this.pageSize);

        // 3. Nếu trang hiện tại vượt quá số trang, quay về trang trước
        if (this.currentPage > totalPages) {
          this.changePage(totalPages || 1); // về trang 1 nếu không còn gì
        }

        // 4. Đóng modal và thông báo
        this.showDeleteModal = false;
        this.isSuccess = true;
        setTimeout(() => (this.isSuccess = null), 1500);
      },
      error: () => {
        this.isSuccess = false;
        setTimeout(() => (this.isSuccess = null), 1500);
      },
    });
  }
}


  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedLanguage = null;
  }
}
