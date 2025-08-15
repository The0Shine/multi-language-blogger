import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminPostService } from '../../../post.service';
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

  currentPage: number = 1;
  pageSize: number = 5;

  isSuccess: boolean | null = null;
  showDeleteModal: boolean = false;
  postToDelete: any = null;
  totalPosts: number = 0;
  viewId: number | null = null;

  constructor(
    private router: Router,
    private postService: AdminPostService,
    private route: ActivatedRoute
  ) {}

  loadPostAndShowModal(id: number) {
    // ✅ Sử dụng data có sẵn từ posts array
    const post = this.posts.find((p: any) => p.postid === id);
    if (post) {
      this.selectedPost = {
        ...post,
        created_at: post.created_at ? new Date(post.created_at) : null,
        username: post.username || 'Unknown',
      };
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.currentPage = +params['page'] || 1;
      this.viewId = params['view'] ? Number(params['view']) : null;

      this.loadUsersLanguagesAndPosts(this.currentPage);
    });
  }

  loadUsersLanguagesAndPosts(_page: number) {
    // ✅ Chỉ cần load posts vì backend đã include associations
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe((res: any) => {
      console.log('📊 API Response:', res); // Debug log
      const postsData = res?.data?.posts || [];

      this.posts = postsData
        .map((post: any) => {
          return {
            ...post,
            status: Number(post.status),
            created_at: post.created_at ? new Date(post.created_at) : null,
            // ✅ Sử dụng data từ associations
            username: post.author?.username || 'Unknown',
            language_name: post.language?.language_name || 'Unknown',
            original_id: post.originalid || null,
          };
        })
        .sort((a: any, b: any) => a.postid - b.postid);

      // ✅ Sau khi load xong posts, nếu có viewId thì mở modal
      if (this.viewId) {
        this.openPostDetail(this.viewId);
        this.viewId = null; // reset tránh mở lại khi phân trang
      }
    });
  }
  openPostDetail(postId: number) {
    const post = this.posts.find((p) => p.postid === postId);
    if (post) {
      this.selectedPost = post;
      // ⚡ Gọi logic mở modal (tùy HTML, ví dụ dùng Bootstrap modal)
      const modalElement = document.getElementById('postDetailModal');
      if (modalElement) {
        (modalElement as any).style.display = 'block';
      }
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

  // ✅ Parse Editor.js content
  getContentBlocks(content: string): any[] {
    if (!content) return [];

    try {
      const parsedContent = JSON.parse(content);
      return parsedContent.blocks || [];
    } catch (error) {
      console.error('Error parsing content:', error);
      // Fallback for plain text content
      return [
        {
          type: 'paragraph',
          data: {
            text: content,
          },
        },
      ];
    }
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

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.postToDelete = null;
  }
}
