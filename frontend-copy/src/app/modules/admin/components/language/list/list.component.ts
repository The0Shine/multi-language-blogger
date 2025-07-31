import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-language-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class AdminLanguageListComponent {
  searchText: string = '';
  statusFilter: string = '';

  languages = [
    { languageid: 1, language_name: 'English', locale_code: 'en', status: 'Active' },
    { languageid: 2, language_name: 'Vietnamese', locale_code: 'vi', status: 'Inactive' }
  ];

  showModal = false;
  editingLanguage = false;
  modalLanguage = { languageid: 0, language_name: '', locale_code: '', status: 'Active' };

  get filteredLanguages() {
    return this.languages.filter(language => {
      const matchesName = language.language_name.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter ? language.status === this.statusFilter : true;
      return matchesName && matchesStatus;
    });
  }

  openCreateModal() {
    this.editingLanguage = false;
    this.modalLanguage = { languageid: 0, language_name: '', locale_code: '', status: 'Active' };
    this.showModal = true;
  }

  editLanguage(language: any) {
    this.editingLanguage = true;
    this.modalLanguage = { ...language };
    this.showModal = true;
  }

  deleteLanguage(id: number) {
    this.languages = this.languages.filter(lang => lang.languageid !== id);
  }

  saveLanguage() {
    if (this.editingLanguage) {
      const index = this.languages.findIndex(l => l.languageid === this.modalLanguage.languageid);
      if (index > -1) this.languages[index] = { ...this.modalLanguage };
    } else {
      const newId = Math.max(...this.languages.map(l => l.languageid)) + 1;
      this.languages.push({ ...this.modalLanguage, languageid: newId });
    }
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
  }
}
