import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class AdminLayoutComponent implements OnInit {
  currentUser: any;
  sidebarVisible = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }

    // Load Bootstrap JS dynamically for admin components
    this.loadBootstrapJS();
    // Initialize dropdown functionality
    this.initializeDropdowns();
  }

  private loadBootstrapJS(): void {
    if (!document.querySelector('script[src*="bootstrap.bundle.min.js"]')) {
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  private initializeDropdowns(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      // Handle dropdown toggle
      if (
        target.matches('[data-bs-toggle="dropdown"]') ||
        target.closest('[data-bs-toggle="dropdown"]')
      ) {
        event.preventDefault();
        const button = target.closest(
          '[data-bs-toggle="dropdown"]'
        ) as HTMLElement;
        const dropdown = button?.nextElementSibling as HTMLElement;

        if (dropdown) {
          // Close all other dropdowns
          document.querySelectorAll('.dropdown-menu.show').forEach((menu) => {
            if (menu !== dropdown) {
              menu.classList.remove('show');
            }
          });

          // Toggle current dropdown
          dropdown.classList.toggle('show');
        }
      } else {
        // Close all dropdowns when clicking outside
        document.querySelectorAll('.dropdown-menu.show').forEach((menu) => {
          menu.classList.remove('show');
        });
      }
    });
  }
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('show', this.sidebarVisible);
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']); // ✅ vì route login không nằm trong admin
  }

  profile(): void {
    this.router.navigate(['/admin/profile']); // ✅ vì route login không nằm trong admin
  }

  get currentUsername() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData).username : '';
  }
}
