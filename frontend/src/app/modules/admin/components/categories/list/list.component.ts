import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-category-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class AdminCategorieListComponent {
  searchText: string = '';
  statusFilter: string = '';

  categories = [
    { categoryid: 1, category_name: 'Technology', status: 'Active' },
    { categoryid: 2, category_name: 'Lifestyle', status: 'Inactive' }
  ];

  showModal = false;
  editingCategory = false;
  modalCategory = { categoryid: 0, category_name: '', status: 'Active' };

  filteredCategories() {
    return this.categories.filter(category => {
      const matchesName = category.category_name.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter ? category.status === this.statusFilter : true;
      return matchesName && matchesStatus;
    });
  }

  openCreateModal() {
    this.editingCategory = false;
    this.modalCategory = { categoryid: 0, category_name: '', status: 'Active' };
    this.showModal = true;
  }

  editCategory(category: any) {
    this.editingCategory = true;
    this.modalCategory = { ...category };
    this.showModal = true;
  }

  deleteCategory(id: number) {
    this.categories = this.categories.filter(cat => cat.categoryid !== id);
  }

  saveCategory() {
    if (this.editingCategory) {
      const index = this.categories.findIndex(c => c.categoryid === this.modalCategory.categoryid);
      if (index > -1) this.categories[index] = { ...this.modalCategory };
    } else {
      const newId = Math.max(...this.categories.map(c => c.categoryid)) + 1;
      this.categories.push({ ...this.modalCategory, categoryid: newId });
    }
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
  }
}
