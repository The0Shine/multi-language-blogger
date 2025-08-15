import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../../../user.service';
import { AdminRoleService } from '../../../role.service';
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
  showSaveUserConfirmModal = false;
  confirmingEditUser = false;

  constructor(
    private userService: AdminUserService,
    private roleService: AdminRoleService,
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

      email: '',
    };
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (response) => {
        const rolesData = response?.data?.data || response?.data || [];
        if (response?.success && Array.isArray(rolesData)) {
          this.roles = rolesData;
          this.roleMap = this.roles.reduce((map, role) => {
            map[+role.roleid] = role.name; // dùng roleid
            return map;
          }, {} as { [key: number]: string });

          // Nếu users đã load trước đó thì cập nhật lại roleName
          if (this.users.length) {
            this.users = this.users.map((u) => ({
              ...u,
              roleName: this.getRoleNameById(u.roleid),
            }));
          }
        } else {
          this.roles = [];
          this.roleMap = {};
        }
      },
      error: (err) => {
        console.error('Load roles failed:', err);
        this.roles = [];
        this.roleMap = {};
      },
    });
  }

  private loadUsers() {
    this.userService.getAllUsers().subscribe((list) => {
      this.users = list
        .map((u: any) => ({
          userid: u.userid ?? u.id,
          roleid: u.roleid,
          roleName: this.getRoleNameById(u.roleid), // luôn gọi hàm này
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          username: u.username || '',
          password: '',
          email: u.email || '',
          status: typeof u.status === 'number' ? u.status : 1,
        }))
        .sort((a, b) => a.userid - b.userid);
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
        if (!this.newUser.email?.trim()) {
          this.validationErrors.email = 'Bạn chưa nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
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
        if (this.newUser.email?.trim()) {
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
  confirmEditUser() {
    this.confirmingEditUser = true;
    this.showSaveUserConfirmModal = false;
    this.saveUser(); // chạy update
    this.confirmingEditUser = false; // reset lại cho lần sau
  }

  openSaveConfirmModal(user: any) {
    this.selectedUser = { ...user }; // gán tên user để modal hiển thị
    this.showSaveUserConfirmModal = true;
  }

  closeSaveUserConfirmModal() {
    this.showSaveUserConfirmModal = false;
  }

  saveUser() {
    this.validateField('username');
    if (!this.isEditMode) {
      this.validateField('password');
    }
    this.validateField('email');
    this.validateField('roleid');

    if (Object.values(this.validationErrors).some((v) => v)) return;

    // Nếu đang edit và chưa xác nhận -> mở modal
    if (this.isEditMode && !this.confirmingEditUser) {
      this.openSaveConfirmModal(this.newUser); // gán selectedUser từ newUser
      return;
    }

    const payload: any = {
      roleid: Number(this.newUser.roleid),
      first_name: this.newUser.first_name,
      last_name: this.newUser.last_name,
      username: this.newUser.username,
      status: Number(this.newUser.status),
      email: this.newUser.email,
    };

    if (
      !this.isEditMode ||
      (this.newUser.password && this.newUser.password.trim())
    ) {
      payload.password = this.newUser.password;
    }

    const request = this.isEditMode
      ? this.userService.updateUser(Number(this.newUser.userid), payload)
      : this.userService.createUser(payload);

    request.subscribe({
      next: (res) => {
        const userFromApi = res.data ?? res;

        const returnedId =
          userFromApi?.userid ?? userFromApi?.id ?? Number(this.newUser.userid);
        const returnedRoleId =
          userFromApi?.roleid ?? Number(this.newUser.roleid);

        const formattedUser = {
          userid: returnedId,
          roleid: returnedRoleId,
          roleName: this.getRoleNameById(returnedRoleId),
          first_name: userFromApi?.first_name ?? this.newUser.first_name ?? '',
          last_name: userFromApi?.last_name ?? this.newUser.last_name ?? '',
          username: userFromApi?.username ?? this.newUser.username ?? '',
          password: '',
          email: userFromApi?.email ?? this.newUser.email ?? '',
          status:
            typeof userFromApi?.status === 'number'
              ? userFromApi.status
              : Number(this.newUser.status) ?? 1,
        };

        if (this.isEditMode) {
          const idx = this.users.findIndex(
            (u) => u.userid === Number(this.newUser.userid)
          );
          if (idx !== -1) {
            const merged = {
              ...this.users[idx],
              ...formattedUser,
              userid: this.users[idx].userid ?? formattedUser.userid,
            };
            this.users = [
              ...this.users.slice(0, idx),
              merged,
              ...this.users.slice(idx + 1),
            ];
          } else {
            this.users = [...this.users, formattedUser];
          }
          this.newUser = { ...formattedUser };
          this.editSuccess = true;
          setTimeout(() => (this.editSuccess = null), 1500);
        } else {
          this.users = [...this.users, formattedUser];
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

  // Hàm phụ để lấy tên role từ roleid
  private getRoleNameById(roleid: number): string {
    const role = this.roles?.find((r) => r.id === roleid);
    return role ? role.name : 'Unknown';
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
      this.newUser.email?.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email) &&
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
