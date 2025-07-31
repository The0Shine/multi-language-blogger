import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostService } from '../modules/admin/post.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  stats = [
    { section: 'post/list', icon: 'fa fa-file-alt', value: 12, label: 'Posts' },
    { section: 'user/list', icon: 'fa fa-users', value: 5, label: 'Users' },
    { section: 'category/list', icon: 'fa fa-tags', value: 4, label: 'Categories' },
    { section: 'language/list', icon: 'fa fa-language', value: 2, label: 'Languages' }
  ];

  recentPosts: any[] = [];

  constructor(private router: Router, private postService: PostService) {}

ngOnInit() {
  this.recentPosts = this.postService.getRecentPosts(5).map((p: any) => ({
    title: p.title,
    author: p.author,
    status: p.status === 1
      ? 'Published'
      : p.status === 2
        ? 'Rejected'
        : 'Pending Review',
    date: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : 'N/A'
  }));
    this.loadRecentPosts();
}
getStatusText(status: number) {
  switch (status) {
    case 1: return 'Published';
    case 2: return 'Rejected';
    default: return 'Pending Review';
  }
}
loadRecentPosts() {
  this.recentPosts = this.postService.getRecentPosts(5);
}


  navigateTo(section: string) {
    this.router.navigate([`/admin/${section}`]);
  }
}
