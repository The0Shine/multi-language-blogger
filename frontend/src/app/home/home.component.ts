import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PostService } from '../modules/admin/post.service';
import { UserService } from '../modules/admin/user.service';
import { CategoryService } from '../modules/admin/category.service';
import { LanguageService } from '../modules/admin/language.service';
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

  users: any[] = [];
  recentPosts: any[] = [];
  selectedPost: any = null;
  isPostModalOpen = false;

  constructor(
    private router: Router,
    private postService: PostService,
    private http: HttpClient,
    private userService: UserService,
    private categoryService: CategoryService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users;
      this.loadRecentPosts();
      this.loadCounts();
    });
  }

  // Trong file home.component.ts

loadRecentPosts() {
  this.postService.getAllPosts().subscribe((res: any) => {
    const postsData = res?.data?.posts || [];

    // 👉 Lọc bài viết chỉ lấy Published (status = 1) cho recentPosts
    const publishedPosts = postsData.filter((p: any) => p.status === 1);

    // 👉 Sắp xếp theo ngày tạo mới nhất rồi lấy 5 bài
    const sorted = [...publishedPosts]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || '').getTime() -
          new Date(a.createdAt || a.created_at || '').getTime()
      )
      .slice(0, 5);

    this.recentPosts = sorted.map((p: any) => {
      const user = this.users.find(
        (u) => String(u.id ?? u.userid) === String(p.user_id ?? p.userid)
      );

      const rawDate = p.createdAt || p.created_at || p.date;

      return {
        ...p,
        username: user ? user.username : 'Unknown',
        date: rawDate ? new Date(rawDate).toLocaleString('vi-VN') : 'N/A',
      };
    });

    // 👉 Tổng số post = TẤT CẢ post (không lọc status)
    this.stats[0].value = postsData.length;
  });
}



  loadCounts() {
    this.stats[1].value = this.users.length;

    this.categoryService.getCategories().subscribe((res) => {
      const cats = res?.data?.data || [];
      this.stats[2].value = cats.length;
    });

    this.languageService.getLanguages().subscribe((res) => {
      const langs = res?.data?.data || [];
      this.stats[3].value = langs.length;
    });
  }

  getStatusText(status: number) {
    switch (status) {
      case 1:
        return 'Published';
      case -1:
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  }

  navigateTo(section: string) {
    this.router.navigate([`/admin/${section}`]);
  }
  goToAllPosts(): void {
    this.router.navigate(['/admin/post/list']);
  }

  // Trong file home.component.ts

  // Trong file home.component.ts

  openPostDetailFromHome(postId: number) {
    this.postService.getPostById(postId).subscribe((res: any) => {
      console.log('API response for getPostById:', res);

      // ✅ SỬA LẠI ĐIỀU KIỆN VÀ CÁCH LẤY DỮ LIỆU TẠI ĐÂY
      if (res && res.data && res.data.post) {
        // Lấy đúng object bài viết từ response.data.post
        const post = res.data.post;

        // Logic lấy username (giữ nguyên)
        const user = this.users.find(
          (u) => String(u.id ?? u.userid) === String(post.userid)
        );
        // Gán username vào đúng object post
        post.username = user ? user.username : 'Unknown';

        // Dòng quan trọng: Gán đúng object bài viết
        this.selectedPost = post;
      } else {
        console.error('Không tìm thấy dữ liệu bài viết trong response:', res);
      }
    });
  }

  closePostModal() {
    this.selectedPost = null;
  }

  truncateTitle(title: string, wordLimit: number = 15): string {
    if (!title) return '';
    const words = title.split(' ');
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(' ') + '...'
      : title;
  }
}
