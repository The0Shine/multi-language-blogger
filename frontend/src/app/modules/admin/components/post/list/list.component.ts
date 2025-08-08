import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../post.service';
import { UserService } from '../../../user.service';
import { LanguageService } from '../../../language.service'; // ✅ Thêm service

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


  constructor(
    private router: Router,
    private postService: PostService,
    private userService: UserService,
    private languageService: LanguageService, // ✅ inject languageService
    private route: ActivatedRoute
  ) {}


  loadUsersLanguagesAndPosts() {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;

      this.languageService.getLanguages().subscribe((langs) => {
        this.languages = langs;
        this.loadPosts();
      });
    });
  }

loadPostAndShowModal(id: number) {
  this.postService.getPostById(id).subscribe((post) => {
    this.selectedPost = {
      ...post,
      created_at: post.createdAt ? new Date(post.createdAt) : null
    };
  });
}


loadPosts(): void {
  this.postService.getPosts().subscribe((data) => {
    this.posts = data.map((post) => {
      const user = this.users.find((u) => String(u.id) === String(post.user_id));
      const lang = this.languages.find((l) => String(l.id) === String(post.language_id));
      return {
        ...post,
        created_at: post.createdAt ? new Date(post.createdAt) : null,
        username: user ? user.username : 'Unknown',
        language_name: lang ? lang.language_name : 'Unknown',
        original_id: post.original_id || null,
      };
    });
  });
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
  }

  approvePostFromModal() {
    if (this.selectedPost) {
      this.selectedPost.status = 1;
      this.postService.updatePost(this.selectedPost).subscribe(() => {
        this.loadPosts();
        this.closePostModal();
      });
    }
  }

  rejectPostFromModal() {
    if (this.selectedPost) {
      this.selectedPost.status = 2;
      this.postService.updatePost(this.selectedPost).subscribe(() => {
        this.loadPosts();
        this.closePostModal();
      });
    }
  }


  goToAddPost(): void {
    this.router.navigate(['/admin/post/create']);
  }

  editPost(id: number): void {
    this.router.navigate(['/admin/post/update', id]);
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Published';
      case 2:
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
        const newPage = this.currentPage > maxPage ? maxPage : this.currentPage;

        if (newPage !== this.currentPage) {
          // Chỉ navigate nếu page thay đổi
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: newPage },
            queryParamsHandling: 'merge',
          });
        } else {
          // Nếu không thay đổi page → tự gọi lại loadPosts()
          this.loadPosts();
        }

        this.isSuccess = true;
        setTimeout(() => {
          this.isSuccess = null;
        }, 1000);
      },
      error: () => {
        this.isSuccess = false;
        setTimeout(() => {
          this.isSuccess = null;
        }, 1000);
      }
    });
  }
}

 ngOnInit(): void {
  this.route.queryParams.subscribe((params) => {
    const postId = params['view'];
    if (postId) {
      this.loadPostAndShowModal(Number(postId));
    }

    this.currentPage = +params['page'] || 1;
    this.loadPosts(); // chỉ gọi 1 lần, đúng page
  });

  this.loadUsersLanguagesAndPosts(); // nếu cần, giữ nguyên
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
  if (!this.postToDelete?.id) {
    console.error('Không có ID bài viết để xóa!');
    return;
  }

  this.postService.deletePost(this.postToDelete.id).subscribe({
    next: () => {
      // Cập nhật danh sách tạm thời trước khi reload
      const filtered = this.filteredPosts;
      const totalAfterDelete = filtered.length - 1;
      const maxPage = Math.ceil(totalAfterDelete / this.pageSize);

      // Nếu sau khi xóa trang hiện tại vượt quá max page => lùi về 1 trang
      const newPage =
        this.currentPage > maxPage && this.currentPage > 1
          ? this.currentPage - 1
          : this.currentPage;

      // Cập nhật currentPage + URL
      this.currentPage = newPage;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: this.currentPage },
        queryParamsHandling: 'merge',
      });

      this.loadPosts();
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
