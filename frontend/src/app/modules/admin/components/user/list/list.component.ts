import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class AdminUserListComponent {
  searchText: string = '';
  statusFilter: string = '';
  showCreateModal: boolean = false;
  isEditMode: boolean = false;

  users = [
    {
      userid: 1,
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@blog.com',
      role: 'Admin',
      status: 'Active'
    },
    {
      userid: 2,
      firstName: 'Jane',
      lastName: 'Doe',
      username: 'jane',
      email: 'jane@blog.com',
      role: 'Editor',
      status: 'Inactive'
    }
  ];

  newUser = {
    userid: 0,
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    email: '',
    role: ''
  };

  addUser() {
    this.resetForm();
    this.isEditMode = false;
    this.showCreateModal = true;
  }

  editUser(id: number) {
    const existing = this.users.find(u => u.userid === id);
    if (!existing) return;

    this.newUser = {
      userid: existing.userid,
      firstName: existing.firstName || '',
      lastName: existing.lastName || '',
      username: existing.username,
      password: '',
      email: existing.email,
      role: existing.role
    };

    this.isEditMode = true;
    this.showCreateModal = true;
  }

  saveUser() {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.role) {
      alert('Please fill in all required fields!');
      return;
    }

    if (this.isEditMode) {
      const index = this.users.findIndex(u => u.userid === Number(this.newUser.userid));
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          firstName: this.newUser.firstName,
          lastName: this.newUser.lastName,
          username: this.newUser.username,
          email: this.newUser.email,
          role: this.newUser.role
        };
      }
    } else {
      const newId = this.users.length ? Math.max(...this.users.map(u => u.userid)) + 1 : 1;
      this.users.push({
        userid: newId,
        firstName: this.newUser.firstName,
        lastName: this.newUser.lastName,
        username: this.newUser.username,
        email: this.newUser.email,
        role: this.newUser.role,
        status: 'Active'
      });
    }

    this.closeModal();
  }

  deleteUser(id: number) {
    const confirmed = confirm('Are you sure you want to delete this user?');
    if (confirmed) {
      this.users = this.users.filter(user => user.userid !== id);
    }
  }

  filteredUsers() {
    return this.users.filter(user => {
      const matchesName = user.username.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter ? user.status === this.statusFilter : true;
      return matchesName && matchesStatus;
    });
  }

  closeModal() {
    this.showCreateModal = false;
    this.resetForm();
  }

  private resetForm() {
    this.newUser = {
      userid: 0,
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      email: '',
      role: ''
    };
  }
}
