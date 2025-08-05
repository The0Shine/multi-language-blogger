import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../role.service'; // sửa lại path nếu khác

@Component({
  selector: 'app-admin-role-list',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class AdminRoleListComponent implements OnInit {
  searchText: string = '';
  statusFilter: string = '';
  showModal = false;
  editingRole = false;

  roles: any[] = [];
  modalRole = { id: 0, role_name: '', description: '', status: 'Active' };

  constructor(private roleService: RoleService) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe(data => {
      this.roles = data;
    });
  }

  openCreateModal() {
    this.editingRole = false;
    this.modalRole = { id: 0, role_name: '', description: '', status: 'Active' };
    this.showModal = true;
  }

  editRole(role: any) {
    this.editingRole = true;
    this.modalRole = { ...role };
    this.showModal = true;
  }

deleteRole(role: any) {
  const id = role.id; // Lấy đúng id từ role
  if (confirm('Are you sure you want to delete this role?')) {
    this.roleService.deleteRole(id).subscribe(() => {
      this.roles = this.roles.filter(r => r.id !== id); // So sánh đúng field id
    });
  }
}


  saveRole() {
    if (!this.modalRole.role_name || !this.modalRole.status) {
      alert('Please fill in all required fields!');
      return;
    }

    const payload = {
      role_name: this.modalRole.role_name,
      description: this.modalRole.description,
      status: this.modalRole.status
    };

    if (this.editingRole) {
      this.roleService.updateRole(this.modalRole.id, payload).subscribe(updated => {
        const idx = this.roles.findIndex(r => r.id === this.modalRole.id);
        if (idx > -1) this.roles[idx] = { ...updated };
        this.closeModal();
      });
    } else {
      this.roleService.createRole(payload).subscribe(created => {
        this.roles.push(created);
        this.closeModal();
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.modalRole = { id: 0, role_name: '', description: '', status: 'Active' };
  }

  filteredRoles() {
    return this.roles.filter(role => {
      const nameMatch = role.role_name.toLowerCase().includes(this.searchText.toLowerCase());
      const statusMatch = this.statusFilter ? role.status === this.statusFilter : true;
      return nameMatch && statusMatch;
    });
  }
}
