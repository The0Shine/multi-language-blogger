import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../category.service'; // chỉnh lại nếu path khác
import { ActivatedRoute, Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  imports: [NgIf, NgFor, FormsModule, CommonModule],
})
export class AdminCategorieListComponent implements OnInit {
  searchText: string = '';
  statusFilter: string = '';
  showModal = false;
  editingCategory = false;


  selectedCategory: any = null;
  showDeleteModal = false;

  currentPage: number = 1;
pageSize: number = 5;

editSuccess: boolean | null = null;
editError: boolean | null = null;
  createSuccess: boolean | null = null;
  createError: boolean | null = null;

  validationErrors: any = {
    category_name: ''
  };

isSuccess: boolean | null = null;

  categories: any[] = [];
  modalCategory = {
    categoryid: 0,
    category_name: '',
    status: 1
  };

  constructor(private categoryService: CategoryService,
      private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadCategories();

      // Lấy page từ query params khi load trang
    this.route.queryParams.subscribe((params) => {

      this.currentPage = +params['page'] || 1;
    });
  }

loadCategories() {
  this.categoryService.getCategories().subscribe(res => {
    this.categories = (res.data?.data ?? []).sort((a, b) => a.categoryid - b.categoryid);
  });
}


 openCreateModal() {
  this.editingCategory = false;
  this.modalCategory = { categoryid: 0, category_name: '', status: 1 };
  this.showModal = true;
}


 editCategory(category: any) {
  this.editingCategory = true;
  this.modalCategory = { ...category };
  this.showModal = true;
}

deleteCategory(categoryId: number) {
  this.categoryService.permanentDeleteCategory(categoryId).subscribe({
    next: () => {
      this.categories = this.categories.filter(c => c.categoryid !== categoryId);
      const filtered = this.filteredCategories();
      const totalPages = Math.ceil(filtered.length / this.pageSize);
      if (this.currentPage > totalPages) {
        this.changePage(totalPages || 1);
      }
      this.isSuccess = true;
      setTimeout(() => (this.isSuccess = null), 1000);
    },
    error: () => {
      this.isSuccess = false;
      setTimeout(() => (this.isSuccess = null), 1000);
    }
  });
}




  validateField(field: string) {
    if (field === 'category_name') {
      this.validationErrors.category_name = this.modalCategory.category_name.trim()
        ? ''
        : 'Bạn chưa nhập tên danh mục';
    }
  }

  isCategoryValid(): boolean {
    return !!this.modalCategory.category_name?.trim();
  }

saveCategory() {
  this.validateField('category_name');
  if (this.validationErrors.category_name) return;

  const payload = {
    category_name: this.modalCategory.category_name?.trim() || '',
    status: this.modalCategory.status ?? 1
  };

  const reloadList = () => {
    this.loadCategories(); // đảm bảo list mới nhất từ server
    this.closeModal();
  };

  if (this.editingCategory) {
    if (!confirm('Bạn có chắc chắn muốn sửa danh mục này không?')) return;

    this.categoryService.updateCategory(this.modalCategory.categoryid, payload).subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          reloadList();
          this.editSuccess = true;
          setTimeout(() => (this.editSuccess = null), 1500);
        }
      },
      error: () => {
        this.editError = true;
        setTimeout(() => (this.editError = null), 1500);
      }
    });

  } else {
    this.categoryService.createCategory(payload).subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          reloadList();
          this.createSuccess = true;
          setTimeout(() => (this.createSuccess = null), 1500);
        }
      },
      error: () => {
        this.createError = true;
        setTimeout(() => (this.createError = null), 1500);
      }
    });
  }
}



 closeModal() {
  this.showModal = false;
  this.modalCategory = { categoryid: 0, category_name: '', status: 1 };
}

filteredCategories() {
  return this.categories.filter((category) => {
    const keyword = (this.searchText || '').toLowerCase();
    const name = (category.category_name || '').toLowerCase();
    const matchesName = name.includes(keyword);

    const matchesStatus =
      this.statusFilter !== ''
        ? category.status === Number(this.statusFilter)
        : true;

    return matchesName && matchesStatus;
  });
}




  totalPages(): number {
  return Math.ceil(this.filteredCategories().length / this.pageSize);
}

paginatedCategories(): any[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredCategories().slice(start, start + this.pageSize);
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
  this.currentPage = 1; // Reset về trang 1 khi tìm kiếm hoặc filter
}

openDeleteModal(category: any) {
  this.selectedCategory = category;
  this.showDeleteModal = true;
}

closeDeleteModal() {
  this.showDeleteModal = false;
  this.selectedCategory = null;
}

confirmDelete() {
  if (!this.selectedCategory) return;
  // Gọi API xóa
  this.deleteCategory(this.selectedCategory.categoryid);
  this.closeDeleteModal();
}


}
