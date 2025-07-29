import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-role-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class AdminRoleListComponent {
     searchText: string = '';
  statusFilter: string = '';
  roles = [
    { roleid: 1, role_name: 'Administrator', description: 'Full access', status: 'Active' },
    { roleid: 2, role_name: 'Editor', description: 'Edit posts', status: 'Inactive' }
  ];

  showModal = false;
  editingRole = false;
  modalRole = { roleid: 0, role_name: '', description: '', status: 'Active' }; // ✅ thêm status

  openCreateModal() {
    this.editingRole = false;
    this.modalRole = { roleid: 0, role_name: '', description: '', status: 'Active' };
    this.showModal = true;
  }

  editRole(role: any) {
    this.editingRole = true;
    this.modalRole = { ...role };
    this.showModal = true;
  }

  deleteRole(id: number) {
    this.roles = this.roles.filter(role => role.roleid !== id);
  }

  saveRole() {
    if (this.editingRole) {
      const index = this.roles.findIndex(r => r.roleid === this.modalRole.roleid);
      if (index > -1) this.roles[index] = { ...this.modalRole };
    } else {
      const newId = Math.max(...this.roles.map(r => r.roleid)) + 1;
      this.roles.push({ ...this.modalRole, roleid: newId });
    }
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
  }
    filteredRoles() {
    return this.roles.filter(role => {
      const matchesName = role.role_name.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter ? role.status === this.statusFilter : true;
      return matchesName && matchesStatus;
    });
  }
}
