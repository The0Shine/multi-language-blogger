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

      // 👉 Tổng số post = tất cả (mọi status)
      this.stats[0].value = postsData.length;

      // 👉 Chỉ lấy bài viết Published
      const publishedPosts = postsData.filter(
        (p: any) => Number(p.status) === 1
      );

      // 👉 Sort theo created_at mới nhất
      const sorted = publishedPosts
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at || b.createdAt || '').getTime() -
            new Date(a.created_at || a.createdAt || '').getTime()
        )
        .slice(0, 5);

      // 👉 Map thêm username + format date
      this.recentPosts = sorted.map((p: any) => {
        const user = this.users.find(
          (u) => String(u.userid ?? u.id) === String(p.userid ?? p.user_id)
        );
        const rawDate = p.created_at || p.createdAt || p.date;

        return {
          ...p,
          username: user ? user.username : 'Unknown',
          date: rawDate ? new Date(rawDate).toLocaleString('vi-VN') : 'N/A',
        };
      });
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

  renderContent(editorData: any): string {
    if (!editorData) return '';

    // Nếu content trả về là string -> parse JSON
    if (typeof editorData === 'string') {
      try {
        editorData = JSON.parse(editorData);
      } catch {
        return editorData; // fallback: hiển thị text thô
      }
    }

    if (!editorData.blocks) return '';

    return editorData.blocks
      .map((block: any) => {
        switch (block.type) {
          case 'paragraph':
            return `<p>${block.data.text}</p>`;
          case 'header':
            return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          case 'image':
            return `<img src="${block.data.file.url}" alt="${
              block.data.caption || ''
            }" style="max-width:100%; border-radius:8px;" />`;
          default:
            return '';
        }
      })
      .join('');
  }
}
