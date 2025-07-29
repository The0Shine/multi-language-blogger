import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  stats = [
    { section: 'post/list', icon: 'fa fa-file-alt', value: 12, label: 'Posts' },
    { section: 'user/list', icon: 'fa fa-users', value: 5, label: 'Users' },
    { section: 'category/list', icon: 'fa fa-tags', value: 4, label: 'Categories' },
    { section: 'language/list', icon: 'fa fa-language', value: 2, label: 'Languages' }
  ];

  recentPosts = [
    { title: 'Welcome to the Blog', author: 'Admin', status: 'Published', date: '2024-06-01' },
    { title: 'How to Use Categories', author: 'Jane', status: 'Draft', date: '2024-05-28' }
  ];

  constructor(private router: Router) {}

  navigateTo(section: string) {
    this.router.navigate([`/admin/${section}`]);
  }
}
