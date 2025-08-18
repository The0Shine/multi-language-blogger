import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../user.service';
import { RoleService } from '../../../role.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service'; // ✅ Import AuthService
import { tap } from 'rxjs/internal/operators/tap';
import { Observable } from 'rxjs/internal/Observable';

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
    hasAccess = false;

  isSuccess: boolean | null = null;
  selectedUser: any = null;
  showDeleteModal = false;

  // THÊM CÁC BIẾN MỚI NÀY VÀO
  updateRoleSuccess: boolean = false;
  updateRoleError: boolean = false;
  alertMessage: string = '';

  editSuccess: boolean | null = null;
  editError: boolean | null = null;

  roleMap: { [key: number]: string } = {};

    showSuccessModal = false;
  modalMessage = '';

  newUser = this.getEmptyUser();
showSaveUserConfirmModal = false;
confirmingEditUser = false;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService // ✅ Inject AuthService
  ) {}


ngOnInit() {

  this.hasAccess = this.authService.hasPermission('manage_users');

  // ✅ BƯỚC 2: Chỉ tải dữ liệu nếu người dùng có quyền
  if (this.hasAccess) {
    this.loadInitialData(); // Gọi hàm điều phối tải dữ liệu

    // Lấy page từ query params khi load trang
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1;
    });
  }

}


private loadInitialData() {
  // Bước 1: Luôn luôn tải danh sách user vì đây là dữ liệu chính của trang.
  this.loadUsers();

  // Bước 2: KIỂM TRA - Nếu người dùng hiện tại có quyền xem danh sách roles
  // (ví dụ: là 'admin'), thì mới tải danh sách roles cho dropdown chỉnh sửa.
  // Giả sử quyền xem danh sách role là 'manage_roles'.
  if (this.authService.hasPermission('manage_roles')) {
    console.log("User has 'manage_roles' permission, loading roles for edit dropdown.");
    // Chúng ta chỉ cần gọi hàm, không cần đợi nó hoàn thành
    // vì nó chỉ dùng cho dropdown chỉnh sửa.
    this.loadRoles().subscribe();
  }
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

      email: ''
    };
  }

loadRoles(): Observable<any> {
  return this.roleService.getRoles().pipe(
    tap({
      next: (response) => {
        const rolesData = response?.data?.data || response?.data || [];
        if (response?.success && Array.isArray(rolesData)) {
          this.roles = rolesData;
          // Tạo roleMap để tra cứu nhanh hơn
          this.roleMap = this.roles.reduce((map, role) => {
            map[+role.roleid] = role.name;
            return map;
          }, {} as { [key: number]: string });
        } else {
          this.roles = [];
          this.roleMap = {};
        }
      },
      error: (err) => {
        console.error('Load roles failed:', err);
        this.roles = [];
        this.roleMap = {};
      }
    })
  );
}


private loadUsers() {
  this.userService.getAllUsers().subscribe({
    next: (response: any) => {
      // ✅ SỬA LỖI 1: Xử lý linh hoạt các dạng response từ API
      // Kiểm tra xem response có phải là một mảng trực tiếp hay là một object chứa data
      let userList: any[] = [];
      if (Array.isArray(response)) {
        userList = response; // Case 1: API trả về trực tiếp mảng user
      } else if (response && response.data) {
        // Case 2: API trả về { success: true, data: { data: [...] } } hoặc { success: true, data: [...] }
        userList = response.data.data || response.data;
      }

      this.users = userList
        .map((u: any) => ({
          userid: u.userid ?? u.id,
          roleid: u.roleid,
          roleName: u.role?.name || 'Unknown',
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          username: u.username || '',
          email: u.email || '',
          status: typeof u.status === 'number' ? u.status : 1,
        }))
        // ✅ SỬA LỖI 2: Thêm kiểu 'any' cho tham số của hàm sort
        .sort((a: any, b: any) => a.userid - b.userid);
    },
    error: (err) => {
      console.error("Load users failed:", err);
      this.users = []; // Đảm bảo mảng user được reset khi có lỗi
    }
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
        } else if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)
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

  if (Object.values(this.validationErrors).some(v => v)) return;

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

  if (!this.isEditMode || (this.newUser.password && this.newUser.password.trim())) {
    payload.password = this.newUser.password;
  }

  const request = this.isEditMode
    ? this.userService.updateUser(Number(this.newUser.userid), payload)
    : this.userService.createUser(payload);

  request.subscribe({
    next: (res) => {
      const userFromApi = res.data ?? res;

      const returnedId = userFromApi?.userid ?? userFromApi?.id ?? Number(this.newUser.userid);
      const returnedRoleId = userFromApi?.roleid ?? Number(this.newUser.roleid);

      const formattedUser = {
        userid: returnedId,
        roleid: returnedRoleId,
        roleName: this.getRoleNameById(returnedRoleId),
        first_name: userFromApi?.first_name ?? this.newUser.first_name ?? '',
        last_name: userFromApi?.last_name ?? this.newUser.last_name ?? '',
        username: userFromApi?.username ?? this.newUser.username ?? '',
        password: '',
        email: userFromApi?.email ?? this.newUser.email ?? '',
        status: typeof userFromApi?.status === 'number' ? userFromApi.status : Number(this.newUser.status) ?? 1,
      };

      if (this.isEditMode) {
        const idx = this.users.findIndex(u => u.userid === Number(this.newUser.userid));
        if (idx !== -1) {
          const merged = { ...this.users[idx], ...formattedUser, userid: this.users[idx].userid ?? formattedUser.userid };
          this.users = [
            ...this.users.slice(0, idx),
            merged,
            ...this.users.slice(idx + 1)
          ];
        } else {
          this.users = [...this.users, formattedUser];
        }
        this.newUser = { ...formattedUser };
        this.editSuccess = true;
        setTimeout(() => this.editSuccess = null, 1500);
      } else {
        this.users = [...this.users, formattedUser];
      }

      this.closeModal();
    },
    error: (err) => {
      if (this.isEditMode) {
        this.editError = true;
        setTimeout(() => this.editError = null, 1500);
      }
      alert(`${this.isEditMode ? 'Cập nhật' : 'Tạo'} thất bại!`);
      console.error(err);
    }
  });
}



// Hàm phụ để lấy tên role từ roleid
private getRoleNameById(roleid: number): string {
  const role = this.roles?.find(r => r.id === roleid);
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
  if (!this.selectedUser?.userid) {
    alert('Xóa thất bại: Không có ID người dùng!');
    console.error('Không có ID để xóa!');
    return;
  }

  this.userService.deleteUser(this.selectedUser.userid).subscribe({
    next: () => {
      // ✅ Sửa lại: dùng userid thay vì id
      this.users = this.users.filter(
        (u) => u.userid !== this.selectedUser.userid
      );

      // Cập nhật lại danh sách phân trang
      const filtered = this.filteredUsers();
      const totalAfterDelete = filtered.length;
      const totalPages = Math.ceil(totalAfterDelete / this.pageSize);
      const startIndex = (this.currentPage - 1) * this.pageSize;

      if (startIndex >= totalAfterDelete && this.currentPage > 1) {
        this.changePage(this.currentPage - 1);
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
updateUserRole(user: any) {
  // Lấy tên role để hiển thị trong thông báo
  const roleName = this.roles.find(r => r.roleid === user.roleid)?.name || '';

  this.userService.updateUserRole(user.userid, user.roleid).subscribe({
    next: (res) => {
      // 1. Set nội dung thông báo
      this.alertMessage = `Đã đổi vai trò thành công`;
      // 2. Bật cờ để hiện alert thành công
      this.updateRoleSuccess = true;
      // 3. Tự động ẩn alert sau 3 giây
      setTimeout(() => {
        this.updateRoleSuccess = false;
      }, 3000);
    },
    error: (err) => {
      // 1. Set nội dung lỗi
      this.alertMessage = 'Cập nhật vai trò thất bại, vui lòng thử lại.';
      // 2. Bật cờ để hiện alert lỗi
      this.updateRoleError = true;
      // 3. Tự động ẩn alert sau 3 giây
      setTimeout(() => {
        this.updateRoleError = false;
      }, 3000);

      console.error('Update role failed', err);
      // Quan trọng: Phục hồi lại role cũ trên giao diện nếu thất bại
      this.loadUsers(); // Tải lại danh sách user để đảm bảo dữ liệu đúng
    }
  });
}


}
