import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../language.service'; // đảm bảo đường dẫn đúng
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service'; // ✅ Import AuthService
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
showEditConfirmModal = false; // thêm biến mới
hasAccess = false;


  showModal = false;
  editingLanguage = false;
  modalLanguage = {
    languageid: 0,
    language_name: '',
    locale_code: '',
    status: 1,
  };

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
     private authService: AuthService // <-- Inject AuthService
  ) {}

 ngOnInit() {
    // ✅ BƯỚC 2: Kiểm tra quyền trước khi làm bất cứ điều gì
    // Giả sử quyền để xem trang này là 'manage_languages'
    this.hasAccess = this.authService.hasPermission('manage_languages');

    if (this.hasAccess) {
      // Nếu có quyền, mới bắt đầu tải dữ liệu
      this.loadLanguages();

      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params['page'] || 1;
      });
    }
    // Nếu không có quyền, component sẽ không làm gì cả,
    // và bạn nên có một *ngIf="!hasAccess" trong HTML để hiển thị thông báo.
  }

  openCreateModal() {
    this.editingLanguage = false;
    this.modalLanguage = {
      languageid: 0,
      language_name: '',
      locale_code: '',
      status: 1,
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

// Gọi khi user bấm Save
saveLanguage() {
  this.validateField('language_name');
  this.validateField('locale_code');

  if (this.validationErrors.language_name || this.validationErrors.locale_code) {
    return;
  }

  if (this.editingLanguage) {
    // Mở modal xác nhận thay vì confirm()
    this.showEditConfirmModal = true;
    return;
  }

  // Nếu là create thì gọi luôn
  this.createLanguage();
}

private createLanguage() {
  const payload = this.buildPayload();
  this.languageService.createLanguage(payload).subscribe({
    next: (res) => {
      if (res.success && res.data?.data) {
        this.languages.push(res.data.data);
      }
      this.closeModal();
      this.createSuccess = true;
      setTimeout(() => (this.createSuccess = null), 1500);
    },
    error: () => {
      this.createError = true;
      setTimeout(() => (this.createError = null), 1500);
    }
  });
}
confirmEditLanguage() {
  const id = this.modalLanguage.languageid;
  const payload = this.buildPayload();

  this.languageService.updateLanguage(id, payload).subscribe({
    next: (res) => {
      const updatedLang = res?.data?.data;
      if (res.success && updatedLang) {
        const idx = this.languages.findIndex(l => l.languageid === id);
        if (idx !== -1) {
          this.languages[idx] = updatedLang;
        }
      }
      this.showEditConfirmModal = false;
      this.closeModal();
      this.editSuccess = true;
      setTimeout(() => (this.editSuccess = null), 1500);
    },
    error: () => {
      this.showEditConfirmModal = false;
      this.editError = true;
      setTimeout(() => (this.editError = null), 1500);
    }
  });
}

private buildPayload() {
  const statusValue = Number(this.modalLanguage.status);
  return {
    language_name: this.modalLanguage.language_name?.trim(),
    locale_code: this.modalLanguage.locale_code?.trim(),
    status: isNaN(statusValue) ? 1 : statusValue,
  };
}

cancelEditConfirm() {
  this.showEditConfirmModal = false;
}



  closeModal() {
    this.showModal = false;
    this.modalLanguage = {
      languageid: 0,
      language_name: '',
      locale_code: '',
      status: 1,
    };
  }

filteredLanguages() {
  const keyword = (this.searchText || '').toLowerCase();
  const statusFilter = this.statusFilter || '';

  return (this.languages || []).filter((lang) => {
    const name = (lang.language_name || '').toLowerCase();
    const status = lang.status;

    const nameMatch = name.includes(keyword);
    const statusMatch =
      statusFilter !== ''
        ? statusFilter === '1'
          ? status === 1
          : status === 0
        : true;

    return nameMatch && statusMatch;
  });
}


deleteLanguage(languageId: number) {
  if (confirm('Bạn có muốn xóa Language này không?')) {
    this.languageService.deleteLanguage(languageId).subscribe({
      next: () => {
        this.loadLanguages(true); // truyền flag để hiển thị success
      },
      error: () => {
        this.isSuccess = false;
        setTimeout(() => (this.isSuccess = null), 1000);
      },
    });
  }
}

  loadLanguages(showSuccess = false) {
    this.languageService.getLanguages().subscribe({
      next: (res) => {
        const langs = res.data?.data ?? [];
        this.languages = langs.sort((a: any, b: any) => a.languageid - b.languageid);

        // ... logic phân trang ...

        if (showSuccess) {
          // ... logic hiển thị thông báo thành công ...
        }
      },
      // ✅ BƯỚC 3: Thêm khối "error" để xử lý lỗi một cách êm đẹp
      error: (err) => {
        console.error("Failed to load languages:", err.message);
        this.languages = []; // Reset mảng khi có lỗi
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây
      }
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
    this.languageService.permanentDeleteLanguage(this.selectedLanguage.languageid).subscribe({
      next: () => {
        // Xóa khỏi danh sách tạm
        this.languages = this.languages.filter(
          (lang) => lang.languageid !== this.selectedLanguage.languageid
        );

        // Nếu trang hiện tại trống sau khi xóa thì lùi về trang trước
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const currentPageData = this.filteredLanguages().slice(startIndex, endIndex);

        if (currentPageData.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }

        // Load lại từ DB để chắc chắn
        this.loadLanguages();

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
