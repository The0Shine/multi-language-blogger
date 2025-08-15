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

  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  ngOnInit() {
    // Load initial data
    this.loadStaffPicks();
    this.loadRecommendedTopics();

    // Subscribe to language changes
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (language) => {
        console.log('🌐 Language changed in sidebar:', language);
        // Reload staff picks for new language
        this.loadStaffPicks();
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

    this.postService.getPosts(1, 50).subscribe((posts) => {
      // Chỉ lấy bài gốc
      const originalPosts = posts.filter((post) => post.originalid === null);

      // Sắp xếp theo comment giảm dần
      const topOriginals = originalPosts
        .sort((a, b) => (b.comments || 0) - (a.comments || 0))
        .slice(0, 3);

      // Map sang bản dịch nếu có
      this.staffPicks = topOriginals.map((origPost) => {
        const translated = posts.find(
          (p) =>
            p.originalid === origPost.postid &&
            p.language.id === currentLanguage?.languageid
        );
        return translated || origPost;
      });

      console.log(
        `✅ Loaded ${this.staffPicks.length} staff picks for ${currentLanguage?.locale_code}`,
        this.staffPicks
      );
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
