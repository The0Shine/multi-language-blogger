import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../role.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-role-list',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class AdminRoleListComponent implements OnInit {
  searchText: string = '';
  statusFilter: string = '';
  showModal = false;
  editingRole = false;

  currentPage: number = 1;
  pageSize: number = 5;

selectedRole: any = null;
showDeleteModal = false;
deleteSuccess: boolean | null = null;
deleteError: boolean | null = null;

  isSuccess: boolean | null = null;
  createSuccess: boolean | null = null;
  createError: boolean | null = null;
  editSuccess: boolean | null = null;
  editError: boolean | null = null;

  roles: any[] = [];
  modalRole = { roleid: 0, name: '', discription: '', status: 1 };

  constructor(
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadRoles();

    // Lấy page từ query params khi load trang
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1;
    });
  }

loadRoles() {
  this.roleService.getRoles().subscribe(response => {
    if (response.success && response.data && response.data.data) {
      this.roles = response.data.data.sort((a, b) => a.roleid - b.roleid);
    } else {
      this.roles = [];
    }
  });
}

  openCreateModal() {
    this.editingRole = false;
    this.modalRole = {
      roleid: 0,
      name: '',
      discription: '',
      status: 1,
    };
    this.showModal = true;
  }

 editRole(role: any) {
  this.editingRole = true;
  this.modalRole = { ...role }; // đảm bảo role có roleid chứ không phải id
  this.showModal = true;
}


  deleteRole(role: any) {
    const roleid = role.roleid;

    if (confirm('Bạn có muốn xóa role này không?')) {
      this.roleService.deleteRole(roleid).subscribe({
        next: () => {
          this.roles = this.roles.filter((r) => r.roleid !== roleid);
          this.isSuccess = true;

          setTimeout(() => {
            this.isSuccess = null;
          }, 1000);
        },
        error: () => {
          this.isSuccess = false;

          setTimeout(() => {
            this.isSuccess = null;
          }, 1000);
        },
      });
    }
  }

  validationErrors: any = {
    role_name: '',
    description: '',
  };

  validateField(field: string) {
    switch (field) {
      case 'name':
        this.validationErrors.role_name = this.modalRole.name.trim()
          ? ''
          : 'Bạn chưa nhập role name';
        break;
      case 'description':
        this.validationErrors.description = this.modalRole.discription.trim()
          ? ''
          : 'Bạn chưa nhập description';
        break;
    }
  }
  saveRole() {
  if (!this.modalRole.name?.trim() || !this.modalRole.discription?.trim()) {
    return;
  }

  const payload = {
  name: this.modalRole.name,
  discription: this.modalRole.discription,
   status: this.modalRole.status, // status đã là 0 hoặc 1
};


  if (this.editingRole) {
    if (!confirm('Bạn có chắc chắn muốn sửa role này không?')) return;

    this.roleService.updateRole(this.modalRole.roleid, payload).subscribe({
      next: (res) => {
        // Lưu ý: res có thể trả về object có structure khác, hãy dùng đúng kiểu
        const idx = this.roles.findIndex((r) => r.roleid === this.modalRole.roleid);
        if (idx > -1) this.roles[idx] = res.data.data; // theo cấu trúc backend
        this.closeModal();
        this.editSuccess = true;
        setTimeout(() => (this.editSuccess = null), 1500);
      },
      error: () => {
        this.editError = true;
        setTimeout(() => (this.editError = null), 1500);
      },
    });
  } else {
    this.roleService.createRole(payload).subscribe({
      next: (res) => {
        this.roles.push(res.data.data);
        this.closeModal();
        this.createSuccess = true;
        setTimeout(() => (this.createSuccess = null), 1500);
      },
      error: () => {
        this.createError = true;
        setTimeout(() => (this.createError = null), 1500);
      },
    });
  }
}


  closeModal() {
    this.showModal = false;
    this.modalRole = {
      roleid: 0,
      name: '',
      discription: '',
      status: 1,
    };
  }
filteredRoles() {
  return this.roles.filter((role) => {
    const keyword = this.searchText.toLowerCase();

    const roleName = role.name || '';
    const nameMatch = roleName.toLowerCase().includes(keyword);

    const statusMatch = this.statusFilter !== ''
      ? (this.statusFilter === '1' ? role.status === 1 : role.status === 0)
      : true;

    return nameMatch && statusMatch;
  });
}




  totalPages(): number {
    return Math.ceil(this.filteredRoles().length / this.pageSize);
  }

  paginatedRoles(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRoles().slice(start, start + this.pageSize);
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
  onSearchOrFilterChange() {
  this.currentPage = 1;
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { page: this.currentPage },
    queryParamsHandling: 'merge',
  });
}


  isRoleFormValid(): boolean {
    return this.modalRole.name.trim() && this.modalRole.discription.trim()
      ? true
      : false;
  }
openDeleteModal(role: any) {
  this.selectedRole = role;
  this.showDeleteModal = true;
}

confirmDeleteRole() {
  if (this.selectedRole) {
    this.roleService.permanentDeleteRole(this.selectedRole.roleid).subscribe({
      next: () => {
        // Xóa role khỏi danh sách
        this.roles = this.roles.filter(
          (r) => r.roleid !== this.selectedRole.roleid
        );

        // Nếu sau khi xóa mà trang hiện tại không còn dữ liệu, thì quay về trang trước (nếu có)
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const currentPageData = this.filteredRoles().slice(startIndex, endIndex);

        if (currentPageData.length === 0 && this.currentPage > 1) {
          this.currentPage--;
        }

        // Load lại dữ liệu sau khi xóa
        this.loadRoles();

        this.showDeleteModal = false;
        this.isSuccess = true; // Thành công
        setTimeout(() => (this.isSuccess = null), 1500);
      },
      error: () => {
        this.isSuccess = false; // Thất bại
        setTimeout(() => (this.isSuccess = null), 1500);
      },
    });
  }
}


closeDeleteModal() {
  this.showDeleteModal = false;
  this.selectedRole = null;
}

}
