import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
declare let bootstrap: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  profile: any = {
    id: null,
    firstName: '',
    lastName: '',
    username: '',
    extra_info: '',
    role_id: '',
    created_at: '',
    avatar: '',
    status: 'inactive',
  };

  editForm: any = {};
  avatarPreview: string | null = null;

  roles = [
    { id: '1', name: 'Admin' },
    { id: '2', name: 'Editor' },
    { id: '3', name: 'User' },
  ];

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.profile = {
        id: user.id,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
        extra_info: user.extra_info || '',
        role_id: user.roleid ? String(user.roleid) : '',
        created_at: user.created_at || new Date().toISOString(),
        avatar:
          user.avatar ||
          'https://p9-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/e3f76ab347a6a242bf87526d35162fb0~tplv-tiktokx-cropcenter:1080:1080.jpeg',
        status: user.status === 1 ? 'active' : 'inactive',
      };
    }

    this.editForm = { ...this.profile };
  }

  triggerFileInput(event: Event) {
    event.preventDefault();
    this.fileInput.nativeElement.click();
  }

  previewAvatar(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.avatarPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(event: Event) {
    event.preventDefault();
    this.avatarPreview = null;
    this.editForm.avatar = '';
  }

  saveProfile() {
    this.profile = {
      ...this.profile,
      ...this.editForm,
      avatar: this.avatarPreview || this.profile.avatar,
      status: this.editForm.status === 'active' ? 'active' : 'inactive',
    };

    const oldUser = JSON.parse(localStorage.getItem('user') || '{}');

    const updatedUser = {
      ...oldUser,
      id: this.profile.id,
      roleid: Number(this.profile.role_id),
      first_name: this.profile.firstName,
      last_name: this.profile.lastName,
      username: this.profile.username,
      extra_info: this.profile.extra_info,
      status: this.profile.status === 'active' ? 1 : 0,
      avatar: this.profile.avatar,
      created_at: oldUser.created_at, // giữ nguyên ngày tạo gốc
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));

    this.editForm = { ...this.profile };

    const modalEl = document.getElementById('editProfileModal');
    if (modalEl) {
      const modalInstance =
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.hide();
    }
  }

  getRoleName(roleId: string) {
    return this.roles.find((r) => r.id === roleId)?.name || 'Unknown';
  }

  get currentUsername() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData).username : '';
  }
}
