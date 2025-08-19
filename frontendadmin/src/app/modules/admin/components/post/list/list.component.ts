import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../post.service';
import { UserService } from '../../../user.service';
import { LanguageService } from '../../../language.service'; // ✅ Thêm service
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-list-post',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class AdminPostListComponent implements OnInit {
  searchText: string = '';
  statusFilter: string | number = '';
  selectedPost: any = null;
  posts: any[] = [];
  users: any[] = [];
  languages: any[] = []; // ✅ lưu danh sách language

  currentPage: number = 1;
  pageSize: number = 5;

  isSuccess: boolean | null = null;
  showDeleteModal: boolean = false;
  postToDelete: any = null;
  totalPosts: number = 0;
  viewId: number | null = null;
  pageSizes = [5, 10, 20, 50];
  pagination: any = {};

  constructor(
    private router: Router,
    private postService: PostService,
    private userService: UserService,
    private languageService: LanguageService, // ✅ inject languageService
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1;
      this.viewId = params['view'] ? Number(params['view']) : null;

      this.loadUsersLanguagesAndPosts(this.currentPage);
    });
  }

  loadUsersLanguagesAndPosts(page: number) {
    forkJoin({
      users: this.userService.getAllUsers(),
      languages: this.languageService.getLanguages(),
    }).subscribe(({ users, languages }: any) => {
      this.users = Array.isArray(users) ? users : users?.data || [];
      this.languages = Array.isArray(languages?.data?.data)
        ? languages.data.data
        : [];

      this.loadPosts(page);
    });
  }

  loadPosts(page: number = 1): void {
    this.postService
      .getAllPosts({ limit: 9999, page: 1 })
      .subscribe((res: any) => {
        const postsArray = res?.data?.posts || [];

        // Lấy hết luôn, không phân trang
        this.posts = postsArray
          .filter((post: any) => String(post.languageid) === '1')
          .map((post: any) => {
            const user = this.users.find(
              (u: any) => String(u.userid) === String(post.userid)
            );
            const lang = this.languages.find(
              (l: any) => String(l.languageid) === String(post.languageid)
            );

            return {
              ...post,
              status: Number(post.status),
              created_at: post.created_at ? new Date(post.created_at) : null,
              username: user?.username || 'Unknown',
              language_name: lang?.language_name || 'Unknown',
              original_id: post.originalid || null,
            };
          })
          .sort((a: any, b: any) => a.postid - b.postid);

        // ❌ Không dùng phân trang trong admin nữa
        this.pagination = null;
      });
  }

  openPostDetail(postId: number): void {
    // Tìm post trong mảng this.posts đã được load và xử lý trước đó
    const postToShow = this.posts.find((p) => p.postid === postId);

    if (postToShow) {
      // Chỉ cần gán vào đây, *ngIf="selectedPost" trong HTML sẽ tự lo việc hiển thị modal
      this.selectedPost = postToShow;
    } else {
      console.error(`Không tìm thấy post với ID: ${postId} trong danh sách.`);
    }
  }

  get filteredPosts() {
    return this.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(this.searchText.toLowerCase()) &&
        (this.statusFilter !== '' ? post.status === +this.statusFilter : true)
    );
  }

  showPostDetail(post: any) {
    this.selectedPost = post;
  }

  closePostModal() {
    this.selectedPost = null;

    // Xóa query param `view` để URL về /admin/post/list
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: null },
      queryParamsHandling: 'merge',
    });
  }

  approvePostFromModal() {
    if (this.selectedPost) {
      this.postService.acceptPost(this.selectedPost.postid).subscribe(() => {
        this.loadPosts();
        this.closePostModal();
      });
    }
  }

  rejectPostFromModal() {
    if (this.selectedPost) {
      this.postService
        .rejectPost(this.selectedPost.postid)
        .subscribe((updatedPost) => {
          this.selectedPost = updatedPost; // cập nhật toàn bộ
          this.loadPosts();
          this.closePostModal();
        });
    }
  }

  editPost(id: number): void {
    this.router.navigate(['/admin/post/update', id]);
  }
  openCreateModal(): void {
    this.router.navigate(['/admin/post/create']);
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Published';
      case -1:
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  }

  paginatedPosts(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPosts.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.currentPage },
        queryParamsHandling: 'merge',
      });
    }
  }
  deletePost(id: number) {
    if (confirm('Bạn có muốn xóa bài Post này không?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          const totalAfterDelete = this.totalPosts - 1;
          const maxPage = Math.ceil(totalAfterDelete / this.pageSize);
          const newPage =
            this.currentPage > maxPage ? maxPage : this.currentPage;

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: newPage },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });

          this.isSuccess = true;
          setTimeout(() => (this.isSuccess = null), 1000);
        },
        error: () => {
          this.isSuccess = false;
          setTimeout(() => (this.isSuccess = null), 1000);
        },
      });
    }
  }

  // Khi tìm kiếm hoặc filter post
  onSearchOrFilterChange() {
    this.currentPage = 1; // reset về trang 1 giống màn user
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge',
    });
  }

  truncateTitle(title: string, wordLimit: number = 10): string {
    if (!title) return '';
    const words = title.split(' ');
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(' ') + '...'
      : title;
  }

  //modal delete
  openDeleteModal(post: any) {
    this.closePostModal(); // đóng modal chi tiết nếu đang mở
    this.postToDelete = { ...post };
    this.showDeleteModal = true;
  }

  confirmDeletePost() {
    if (!this.postToDelete?.postid) {
      console.error('Không có ID bài viết để xóa!');
      return;
    }

    const idToDelete = this.postToDelete.postid;

    this.postService.deletePost(idToDelete).subscribe({
      next: () => {
        this.posts = this.posts.filter(
          (p) => String(p.postid) !== String(idToDelete)
        );

        this.totalPosts = Math.max(0, (this.totalPosts || 0) - 1);

        const itemsOnCurrentPage = this.paginatedPosts().length;
        if (itemsOnCurrentPage === 0 && this.currentPage > 1) {
          this.currentPage = this.currentPage - 1;

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: this.currentPage },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }

        this.isSuccess = true;
        this.closeDeleteModal();
        setTimeout(() => (this.isSuccess = null), 1000);
      },
      error: () => {
        this.isSuccess = false;
        setTimeout(() => (this.isSuccess = null), 1000);
      },
    });
  }

  onPageSizeChange(event: any) {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.postToDelete = null;
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
