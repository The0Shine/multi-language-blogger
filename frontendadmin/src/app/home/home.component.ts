import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostService } from '../modules/admin/post.service';
import { UserService } from '../modules/admin/user.service';
import { CategoryService } from '../modules/admin/category.service';
import { LanguageService } from '../modules/admin/language.service';
import { AuthService } from '../modules/auth/auth.service';

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
    { section: 'category/list', icon: 'fa fa-tags', value: 0, label: 'Categories' },
    { section: 'language/list', icon: 'fa fa-language', value: 0, label: 'Languages' },
  ];

  recentPosts: any[] = [];
  selectedPost: any = null;
  // Mảng `users` đã được xóa bỏ hoàn toàn
  // <<< THÊM MỚI: Biến quản lý quyền, giúp code gọn hơn >>>
  canViewPosts = false;
  canManageUsers = false;
  canManageCategories = false;
  canManageLanguages = false;

  constructor(
    private router: Router,
    private postService: PostService,
    private userService: UserService,
    private categoryService: CategoryService,
    private languageService: LanguageService,
    private authService: AuthService
  ) {}

   ngOnInit() {
    this.initializePermissions(); // Gán quyền vào các biến
    this.buildStatsByRole();      // Xây dựng các ô thống kê dựa trên quyền
    this.loadCounts();

    // <<< THAY ĐỔI: Chỉ tải Recent Posts nếu có quyền >>>
    if (this.canViewPosts) {
      this.loadRecentPosts();
    }
  }
 initializePermissions() {
    const currentUser = this.authService.getUser();
    const isAdmin = currentUser?.roleName === "admin";
    const permissions: string[] = currentUser?.permissions || [];

      // <<< THÊM DÒNG NÀY ĐỂ DEBUG >>>
    console.log('DEBUG PERMISSIONS:', permissions);

    this.canViewPosts = isAdmin || permissions.includes("moderate_posts") || permissions.includes("manage_posts");
    this.canManageUsers = isAdmin || permissions.includes("manage_users");
    this.canManageCategories = isAdmin || permissions.includes("manage_categories");
    this.canManageLanguages = isAdmin || permissions.includes("manage_languages");
  }

  // <<< THAY ĐỔI: Hàm này giờ chỉ dùng các biến boolean, rất sạch sẽ >>>
  buildStatsByRole() {
    this.stats = []; // reset mảng

    // Posts
    if (this.canViewPosts) {
      this.stats.push({ section: 'post/list', icon: 'fa fa-file-alt', value: 0, label: 'Posts' });
    }

    // Users
    if (this.canManageUsers) {
      this.stats.push({ section: 'user/list', icon: 'fa fa-users', value: 0, label: 'Users' });
    }

    // Categories
    if (this.canManageCategories) {
      this.stats.push({ section: 'category/list', icon: 'fa fa-tags', value: 0, label: 'Categories' });
    }

    // Languages
    if (this.canManageLanguages) {
      this.stats.push({ section: 'language/list', icon: 'fa fa-language', value: 0, label: 'Languages' });
    }
  }

  loadRecentPosts() {
    const params = { status: 1, limit: 5, sort: 'createdAt:desc' };
    this.postService.getAllPosts(params).subscribe((res: any) => {
      const postsData = res?.data?.posts || [];
      this.recentPosts = postsData.map((p: any) => ({
        ...p,
        username: p.author ? p.author.username : 'Unknown',
        date: p.created_at ? new Date(p.created_at).toLocaleString('vi-VN') : 'N/A',
      }));
    });
  }




 // Trong file: home.component.ts

loadCounts() {
  // ✅ Posts
  // <<< SỬA LẠI: Tìm mục 'Posts' một cách an toàn thay vì dùng stats[0] >>>
  const postStat = this.stats.find(s => s.label === 'Posts');
  if (postStat) {
    this.postService.getAllPosts({ languageid: 1, limit: 1 }).subscribe({
      next: (res) => { postStat.value = res?.data?.pagination?.totalItems || 0; },
      error: () => { postStat.value = 0; }
    });
  }

  // ✅ Users
  // <<< SỬA LẠI: Tìm mục 'Users' một cách an toàn thay vì dùng stats[1] >>>
  const userStat = this.stats.find(s => s.label === 'Users');
  if (userStat) {
    this.userService.getAllUsers().subscribe({
      next: (usersArray) => { userStat.value = usersArray.length; },
      error: () => { userStat.value = 0; }
    });
  }

  // ✅ Categories
  // <<< SỬA LẠI: Tìm mục 'Categories' một cách an toàn thay vì dùng stats[2] >>>
  const categoryStat = this.stats.find(s => s.label === 'Categories');
  if (categoryStat) {
    this.categoryService.getCategories().subscribe({
      next: (res) => { categoryStat.value = res?.data?.data?.length || 0; },
      error: () => { categoryStat.value = 0; }
    });
  }

  // ✅ Languages
  // <<< SỬA LẠI: Tìm mục 'Languages' một cách an toàn thay vì dùng stats[3] >>>
  const languageStat = this.stats.find(s => s.label === 'Languages');
  if (languageStat) {
    this.languageService.getLanguages().subscribe({
      next: (res) => { languageStat.value = res?.data?.data?.length || 0; },
      error: () => { languageStat.value = 0; }
    });
  }
}


  // ✅ HÀM NÀY ĐÃ ĐƯỢC SỬA LẠI
  openPostDetailFromHome(postId: number) {
    this.postService.getPostById(postId).subscribe((res: any) => {
      if (res && res.data && res.data.post) {
        // Gán trực tiếp đối tượng post vào selectedPost
        // Chúng ta không cần tìm và thêm `username` nữa vì nó đã có sẵn trong `post.author.username`
        this.selectedPost = res.data.post;
      } else {
        console.error('Không tìm thấy dữ liệu bài viết trong response:', res);
      }
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
