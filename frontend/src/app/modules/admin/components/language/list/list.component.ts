import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../language.service'; // đảm bảo đường dẫn đúng

@Component({
  selector: 'app-admin-language-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class AdminLanguageListComponent implements OnInit {
  searchText: string = '';
  statusFilter: string = '';
  languages: any[] = [];

  showModal = false;
  editingLanguage = false;
  modalLanguage = { id: 0, language_name: '', locale_code: '', status: 'Active' };

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.loadLanguages();
  }

  loadLanguages() {
    this.languageService.getLanguages().subscribe(data => {
      this.languages = data;
    });
  }

  get filteredLanguages() {
    return this.languages.filter(language => {
      const matchesName = language.language_name.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter ? language.status === this.statusFilter : true;
      return matchesName && matchesStatus;
    });
  }

  openCreateModal() {
    this.editingLanguage = false;
    this.modalLanguage = { id: 0, language_name: '', locale_code: '', status: 'Active' };
    this.showModal = true;
  }

  editLanguage(language: any) {
    this.editingLanguage = true;
    this.modalLanguage = { ...language };
    this.showModal = true;
  }

 deleteLanguage(id: number) {
  console.log('ID cần xóa:', id); // ➜ Xem có log ra đúng id không?
  if (confirm('Are you sure you want to delete this language?')) {
    this.languageService.deleteLanguage(id).subscribe({
      next: () => {
        this.languages = this.languages.filter(lang => lang.id !== id);
        console.log('Đã xóa id', id);
      },
      error: (err) => {
        console.error('Xóa thất bại:', err);
        alert('Xóa thất bại');
      }
    });
  }
}


  saveLanguage() {
    if (!this.modalLanguage.language_name || !this.modalLanguage.locale_code || !this.modalLanguage.status) {
      alert('Please fill in all fields!');
      return;
    }

    const payload = {
      language_name: this.modalLanguage.language_name,
      locale_code: this.modalLanguage.locale_code,
      status: this.modalLanguage.status
    };

    if (this.editingLanguage) {
      this.languageService.updateLanguage(this.modalLanguage.id, payload).subscribe(updated => {
        const idx = this.languages.findIndex(l => l.id === this.modalLanguage.id);
        if (idx !== -1) {
          this.languages[idx] = { id: this.modalLanguage.id, ...payload };
        }
        this.closeModal();
      });
    } else {
      this.languageService.createLanguage(payload).subscribe(created => {
        this.languages.push(created);
        this.closeModal();
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.modalLanguage = { id: 0, language_name: '', locale_code: '', status: 'Active' };
  }
}
