import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../category.service'; // chỉnh lại nếu path khác

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

  categories: any[] = [];
  modalCategory = {
    id: 0,
    category_name: '',
    status: 'Active'
  };

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  filteredCategories() {
    return this.categories.filter(category => {
      const matchesName = category.category_name.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter ? category.status === this.statusFilter : true;
      return matchesName && matchesStatus;
    });
  }

  openCreateModal() {
    this.editingCategory = false;
    this.modalCategory = { id: 0, category_name: '', status: 'Active' };
    this.showModal = true;
  }

  editCategory(category: any) {
    this.editingCategory = true;
    this.modalCategory = { ...category };
    this.showModal = true;
  }

deleteCategory(id: number) {
  if (confirm('Are you sure you want to delete this category?')) {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categories = this.categories.filter(cat => cat.id !== id);
        console.log('Deleted category with id', id);
      },
      error: (err) => {
        console.error('Xóa thất bại:', err);
        alert('Xóa thất bại!');
      }
    });
  }
}


  saveCategory() {
    if (!this.modalCategory.category_name || !this.modalCategory.status) {
      alert('Please fill in all required fields!');
      return;
    }

    const payload = {
      category_name: this.modalCategory.category_name,
      status: this.modalCategory.status
    };

    if (this.editingCategory) {
      this.categoryService.updateCategory(this.modalCategory.id, payload).subscribe(updated => {
        const index = this.categories.findIndex(c => c.id === this.modalCategory.id);
        if (index > -1) this.categories[index] = updated;
        this.closeModal();
      });
    } else {
      this.categoryService.createCategory(payload).subscribe(created => {
        this.categories.push(created);
        this.closeModal();
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.modalCategory = { id: 0, category_name: '', status: 'Active' };
  }
}
