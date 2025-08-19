import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../modules/auth/auth.service'; // Import WebSocketService
import { WebSocketService } from '../modules/auth/websocket.service'; // Import WebSocketService
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  currentUser: any;
  roleId: number = 0;
  roleName: string = '';
  permissions: string[] = [];

  constructor(private router: Router,
      private websocketService: WebSocketService,
       private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
      console.log('DEBUG raw userStr =', userStr);
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
   console.log('DEBUG parsed user =', this.currentUser);

      this.roleId = Number(this.currentUser?.roleid) || 0;
      this.roleName = this.currentUser?.roleName?.toLowerCase() || '';
       console.log('DEBUG roleId =', this.roleId, 'roleName =', this.roleName);

      // chuẩn hóa quyền
      if (Array.isArray(this.currentUser?.permissions)) {
        this.permissions = this.currentUser.permissions.map((p: any) =>
          String(p).toLowerCase()
        );
      }
         console.log('DEBUG permissions =', this.permissions);
    }
      // Nếu người dùng đã đăng nhập, hãy bắt đầu kết nối WebSocket
    if (this.authService.isLoggedIn()) {
      this.websocketService.connect();
    }
  }

  // ✅ admin check: theo roleid hoặc roleName
  get isAdmin(): boolean {
    return this.roleId === 2 || this.roleName === 'Admin';
  }

  hasPermission(permission: string): boolean {
    if (this.isAdmin) return true; // admin luôn thấy hết
    return this.permissions.includes(permission.toLowerCase());
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  profile(): void {
    this.router.navigate(['/admin/profile']);
  }

  get currentUsername() {
    return this.currentUser?.username || '';
  }
}
