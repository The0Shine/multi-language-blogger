import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-role-test',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="role-test-container p-4">
      <h2>Role-Based Routing Test</h2>
      
      <div class="user-info mb-4">
        <h3>Current User Info:</h3>
        <p><strong>Authenticated:</strong> {{ isAuthenticated }}</p>
        <p><strong>User Role:</strong> {{ userRole }}</p>
        <p><strong>User:</strong> {{ currentUser?.username || 'None' }}</p>
      </div>

      <div class="navigation-buttons">
        <h3>Test Navigation:</h3>
        <div class="btn-group">
          <button class="btn btn-primary me-2" (click)="goToHome()">
            Go to Home (Public)
          </button>
          <button class="btn btn-success me-2" (click)="goToWrite()">
            Go to Write (User Only)
          </button>
          <button class="btn btn-warning me-2" (click)="goToProfile()">
            Go to Profile (Admin or User)
          </button>
          <button class="btn btn-danger me-2" (click)="goToAdmin()">
            Go to Admin (Admin Only)
          </button>
        </div>
      </div>

      <div class="role-info mt-4">
        <h3>Role-Based Access:</h3>
        <ul>
          <li><strong>Public routes:</strong> /, /post/:id, /login, /register</li>
          <li><strong>User routes:</strong> /write, /my-story (require user role)</li>
          <li><strong>Admin or User:</strong> /profile (require admin or user role)</li>
          <li><strong>Admin routes:</strong> /admin/* (require admin role)</li>
        </ul>
      </div>

      <div class="actions mt-4">
        <button class="btn btn-secondary me-2" (click)="refresh()">
          Refresh Info
        </button>
        <button class="btn btn-outline-danger" (click)="logout()">
          Logout
        </button>
      </div>
    </div>
  `,
  styles: [`
    .role-test-container {
      max-width: 800px;
      margin: 0 auto;
      background: #f8f9fa;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .btn-group button {
      margin-bottom: 10px;
    }
    
    .user-info {
      background: white;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #007bff;
    }
    
    .role-info {
      background: white;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #28a745;
    }
  `]
})
export class RoleTestComponent implements OnInit {
  isAuthenticated = false;
  userRole = '';
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.isAuthenticated = this.authService.isAuthenticated;
    this.userRole = this.authService.getUserRole();
    this.currentUser = this.authService.getCurrentUser();
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  goToWrite() {
    this.router.navigate(['/write']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToAdmin() {
    this.router.navigate(['/admin/home']);
  }

  logout() {
    this.authService.logout();
  }
}
