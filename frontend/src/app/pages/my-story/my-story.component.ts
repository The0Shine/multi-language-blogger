import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../services/toast.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import type { Post } from '../../models/database.model';

interface PostFilter {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Component({
  selector: 'app-my-story',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './my-story.component.html',
  styleUrl: './my-story.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyStoryComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Services
  private postService = inject(PostService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public languageService = inject(LanguageService);

  // Data
  posts: Post[] = [];
  loading = false;
  searching = false;

  // Track previous state to avoid unnecessary reloads
  private previousParams: any = null;

  // Filter & Search
  searchDisplayValue = '';
  filter: PostFilter = {
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  };

  // Pagination
  pagination: BackendPagination = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  // UI State
  showFilters = false;
  selectedPosts: number[] = [];
  showDeleteModal = false;
  postToDelete: Post | null = null;
  activeActionMenu: number | null = null;

  // Make Math available in template
  Math = Math;

  // Status options
  statusOptions = [
    { value: 'all', label: 'All Posts' },
    { value: '0', label: 'Pending' }, // Sửa từ 'Peding' thành 'Pending'
    { value: '1', label: 'Published' },
    { value: '-1', label: 'Rejected' },
  ];

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadPosts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // TrackBy function for ngFor optimization
  trackByPostId(_: number, post: Post): number {
    return post.postid;
  }

  // Setup search debounce
  private setupSearchDebounce() {
    this.searchSubject
      .pipe(debounceTime(50), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        if (this.searching) return; // Prevent overlapping API calls
        this.filter.search = searchTerm;
        // Search with any length (including empty for clear)
        this.pagination.page = 1;
        this.performSearch();
      });
  }

  // Search methods - Optimized for INP performance
  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    // Immediate UI update for responsiveness
    this.searchDisplayValue = value;

    // Defer search trigger to next frame to avoid blocking
    requestAnimationFrame(() => {
      this.searchSubject.next(value);
    });
  }

  clearSearch() {
    this.searchDisplayValue = '';
    this.filter.search = '';
    this.pagination.page = 1;
    this.performSearch();
  }

  // Perform search
  private performSearch() {
    this.searching = true;
    // Build params efficiently
    const params = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      search: this.filter.search.trim() || undefined,
      status: this.filter.status !== 'all' ? this.filter.status : undefined,
      startDate: this.filter.dateFrom || undefined,
      endDate: this.filter.dateTo || undefined,
      sortBy: this.filter.sortBy,
      sortOrder: this.filter.sortOrder,
    };

    console.log('Search params:', params);

    this.postService
      .getMyPosts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Direct assignment for better performance
          this.posts = response.data || [];
          this.pagination = response.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          };
          this.searching = false;
          this.cdr.markForCheck();
          this.cdr.markForCheck();
          if (this.searchInput) {
            setTimeout(() => {
              this.searchInput.nativeElement.focus();
              console.log('Focus restored after search');
            }, 0);
          }
        },
        error: (error) => {
          console.error('Error loading posts:', error);
          this.toastService.error('Failed to load posts');
          this.searching = false;
          this.cdr.markForCheck();
          if (this.searchInput) {
            setTimeout(() => {
              this.searchInput.nativeElement.focus();
              console.log('Focus restored after error');
            }, 0);
          }
        },
      });
  }

  // Load posts with filters and pagination
  loadPosts(showSearching = false) {
    const params = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      search:
        this.filter.search.length >= 2 ? this.filter.search.trim() : undefined,
      status: this.filter.status !== 'all' ? this.filter.status : undefined,
      startDate: this.filter.dateFrom || undefined,
      endDate: this.filter.dateTo || undefined,
      sortBy: this.filter.sortBy,
      sortOrder: this.filter.sortOrder,
    };

    const paramsString = JSON.stringify(params);
    if (this.previousParams === paramsString && !showSearching) {
      this.cdr.markForCheck();
      return;
    }
    this.previousParams = paramsString;

    if (this.posts.length === 0) {
      this.loading = true;
    } else if (showSearching) {
      this.searching = true;
    }
    this.cdr.markForCheck();

    console.log('Load posts params:', params);

    this.postService
      .getMyPosts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('🔍 MyStory API response:', response);
          console.log('📝 Posts data:', response.data);
          console.log('📊 Pagination:', response.pagination);

          // Debug first post's dates
          if (response.data && response.data.length > 0) {
            const firstPost = response.data[0];
            console.log('🗓️ First post:', firstPost);
            console.log('🗓️ First post dates:', {
              created_at: firstPost.created_at,
              updated_at: firstPost.updated_at,
              created_type: typeof firstPost.created_at,
              updated_type: typeof firstPost.updated_at,
            });
          }

          // Ensure we have the correct data structure
          this.posts = Array.isArray(response.data) ? [...response.data] : [];
          this.pagination = {
            page: response.pagination?.page || 1,
            limit: response.pagination?.limit || 10,
            total: response.pagination?.total || 0,
            totalPages: response.pagination?.totalPages || 1,
          };

          console.log('✅ Final posts array:', this.posts);
          console.log('✅ Final pagination:', this.pagination);

          this.loading = false;
          this.searching = false;
          this.cdr.detectChanges(); // Force change detection
          if (this.searchInput) {
            setTimeout(() => {
              this.searchInput.nativeElement.focus();
              console.log('Focus restored after load');
            }, 0);
          }
        },
        error: (error) => {
          console.error('Error loading posts:', error);
          this.toastService.error('Failed to load posts');
          this.loading = false;
          this.searching = false;
          this.cdr.markForCheck();
          if (this.searchInput) {
            setTimeout(() => {
              this.searchInput.nativeElement.focus();
              console.log('Focus restored after error');
            }, 0);
          }
        },
      });
  }

  // Filter methods
  toggleFilters() {
    this.showFilters = !this.showFilters;
    this.cdr.markForCheck();
  }

  onFilterChange() {
    this.pagination.page = 1;
    this.loadPosts(true);
  }

  clearFilters() {
    this.filter = {
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
    };
    this.searchDisplayValue = '';
    this.pagination.page = 1;
    this.loadPosts(true);
  }

  // Pagination methods
  goToPage(page: number) {
    if (
      page >= 1 &&
      page <= this.pagination.totalPages &&
      page !== this.pagination.page
    ) {
      this.pagination.page = page;
      this.loadPosts(false);
    }
  }

  previousPage() {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.loadPosts(false);
    }
  }

  nextPage() {
    if (this.pagination.page < this.pagination.totalPages) {
      this.pagination.page++;
      this.loadPosts(false);
    }
  }

  // Selection methods
  togglePostSelection(postId: number) {
    const index = this.selectedPosts.indexOf(postId);
    if (index === -1) {
      this.selectedPosts = [...this.selectedPosts, postId];
    } else {
      this.selectedPosts = this.selectedPosts.filter((id) => id !== postId);
    }
    this.cdr.markForCheck();
  }

  selectAllPosts() {
    if (this.selectedPosts.length === this.posts.length) {
      this.selectedPosts = [];
    } else {
      this.selectedPosts = this.posts.map((post) => post.postid);
    }
    this.cdr.markForCheck();
  }

  // Action menu methods
  toggleActionMenu(postId: number) {
    this.activeActionMenu = this.activeActionMenu === postId ? null : postId;
  }

  closeActionMenu() {
    this.activeActionMenu = null;
  }

  // CRUD operations
  createNewPost() {
    this.router.navigate(['/write']);
  }

  editPost(post: Post) {
    this.closeActionMenu();
    this.router.navigate(['/write', post.postid]);
  }

  viewPost(post: Post) {
    this.closeActionMenu();

    // Chỉ cho phép xem post đã được publish (status = 1)
    if (post.status !== 1) {
      this.toastService.warning(
        this.languageService.translate('message.post_not_published')
      );
      return;
    }

    this.router.navigate(['/post', post.postid]);
  }
  canViewPost(post: Post): boolean {
    return post.status === 1; // Chỉ cho phép xem post published
  }
  confirmDeletePost(post: Post) {
    console.log('🗑️ Confirm delete post:', post);
    this.postToDelete = post;
    this.showDeleteModal = true;
    this.closeActionMenu(); // Close dropdown menu
    this.cdr.markForCheck();

    // Debug modal state
    console.log('📋 Modal state:', {
      showDeleteModal: this.showDeleteModal,
      postToDelete: this.postToDelete?.title,
    });
  }

  deletePost() {
    console.log('🔥 deletePost() method called');

    if (!this.postToDelete) {
      console.warn('⚠️ No post to delete');
      return;
    }

    console.log('🗑️ Deleting post:', this.postToDelete.postid);

    this.postService
      .deletePost(this.postToDelete.postid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Delete response:', response);

          // Remove post from current list immediately (optimistic update)
          if (this.postToDelete) {
            this.posts = this.posts.filter(
              (post) => post.postid !== this.postToDelete!.postid
            );
            this.pagination.total = Math.max(0, this.pagination.total - 1);
            console.log(`🗑️ Removed post ${this.postToDelete.postid} from UI`);
          }

          this.toastService.success(
            this.languageService.translate('message.post_deleted')
          );
          this.showDeleteModal = false;
          this.postToDelete = null;
          this.cdr.markForCheck(); // Force UI update

          // Optional: Reload posts to sync with server (in background)
          // this.loadPosts();
        },
        error: (error) => {
          console.error('❌ Error deleting post:', error);
          this.toastService.error(
            this.languageService.translate('message.error')
          );
          this.showDeleteModal = false;
          this.cdr.markForCheck();
        },
      });
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.postToDelete = null;
    this.cdr.markForCheck();
  }

  // Bulk operations
  bulkDelete() {
    if (this.selectedPosts.length === 0) {
      this.toastService.warning('Please select posts to delete');
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${this.selectedPosts.length} posts?`
      )
    ) {
      this.toastService.info('Bulk delete feature coming soon');
    }
  }

  // Utility methods
  getStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Pending'; // Sửa lỗi chính tả từ 'Peding' thành 'Pending'
      case 1:
        return 'Published';
      case -1:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'status-pending';
      case 1:
        return 'status-published';
      case -1:
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) {
      return 'No date';
    }

    console.log('🗓️ Formatting date:', date, 'Type:', typeof date);

    try {
      let dateObj: Date;

      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        // Handle different date string formats
        dateObj = new Date(date);
      } else {
        console.error('❌ Unsupported date type:', typeof date, date);
        return 'Invalid date';
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.error('❌ Invalid date:', date);
        return 'Invalid date';
      }

      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('❌ Error formatting date:', error, 'Date:', date);
      return 'Invalid date';
    }
  }

  // Clean RTF formatting codes from text
  private cleanRTFCodes(text: string): string {
    if (!text || typeof text !== 'string') return text;

    // Remove RTF formatting codes like {\fn华文楷体\fs16\1che0e0e0}
    return text
      .replace(/\{\\[^}]*\}/g, '') // Remove RTF control codes
      .replace(/\{[^}]*\}/g, '') // Remove any remaining braces content
      .replace(/\\[a-zA-Z]+\d*/g, '') // Remove RTF commands like \fs16
      .replace(/\\\\/g, '\\') // Fix escaped backslashes
      .trim();
  }

  truncateContent(content: string, maxLength = 100): string {
    if (!content) return '';

    try {
      const parsed = JSON.parse(content);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        const textBlocks = parsed.blocks
          .filter(
            (block: any) =>
              block.type === 'paragraph' || block.type === 'header'
          )
          .map((block: any) => this.cleanRTFCodes(block.data?.text || ''))
          .join(' ');

        // Preserve HTML formatting
        const htmlContent = textBlocks || content;

        // Strip HTML tags for length calculation but preserve for display
        const plainText = htmlContent.replace(/<[^>]*>/g, '');

        if (plainText.length <= maxLength) {
          return htmlContent;
        }

        // Truncate while preserving HTML tags
        return this.truncateHtml(htmlContent, maxLength) + '...';
      }
    } catch (e) {
      // If not JSON, use as is
    }

    // Clean RTF codes and strip HTML for length calculation
    const cleanContent = this.cleanRTFCodes(content);
    const plainText = cleanContent.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return content;

    return this.truncateHtml(content, maxLength) + '...';
  }

  // Helper method to truncate HTML content without breaking tags
  private truncateHtml(html: string, maxLength: number): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let textLength = 0;
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      const remainingLength = maxLength - textLength;

      if (textNode.textContent!.length > remainingLength) {
        textNode.textContent = textNode.textContent!.substring(
          0,
          remainingLength
        );
        // Remove any nodes after this one
        let nextNode = walker.nextNode();
        while (nextNode) {
          const nodeToRemove = nextNode;
          nextNode = walker.nextNode();
          nodeToRemove.parentNode?.removeChild(nodeToRemove);
        }
        break;
      }

      textLength += textNode.textContent!.length;
    }

    return tempDiv.innerHTML;
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.pagination.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
