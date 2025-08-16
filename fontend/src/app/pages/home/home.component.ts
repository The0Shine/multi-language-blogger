import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PostService, Post } from '../../services/post.service';
import { CategoryService, Category } from '../../services/category.service';
import { LanguageService } from '../../services/language.service';
import { catchError, finalize } from 'rxjs/operators';

interface TabCategory {
  categoryid: string | number;
  label: string;
  icon?: string;
  active: boolean;
  badge?: any;
}

interface LoadPostsParams {
  page: number;
  limit: number;
  categoryid?: number;
  languageid?: number;
  searchQuery?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  activeCategory: string | number = 'for-you';
  searchQuery = '';
  isSearching = false;
  isLoadingFromURL = false;

  // Infinite scroll state
  currentPage = 1;
  pageSize = 10;
  hasMorePosts = true;
  loading = false;
  loadingMore = false;

  // State management
  private isProcessingCategoryChange = false;
  private currentLanguageId: number | null = null;

  // Store scroll handler for cleanup with debouncing
  private scrollTimeout: any = null;
  private scrollHandler = () => this.debouncedScroll();

  // Make Math available in template
  Math = Math;

  categories: TabCategory[] = [
    {
      categoryid: 'for-you',
      label: 'All Post',
      icon: 'fas fa-plus',
      active: true,
      badge: undefined,
    },
  ];
  realCategories: Category[] = [];

  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.initializeComponent();
  }

  private initializeComponent() {
    // Load categories first
    this.loadCategories();

    // Handle URL parameters
    this.route.queryParams.subscribe((params) => {
      this.handleUrlParams(params);
    });

    // Handle language changes
    this.languageService.currentLanguage$.subscribe((language) => {
      this.handleLanguageChange(language);
    });
  }

  private handleUrlParams(params: any) {
    console.log('🔍 URL params detected:', params);
    this.isLoadingFromURL = true;

    if (params['search']) {
      this.handleSearchFromUrl(params['search']);
    } else if (params['category']) {
      this.handleCategoryFromUrl(params['category']);
    } else {
      this.handleDefaultLoad();
    }
  }

  private handleSearchFromUrl(searchQuery: string) {
    console.log(`🔍 Search query from URL: "${searchQuery}"`);
    this.searchQuery = searchQuery;
    this.isSearching = true;
    this.performSearch();
    this.clearLoadingFlag(200);
  }

  private handleCategoryFromUrl(categoryId: string) {
    console.log(`🔍 Category filter from URL: ${categoryId}`);
    this.isSearching = false;
    this.activeCategory = Number(categoryId);
    this.loadPostsWithCurrentSettings();

    setTimeout(() => {
      this.selectTab(Number(categoryId));
      this.clearLoadingFlag();
    }, 150);
  }

  private handleDefaultLoad() {
    console.log('🔍 No URL params, loading default posts');
    this.isSearching = false;
    this.activeCategory = 'for-you';
    this.loadPostsWithCurrentSettings();
    this.clearLoadingFlag(100);
  }

  private handleLanguageChange(language: any) {
    if (!language) return;

    console.log('🌐 Language changed:', language.language_name);
    const newLanguageId = language.languageid;

    if (this.isLoadingFromURL) {
      this.currentLanguageId = newLanguageId;
      return;
    }

    if (
      this.currentLanguageId !== null &&
      this.currentLanguageId !== newLanguageId
    ) {
      console.log('🔄 Language changed, reloading content');
      this.resetStateForLanguageChange();
      this.loadCategories();
      this.loadPostsWithCurrentSettings();
    } else if (!this.isSearching) {
      this.loadPostsWithCurrentSettings();
    } else if (this.searchQuery) {
      this.performSearch();
    }

    this.currentLanguageId = newLanguageId;
  }

  private clearLoadingFlag(delay: number = 0) {
    setTimeout(() => {
      this.isLoadingFromURL = false;
    }, delay);
  }

  ngAfterViewInit() {
    // Add scroll listener for infinite scroll
    window.addEventListener('scroll', this.scrollHandler);

    // Keep existing scroll functionality for tabs
    const container = document.getElementById('tabsContainer');
    if (container) {
      container.addEventListener('scroll', () => this.updateScrollButtons());
    }

    window.addEventListener('resize', () => this.updateScrollButtons());
    setTimeout(() => this.updateScrollButtons(), 200);
  }

  ngOnDestroy() {
    // Cleanup scroll listener
    window.removeEventListener('scroll', this.scrollHandler);

    // Cleanup debounce timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  // Unified method to load posts based on current settings
  private loadPostsWithCurrentSettings(reset: boolean = true) {
    console.log('📄 Loading posts with current settings, reset:', reset);

    if (reset) {
      this.currentPage = 1;
      this.hasMorePosts = true;
    }

    this.loading = reset && this.posts.length === 0;
    this.loadingMore = !reset && this.posts.length > 0;

    if (this.isSearching && this.searchQuery.trim()) {
      this.performSearch();
    } else {
      this.performPostLoad();
    }
  }

  // Unified post loading method
  private performPostLoad() {
    const currentLanguage = this.languageService.getCurrentLanguage();
    const params: LoadPostsParams = {
      page: this.currentPage,
      limit: this.pageSize,
      languageid: currentLanguage?.languageid,
    };

    // Add category filter if not 'for-you' or 'following'
    if (
      this.activeCategory !== 'for-you' &&
      this.activeCategory !== 'following'
    ) {
      params.categoryid = this.activeCategory as number;
    }

    console.log('📄 Loading posts with params:', params);

    this.postService
      .getPostsWithPagination(params)
      .pipe(
        catchError((error) => {
          console.error('❌ Post load failed:', error);
          // Fallback: try without category filter
          if (params.categoryid) {
            console.log('🔄 Retrying without category filter...');
            const fallbackParams = { ...params };
            delete fallbackParams.categoryid;
            return this.postService.getPostsWithPagination(fallbackParams);
          }
          // Final fallback: use legacy method
          return this.postService.getPostsByLanguage();
        }),
        finalize(() => {
          this.loading = false;
          this.loadingMore = false;
          this.isProcessingCategoryChange = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Posts loaded successfully:', response);
          this.handlePostsResponse(response);
        },
        error: (error) => {
          console.error('❌ All load methods failed:', error);
          this.handleLoadError(error);
        },
      });
  }

  // Unified search method
  private performSearch() {
    if (!this.searchQuery.trim()) return;

    console.log(`🔍 Performing search: "${this.searchQuery}"`);

    this.postService
      .searchPosts(this.searchQuery.trim())
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingMore = false;
        })
      )
      .subscribe({
        next: (posts) => {
          console.log('✅ Search results:', posts.length, 'posts');
          this.posts = posts;
          this.filteredPosts = posts;
          this.hasMorePosts = false;
        },
        error: (error) => {
          console.error('❌ Search failed:', error);
          this.handleLoadError(error);
        },
      });
  }

  private handlePostsResponse(response: any) {
    const newPosts = response.data || [];
    const pagination = response.pagination || {};

    console.log('🔄 HomeComponent: Received posts:', newPosts.length);
    console.log('🔄 Pagination info:', pagination);

    if (this.currentPage === 1) {
      // First page - replace posts smoothly
      this.posts = newPosts;
    } else {
      // Subsequent pages - append posts
      this.posts = [...this.posts, ...newPosts];
    }

    // Update infinite scroll state
    this.hasMorePosts =
      newPosts.length === this.pageSize &&
      (pagination.totalPages ? this.currentPage < pagination.totalPages : true);

    console.log('🔄 Has more posts:', this.hasMorePosts);
    console.log('🔄 Total posts loaded:', this.posts.length);

    // For home page, posts are already filtered by backend
    this.filteredPosts = this.posts;

    // Clear loading states
    this.loading = false;
    this.loadingMore = false;
  }

  private handleLoadError(error: any) {
    this.loading = false;
    this.loadingMore = false;
    this.isProcessingCategoryChange = false;
    console.error('❌ Load error:', error);

    if (this.currentPage === 1) {
      this.posts = [];
      this.filteredPosts = [];
    }

    this.hasMorePosts = false;
  }

  // Public method for external search calls
  searchPosts(query: string) {
    console.log(`🔍 External search called with query: "${query}"`);
    this.searchQuery = query;
    this.isSearching = true;
    this.performSearch();
  }

  loadCategories() {
    console.log('🏷️ Loading categories...');
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        console.log('✅ Categories loaded:', categories);
        this.realCategories = categories.filter((cat) => cat.status === 1); // Only active categories
        console.log('🔍 Active categories:', this.realCategories);

        // Add real categories to the tabs
        const realCategoryTabs: TabCategory[] = this.realCategories.map(
          (cat) => ({
            categoryid: cat.categoryid,
            label: cat.name,
            active: false,
            badge: undefined,
          })
        );

        // Combine default tabs with real categories
        this.categories = [
          ...this.categories.slice(0, 2), // Keep 'For you' and 'Following'
          ...realCategoryTabs,
        ];
        console.log('📋 Final categories tabs:', this.categories);
      },
      error: (error) => {
        console.error('❌ Error loading categories:', error);
      },
    });
  }

  selectTab(categoryId: string | number) {
    console.log('🔄 selectTab called with categoryId:', categoryId);

    // Prevent multiple simultaneous category changes
    if (this.isProcessingCategoryChange) {
      console.log('⚠️ Category change already in progress, ignoring');
      return;
    }

    // Don't reload if same category
    if (this.activeCategory === categoryId) {
      console.log('ℹ️ Same category selected, no action needed');
      return;
    }

    this.isProcessingCategoryChange = true;
    this.activeCategory = categoryId;

    // Update category states
    this.categories.forEach((category) => {
      category.active = category.categoryid === categoryId;
    });

    // Reset search when changing category
    this.isSearching = false;
    this.searchQuery = '';

    // Load posts for new category using unified method
    this.loadPostsWithCurrentSettings(true);

    // Update URL without triggering navigation
    this.updateUrlParams(categoryId);
  }

  private updateUrlParams(categoryId: string | number) {
    if (categoryId === 'for-you' || categoryId === 'following') {
      // Clear all query params when selecting "All Post" or "Following"
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    } else {
      // Set category param for specific categories
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { category: categoryId },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  // Posts are already filtered by backend, no need for client-side filtering

  navigateToPost(postId: number) {
    this.router.navigate(['/post', postId]);
  }

  // TrackBy function for better performance in *ngFor
  trackByPostId(_index: number, post: any): number {
    return post.postid;
  }

  // Helper methods for state management
  private resetStateForLanguageChange() {
    console.log('🔄 Resetting state for language change');
    this.currentPage = 1;
    this.hasMorePosts = true;
    this.posts = [];
    this.filteredPosts = [];
    this.isSearching = false;
    this.searchQuery = '';
    this.isProcessingCategoryChange = false;
  }

  // Infinite scroll methods
  loadMorePosts() {
    if (
      this.hasMorePosts &&
      !this.loading &&
      !this.loadingMore &&
      !this.isProcessingCategoryChange &&
      !this.isSearching // Don't load more during search
    ) {
      console.log('🔄 Loading more posts, current page:', this.currentPage);
      this.currentPage++;
      this.loadPostsWithCurrentSettings(false); // false = don't reset, append posts
    }
  }

  // Debounced scroll handler for better performance
  private debouncedScroll() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      this.onScroll();
    }, 100); // 100ms debounce
  }

  // Check if user scrolled near bottom
  private onScroll() {
    // Don't check scroll if already loading
    if (this.loading || this.loadingMore || !this.hasMorePosts) {
      return;
    }

    const scrollPosition = window.pageYOffset + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 300; // Load more when 300px from bottom (increased for better UX)

    if (scrollPosition >= documentHeight - threshold) {
      this.loadMorePosts();
    }
  }

  scrollTabs(direction: 'left' | 'right') {
    const container = document.getElementById('tabsContainer');
    if (!container) return;

    const scrollAmount = 200;

    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }

    setTimeout(() => this.updateScrollButtons(), 100);
  }

  updateScrollButtons() {
    const container = document.getElementById('tabsContainer');
    const leftButton = document.getElementById('scrollLeft');
    const rightButton = document.getElementById('scrollRight');

    if (!container || !leftButton || !rightButton) return;

    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (scrollLeft > 0) {
      leftButton.classList.remove('hidden');
    } else {
      leftButton.classList.add('hidden');
    }

    if (scrollLeft < maxScroll - 1) {
      rightButton.classList.remove('hidden');
    } else {
      rightButton.classList.add('hidden');
    }
  }

  getAuthorInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1d ago';
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  getExcerpt(content: any): string {
    try {
      let editorData;
      if (typeof content === 'string') {
        editorData = JSON.parse(content);
      } else {
        editorData = content;
      }

      if (!editorData.blocks || !Array.isArray(editorData.blocks)) {
        return '';
      }

      // Extract text from first few paragraph blocks, preserving HTML formatting
      const textBlocks = editorData.blocks
        .filter(
          (block: any) => block.type === 'paragraph' || block.type === 'header'
        )
        .slice(0, 2)
        .map((block: any) => this.cleanRTFCodes(block.data.text || ''))
        .join(' ');

      // Strip HTML tags for length calculation but preserve for display
      const plainText = textBlocks.replace(/<[^>]*>/g, '');

      if (plainText.length > 150) {
        // Find a good truncation point that doesn't break HTML tags
        const truncated = this.truncateHtml(textBlocks, 150);
        return truncated + '...';
      }

      return textBlocks;
    } catch (error) {
      // Fallback for non-EditorJS content
      const cleanContent = this.cleanRTFCodes(String(content));
      const textContent = cleanContent.replace(/<[^>]*>/g, '');
      return textContent.length > 150
        ? textContent.substring(0, 150) + '...'
        : textContent;
    }
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
}
