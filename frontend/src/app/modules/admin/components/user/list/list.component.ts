import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../user.service';
import { RoleService } from '../../../role.service';


@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class AdminUserListComponent implements OnInit {
  searchText: string = '';
  statusFilter: string = '';
  showCreateModal: boolean = false;
  isEditMode: boolean = false;

  users: any[] = [];
  currentPage: number = 1;
  pageSize: number = 5;

  roles: any[] = [];

  newUser = {
    userid: 0,
    roleid: '',
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    status: 1,
    extra_info: '',
  };

  roleMap: any = {
    1: 'Admin',
    2: 'Editor',
    3: 'User',
  };

constructor(private userService: UserService, private roleService: RoleService) {}

  ngOnInit() {
    this.loadUsers();
      this.loadRoles(); // Thêm dòng này để gọi API lấy role
  }

  loadRoles() {
  this.roleService.getRoles().subscribe((data) => {
    this.roles = data;
  });
}

  private loadUsers() {
    this.userService.getUsers().subscribe((data) => {
      this.users = data.map((u: any) => ({
        userid: u.id, // map từ json-server's id
        roleid: u.roleid,
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        username: u.username || '',
        password: '',
        status: typeof u.status === 'number' ? u.status : 1,
        extra_info: u.extra_info || '',
      }));
    });
  }

  addUser() {
    this.resetForm();
    this.isEditMode = false;
    this.showCreateModal = true;
  }

  editUser(userid: number) {
    const existing = this.users.find((u) => u.userid === userid);
    if (!existing) return;

    this.newUser = { ...existing, password: '' };
    this.isEditMode = true;
    this.showCreateModal = true;
  }

  saveUser() {
    if (
      !this.newUser.username ||
      !this.newUser.extra_info ||
      !this.newUser.roleid
    ) {
      alert('Please fill in all required fields!');
      return;
    }

    if (this.isEditMode) {
  const payload = {
    roleid: +this.newUser.roleid,
    first_name: this.newUser.first_name,
    last_name: this.newUser.last_name,
    username: this.newUser.username,
    password: this.newUser.password,
    status: +this.newUser.status,
    extra_info: this.newUser.extra_info
  };

  this.userService.updateUser(this.newUser.userid, payload).subscribe({
    next: (updatedUser) => {
      const index = this.users.findIndex(u => u.userid === this.newUser.userid);
      if (index !== -1) {
        this.users[index] = {
          userid: updatedUser.id,
          roleid: updatedUser.roleid,
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          username: updatedUser.username || '',
          password: '',
          status: updatedUser.status,
          extra_info: updatedUser.extra_info || ''
        };
      }
      this.closeModal();
    },
    error: (err) => {
      alert('Cập nhật thất bại!');
      console.error(err);
    }
  });
} else {
  // Không gửi userid khi tạo mới
  const payload = {
    roleid: +this.newUser.roleid,
    first_name: this.newUser.first_name,
    last_name: this.newUser.last_name,
    username: this.newUser.username,
    password: this.newUser.password,
    status: +this.newUser.status,
    extra_info: this.newUser.extra_info
  };

  this.userService.createUser(payload).subscribe({
    next: (createdUser) => {
      this.users.push({
        userid: createdUser.id,
        roleid: createdUser.roleid,
        first_name: createdUser.first_name || '',
        last_name: createdUser.last_name || '',
        username: createdUser.username || '',
        password: '',
        status: createdUser.status,
        extra_info: createdUser.extra_info || ''
      });
      this.closeModal();
    },
    error: (err) => {
      alert('Tạo người dùng thất bại!');
      console.error(err);
    }
  });
}

  }

  deleteUser(userid: number) {
    const confirmed = confirm('Are you sure you want to delete this user?');
    if (confirmed) {
      this.userService.deleteUser(userid).subscribe(() => {
        this.users = this.users.filter((user) => user.userid !== userid);
      });
    }
  }

  filteredUsers() {
    return this.users.filter((user) => {
      const matchesName =
        user.username.toLowerCase().includes(this.searchText.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`
          .toLowerCase()
          .includes(this.searchText.toLowerCase());

      const matchesStatus =
        this.statusFilter !== '' ? +user.status === +this.statusFilter : true;

      return matchesName && matchesStatus;
    });
  }

  paginatedUsers() {
    const filtered = this.filteredUsers();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredUsers().length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.resetForm();
  }

  private resetForm() {
    this.newUser = {
      userid: 0,
      roleid: '',
      first_name: '',
      last_name: '',
      username: '',
      password: '',
      status: 1,
      extra_info: '',
    };
  }
}
