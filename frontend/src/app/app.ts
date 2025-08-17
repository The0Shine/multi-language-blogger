import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    @if (showHeader) {
    <app-header></app-header>
    }
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.css'],
})
export class App {
  title = 'angular-medium-clone';
  showHeader = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        // Ẩn header cho auth routes và admin routes
        this.showHeader =
          ![
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
          ].includes(e.urlAfterRedirects) &&
          !e.urlAfterRedirects.startsWith('/admin');
      });
  }
}
