import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../user.service';
import { RoleService } from '../../../role.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class AdminUserListComponent implements OnInit {
  searchText = '';
  statusFilter = '';
  showCreateModal = false;
  isEditMode = false;

  users: any[] = [];
  roles: any[] = [];

  currentPage = 1;
  pageSize = 5;

  isSuccess: boolean | null = null;
  selectedUser: any = null;
  showDeleteModal = false;

  editSuccess: boolean | null = null;
  editError: boolean | null = null;

  roleMap: { [key: number]: string } = {};

  newUser = this.getEmptyUser();

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();

    // Lấy page từ query params khi load trang
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1;
    });
  }

  private getEmptyUser() {
    return {
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

loadRoles() {
  this.roleService.getRoles().subscribe((data: any[]) => {
    this.roles = data;
    // Build roleMap từ dữ liệu API
    this.roleMap = this.roles.reduce((map, role) => {
      map[+role.id] = role.role_name;
      return map;
    }, {} as { [key: number]: string });
  });
}


  private loadUsers() {
    this.userService.getUsers().subscribe((data) => {
      this.users = data.map((u: any) => ({
        userid: u.id,
        id: u.id, // 👈 cần cho delete đúng id backend
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
    this.newUser = this.getEmptyUser();
    this.validationErrors = {
      username: '',
      password: '',
      email: '',
      roleid: '',
    };
    this.isEditMode = false;
    this.showCreateModal = true;
  }

  editUser(userid: number) {
    const existing = this.users.find((u) => u.userid === userid);
    if (!existing) return;
    this.newUser = { ...existing, password: '' };
    this.validationErrors = {
      username: '',
      password: '',
      email: '',
      roleid: '',
    };
    this.isEditMode = true;
    this.showCreateModal = true;
  }

  validationErrors: any = {
    username: '',
    password: '',
    email: '',
    roleid: '',
  };

  validateField(field: string) {
    switch (field) {
      case 'username':
        this.validationErrors.username = this.newUser.username?.trim()
          ? ''
          : 'Bạn chưa nhập username';
        break;

      case 'password':
        if (!this.isEditMode) {
          // chỉ validate khi tạo mới
          this.validationErrors.password = this.newUser.password?.trim()
            ? ''
            : 'Bạn chưa nhập password';
        } else {
          this.validationErrors.password = ''; // edit thì bỏ qua
        }
        break;

      case 'email':
        if (!this.newUser.extra_info?.trim()) {
          this.validationErrors.email = 'Bạn chưa nhập email';
        } else if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.extra_info)
        ) {
          this.validationErrors.email = 'Email không hợp lệ';
        } else {
          this.validationErrors.email = '';
        }
        break;

      case 'roleid':
        this.validationErrors.roleid = this.newUser.roleid
          ? ''
          : 'Bạn chưa chọn role';
        break;
    }
  }

  clearError(field: string) {
    // Nếu field có giá trị hợp lệ thì clear lỗi ngay
    switch (field) {
      case 'username':
        if (this.newUser.username?.trim()) {
          this.validationErrors.username = '';
        }
        break;
      case 'password':
        if (this.isEditMode || this.newUser.password?.trim()) {
          this.validationErrors.password = '';
        }
        break;
      case 'email':
        if (this.newUser.extra_info?.trim()) {
          this.validationErrors.email = '';
        }
        break;
      case 'roleid':
        if (this.newUser.roleid) {
          this.validationErrors.roleid = '';
        }
        break;
    }
  }

  saveUser() {
    this.validateField('username');
    this.validateField('password');
    this.validateField('email');
    this.validateField('roleid');

    if (
      this.validationErrors.username ||
      this.validationErrors.password ||
      this.validationErrors.email ||
      this.validationErrors.roleid
    ) {
      return;
    }

    if (
      this.isEditMode &&
      !confirm('Bạn có chắc chắn muốn sửa user này không?')
    )
      return;

    const payload: any = {
      roleid: +this.newUser.roleid,
      first_name: this.newUser.first_name,
      last_name: this.newUser.last_name,
      username: this.newUser.username,
      status: +this.newUser.status,
      extra_info: this.newUser.extra_info,
    };

    // Chỉ thêm password khi tạo mới hoặc edit có nhập password
    if (!this.isEditMode || this.newUser.password.trim()) {
      payload.password = this.newUser.password;
      payload.created_at = new Date().toISOString(); // 👈 Thêm dòng này
    }

    const request = this.isEditMode
      ? this.userService.updateUser(this.newUser.userid, payload)
      : this.userService.createUser(payload);

    request.subscribe({
      next: (user) => {
        if (this.isEditMode) {
          const idx = this.users.findIndex(
            (u) => u.userid === this.newUser.userid
          );
          if (idx !== -1)
            this.users[idx] = {
              ...this.users[idx],
              ...this.newUser,
              password: '',
            };
          this.editSuccess = true;
          setTimeout(() => (this.editSuccess = null), 1500);
        } else {
          this.users.push({ ...user, userid: user.id, password: '' });
        }
        this.closeModal();
      },
      error: (err) => {
        if (this.isEditMode) {
          this.editError = true;
          setTimeout(() => (this.editError = null), 1500);
        }
        alert(`${this.isEditMode ? 'Cập nhật' : 'Tạo'} thất bại!`);
        console.error(err);
      },
    });
  }

  deleteUser(userid: number) {
    if (!confirm('Bạn có muốn xóa user này không?')) return;
    this.userService.deleteUser(userid).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.userid !== userid);
        this.showSuccess();
      },
      error: () => this.showError(),
    });
  }

  private showSuccess() {
    this.isSuccess = true;
    setTimeout(() => (this.isSuccess = null), 1000);
  }

  private showError() {
    this.isSuccess = false;
    setTimeout(() => (this.isSuccess = null), 1000);
  }

  filteredUsers() {
    return this.users.filter((u) => {
      const keyword = this.searchText.toLowerCase();
      const matchesName =
        u.username.toLowerCase().includes(keyword) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(keyword);
      const matchesStatus = this.statusFilter
        ? +u.status === +this.statusFilter
        : true;
      return matchesName && matchesStatus;
    });
  }

  onSearchChange() {
    this.currentPage = 1; // Reset về trang 1 khi tìm kiếm
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge',
    });
  }

  onStatusFilterChange() {
    this.currentPage = 1; // Reset về trang 1 khi đổi filter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge',
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
      // Update chỉ param page
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.currentPage },
        queryParamsHandling: 'merge',
      });
    }
  }

  closeModal() {
    this.showCreateModal = false;
    this.newUser = this.getEmptyUser();
  }
  //hàm kiểm tra điều kiện để nút Save sáng
  isFormValid(): boolean {
    return this.newUser.username?.trim() &&
      (this.isEditMode || this.newUser.password?.trim()) && // password chỉ check khi tạo mới
      this.newUser.extra_info?.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.extra_info) &&
      this.newUser.roleid
      ? true
      : false;
  }

  openDeleteModal(user: any) {
    this.selectedUser = {
      ...user, // 👈 user đã có sẵn id từ bước trên
      username: user.username,
    };
    console.log('Selected user:', this.selectedUser); // kiểm tra kỹ
    this.showDeleteModal = true;
  }

  confirmDeleteUser() {
    if (!this.selectedUser?.id) {
      alert('Xóa thất bại: Không có ID người dùng!');
      console.error('Không có ID để xóa!');
      return;
    }

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        // Xóa user khỏi danh sách hiện tại
        this.users = this.users.filter(
          (u) => u.userid !== this.selectedUser.id
        );

        // Tính lại danh sách user sau khi lọc và phân trang
        const filtered = this.filteredUsers();
        const totalAfterDelete = filtered.length;
        const totalPages = Math.ceil(totalAfterDelete / this.pageSize);
        const startIndex = (this.currentPage - 1) * this.pageSize;

        // Nếu không còn user nào ở trang hiện tại (nhưng vẫn còn user ở trang trước)
        if (startIndex >= totalAfterDelete && this.currentPage > 1) {
          this.changePage(this.currentPage - 1); // 👈 chỉ lùi về 1 trang
        }

        this.isSuccess = true;
        this.closeDeleteModal();
      },
      error: (err) => {
        alert('Thất bại! - Xóa user không thành công.');
        console.error('Xóa lỗi:', err);
        this.isSuccess = false;
      },
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }
}
