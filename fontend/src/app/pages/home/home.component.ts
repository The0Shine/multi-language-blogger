import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PostService, Post } from '../../services/post.service';
import { CategoryService, Category } from '../../services/category.service';
import { LanguageService } from '../../services/language.service';

interface TabCategory {
  categoryid: string | number;
  label: string;
  icon?: string;
  active: boolean;
  badge?: any;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  activeCategory: string | number = 'for-you';
  searchQuery = '';
  isSearching = false;
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
    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe((language) => {
      if (language) {
        console.log(
          'Language changed in HomeComponent:',
          language.language_name
        );
        // Always reload posts when language changes
        this.loadPosts();
      }
    });

    // Check for search query or category filter in URL
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.isSearching = true;
        this.searchPosts(this.searchQuery);
      } else if (params['category']) {
        // Handle category filter from sidebar
        this.isSearching = false;
        this.loadPosts();
        // Set active category after categories are loaded
        setTimeout(() => {
          this.selectTab(Number(params['category']));
        }, 100);
      } else {
        this.isSearching = false;
        this.loadPosts();
      }
    });

    this.loadCategories();
  }

  ngAfterViewInit() {
    const container = document.getElementById('tabsContainer');
    if (container) {
      container.addEventListener('scroll', () => this.updateScrollButtons());
    }

    window.addEventListener('resize', () => this.updateScrollButtons());
    setTimeout(() => this.updateScrollButtons(), 200);
  }

  loadPosts() {
    console.log('HomeComponent: loadPosts called');
    this.postService.getPostsByLanguage().subscribe({
      next: (posts) => {
        console.log('HomeComponent: Received posts:', posts);
        this.posts = posts;
        this.filterPosts();
      },
      error: (error) => {
        console.error('HomeComponent: Failed to load posts:', error);
      },
    });
  }

  searchPosts(query: string) {
    this.postService.searchPosts(query).subscribe((posts) => {
      this.posts = posts;
      this.filteredPosts = posts; // Show all search results
    });
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
    console.log('Active category:', categoryId);
    this.activeCategory = categoryId;
    console.log(this.categories);

    this.categories.forEach((category) => {
      category.active = category.categoryid === categoryId;
    });
    this.filterPosts();

    // Update URL without triggering navigation
    const queryParams =
      categoryId === 'for-you' || categoryId === 'following'
        ? {}
        : { category: categoryId };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  filterPosts() {
    if (
      this.activeCategory === 'for-you' ||
      this.activeCategory === 'following'
    ) {
      // Show all posts for "For you" and "Following"
      this.filteredPosts = this.posts;
    } else {
      // Filter posts by category ID (real categories)
      console.log(this.posts);

      this.filteredPosts = this.posts.filter((post) =>
        post.categories.some(
          (category) => category.categoryid === Number(this.activeCategory)
        )
      );
    }
  }

  navigateToPost(postId: number) {
    this.router.navigate(['/post', postId]);
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
