import { Component, OnInit } from '@angular/core';
import { UserService } from '../modules/admin/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profile: any = {
    userid: null,
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    roleid: '',
    created_at: '',
    status: 'inactive',
  };

  editForm: any = {};

  roles = [
    { roleid: '1', name: 'User' },
    { roleid: '2', name: 'admin' },
  ];

  constructor(private userService: UserService) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    this.userService.getUserById(user.userid).subscribe({
      next: (user) => {
        this.profile = {
          userid: user.userid,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          username: user.username || '',
          email: user.email || '',
          roleid: user.roleid ? String(user.roleid) : '',
          created_at: user.createdAt ? new Date(user.createdAt) : null,
          status: user.status === 1 ? 'active' : 'inactive',
        };

        this.editForm = { ...this.profile };
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
      },
    });
  }

  getRoleName(roleId: string | number): string {
    const role = this.roles.find((r) => r.roleid === String(roleId));
    return role ? role.name : 'Unknown';
  }
}
