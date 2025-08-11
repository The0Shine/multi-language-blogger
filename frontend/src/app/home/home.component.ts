import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PostService } from '../modules/admin/post.service';
import { UserService } from '../modules/admin/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  stats = [
    { section: 'post/list', icon: 'fa fa-file-alt', value: 0, label: 'Posts' },
    { section: 'user/list', icon: 'fa fa-users', value: 0, label: 'Users' },
    {
      section: 'category/list',
      icon: 'fa fa-tags',
      value: 0,
      label: 'Categories',
    },
    {
      section: 'language/list',
      icon: 'fa fa-language',
      value: 0,
      label: 'Languages',
    },
  ];

  currentPage = 1;

  users: any[] = [];

  recentPosts: any[] = [];

  constructor(
    private router: Router,
    private postService: PostService,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      this.loadRecentPosts();
      this.loadCounts();
    });
  }
  goToAllPosts() {
    this.router.navigate(['/admin/post/list']);
  }

 loadRecentPosts() {
  this.postService.getPosts().subscribe((posts: any[]) => {
    const sorted = posts
      .sort((a, b) =>
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      )
      .slice(0, 5);

    this.recentPosts = sorted.map((p: any) => {
      const user = this.users.find(u => String(u.id) === String(p.user_id));
      return {
        ...p,
        username: user ? user.username : 'Unknown',
        date: p.createdAt
          ? new Date(p.createdAt).toISOString().split('T')[0]
          : 'N/A'
      };
    });

    this.stats[0].value = posts.length;
  });
}


  loadCounts() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe((users) => {
      this.stats[1].value = users.length;
    });

    this.http
      .get<any[]>('http://localhost:3000/categories')
      .subscribe((cats) => {
        this.stats[2].value = cats.length;
      });

    this.http
      .get<any[]>('http://localhost:3000/languages')
      .subscribe((langs) => {
        this.stats[3].value = langs.length;
      });
  }

  getStatusText(status: number) {
    switch (status) {
      case 1:
        return 'Published';
      case 2:
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  }

  navigateTo(section: string) {
    this.router.navigate([`/admin/${section}`]);
  }

openPostDetailFromHome(postId: number) {
  const postsPerPage = 5;

  // Gọi API để tìm vị trí của postId trong danh sách toàn bộ bài viết
  this.postService.getPosts().subscribe(allPosts => {
    const index = allPosts.findIndex(p => p.id === postId);
    if (index !== -1) {
      const pageNumber = Math.floor(index / postsPerPage) + 1;
      this.router.navigate(['/admin/post/list'], {
        queryParams: { page: pageNumber, view: postId }
      });
    }
  });
}


  truncateTitle(title: string, wordLimit: number = 15): string {
    if (!title) return '';
    const words = title.split(' ');
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(' ') + '...'
      : title;
  }
}
