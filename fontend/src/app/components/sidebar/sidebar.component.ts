import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostService, Post } from '../../services/post.service';
import { CategoryService, Category } from '../../services/category.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  staffPicks: Post[] = [];
  recommendedTopics: string[] = [];
  categories: Category[] = [];

  private languageSubscription?: Subscription;
  private currentLanguageId: number | null = null;

  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  ngOnInit() {
    // Load recommended topics (language-independent)
    this.loadRecommendedTopics();

    // Subscribe to language changes with optimization
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (language) => {
        if (language) {
          console.log(
            '🌐 Language changed in sidebar:',
            language.language_name
          );

          const newLanguageId = language.languageid;

          // Only reload if language actually changed
          if (
            this.currentLanguageId !== null &&
            this.currentLanguageId !== newLanguageId
          ) {
            console.log('🔄 Reloading staff picks for new language');
            this.loadStaffPicks();
          } else if (this.currentLanguageId === null) {
            // Initial load
            console.log('📚 Initial staff picks load');
            this.loadStaffPicks();
          }

          this.currentLanguageId = newLanguageId;
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadStaffPicks() {
    const currentLanguage = this.languageService.getCurrentLanguage();
    console.log('📚 Loading staff picks for language:', currentLanguage);

    if (!currentLanguage) {
      console.log('⚠️ No current language available for staff picks');
      return;
    }

    // Use the new pagination API with language filter
    const params = {
      page: 1,
      limit: 50,
      languageid: currentLanguage.languageid,
    };

    this.postService.getPostsWithPagination(params).subscribe({
      next: (response) => {
        const posts = response.data || [];
        console.log(`📚 Received ${posts.length} posts for staff picks`);

        // Since API already filters by language, just sort by comments and take top 3
        this.staffPicks = posts
          .sort((a: Post, b: Post) => {
            return (b.comments || 0) - (a.comments || 0);
          })
          .slice(0, 3);

        console.log(
          `✅ Loaded ${this.staffPicks.length} staff picks for ${currentLanguage.locale_code}:`,
          this.staffPicks.map((p) => ({
            id: p.postid,
            title: p.title,
            lang: p.language?.locale_code,
            comments: p.comments,
          }))
        );
      },
      error: (error) => {
        console.error('❌ Failed to load staff picks:', error);
        // Fallback to legacy method
        this.loadStaffPicksLegacy();
      },
    });
  }

  private loadStaffPicksLegacy() {
    console.log('📚 Using legacy method for staff picks');
    this.postService.getPosts(1, 50).subscribe({
      next: (posts) => {
        const currentLanguage = this.languageService.getCurrentLanguage();

        // Filter original posts only
        const originalPosts = posts.filter((post) => post.originalid === null);

        // Sort by comments
        const topOriginals = originalPosts
          .sort((a, b) => (b.comments || 0) - (a.comments || 0))
          .slice(0, 3);

        // Map to translations if available
        this.staffPicks = topOriginals.map((origPost) => {
          if (!currentLanguage) return origPost;

          const translated = posts.find(
            (p) =>
              p.originalid === origPost.postid &&
              p.language?.id === currentLanguage.languageid
          );
          return translated || origPost;
        });

        console.log(`✅ Legacy staff picks loaded: ${this.staffPicks.length}`);
      },
      error: (error) => {
        console.error('❌ Legacy staff picks also failed:', error);
        this.staffPicks = []; // Clear on error
      },
    });
  }

  loadRecommendedTopics() {
    // Get categories with most posts
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories.filter((cat) => cat.status === 1);
      this.recommendedTopics = this.categories
        .sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
        .slice(0, 7)
        .map((cat) => cat.name);
    });
  }

  getAuthorInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  onStaffPickClick(post: Post) {
    this.router.navigate(['/post', post.postid]);
  }

  onTopicClick(topicName: string) {
    // Find the category by name
    const category = this.categories.find((cat) => cat.name === topicName);
    if (category) {
      // Navigate to home with category filter
      this.router.navigate(['/'], {
        queryParams: { category: category.categoryid },
      });
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1d ago';
    if (diffDays < 30) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
