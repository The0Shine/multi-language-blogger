import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CommentSectionComponent } from '../../components/comment-section/comment-section.component';
import { EditorjsRendererPipe } from '../../pipes/editorjs-renderer.pipe';
import { PostService, Post, Comment } from '../../services/post.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CommentSectionComponent,
    EditorjsRendererPipe,
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post: Post | undefined;
  comments: Comment[] = [];
  commentCount = 0;
  newComment = '';
  pagination: any = {};
  loading = false;
  currentPage = 1;
  translations: any[] = []; // Available translations
  availableLanguages: any[] = [];
  originalPostId: string | null = null; // Store original post ID for language switching

  // Professional performance optimizations
  private translationCache = new Map<number, any>(); // Cache translations by languageId
  private isLanguageSwitching = false; // Prevent multiple simultaneous switches
  private lastLanguageId: number | null = null; // Track last language to prevent unnecessary calls

  private routeSubscription?: Subscription;
  private languageSubscription?: Subscription;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private languageService = inject(LanguageService);

  ngOnInit() {
    // Subscribe to route params changes (not just snapshot)
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        console.log('PostDetail: Route changed to post ID:', id);
        // Reset language switching state for new post
        this.isLanguageSwitching = false;
        this.lastLanguageId = null;
        this.translationCache.clear();

        this.loadPost(id);
        this.loadComments(id);
        // loadTranslations is called inside loadPost now
      }
    });

    // Professional language switching with debouncing and performance optimizations
    this.languageSubscription = this.languageService.currentLanguage$
      .pipe(
        debounceTime(150), // Debounce rapid language changes (like Medium/Dev.to)
        distinctUntilChanged(
          (prev, curr) => prev?.languageid === curr?.languageid
        ) // Only emit if language actually changed
      )
      .subscribe({
        next: (language) => {
          if (
            language &&
            this.originalPostId &&
            language.languageid !== this.lastLanguageId
          ) {
            console.log(
              'PostDetail: Language changed to',
              language.language_name,
              'ID:',
              language.languageid
            );
            this.switchToLanguageVersionOptimized(language.languageid);
          } else if (language && !this.lastLanguageId) {
            // Initial language load - just track it
            this.lastLanguageId = language.languageid;
            console.log(
              'PostDetail: Initial language set to',
              language.language_name
            );
          }
        },
        error: (error) => {
          console.error('PostDetail: Language subscription error:', error);
        },
      });
  }

  ngOnDestroy() {
    // Cleanup subscriptions
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadPost(id: string) {
    // Clear previous data
    this.post = undefined;
    this.loading = true;

    this.postService.getPost(+id).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;

        // Store original post ID for language switching
        this.originalPostId = this.post?.originalid
          ? this.post.originalid.toString()
          : id;

        console.log('PostDetail: Loaded post:', post?.title || 'Unknown');
        console.log('PostDetail: Original post ID:', this.originalPostId);
        console.log('PostDetail: Post language:', post?.language?.locale_code);

        // Load translations for language switching
        this.loadTranslations(this.originalPostId);
      },
      error: (error) => {
        console.error('PostDetail: Failed to load post:', error);
        this.loading = false;
      },
    });
  }

  loadTranslations(id: string) {
    // Clear previous translations
    this.translations = [];

    this.postService.getPostTranslations(+id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.translations = response.data.translations || [];
          console.log(
            'PostDetail: Loaded translations:',
            this.translations.length
          );
        }
      },
      error: (error) => {
        console.error('PostDetail: Failed to load translations:', error);
        this.translations = [];
      },
    });
  }

  // Professional optimized language switching (like Medium/Dev.to)
  switchToLanguageVersionOptimized(languageId: number) {
    // Performance guard: Prevent unnecessary operations
    if (
      !this.originalPostId ||
      this.isLanguageSwitching ||
      this.lastLanguageId === languageId
    ) {
      return;
    }

    this.isLanguageSwitching = true;
    this.lastLanguageId = languageId;

    console.log('PostDetail: Optimized language switch to ID:', languageId);

    // Check cache first (like professional sites)
    const cachedTranslation = this.translationCache.get(languageId);
    if (cachedTranslation) {
      console.log('PostDetail: Using cached translation');
      this.loadPostOptimized(cachedTranslation.postid.toString());
      this.isLanguageSwitching = false;
      return;
    }

    // Find translation for the selected language
    const targetTranslation = this.translations.find(
      (t) => t.languageid === languageId
    );

    if (targetTranslation) {
      console.log(
        'PostDetail: Found translation, switching to post:',
        targetTranslation.postid
      );

      // Cache the translation for future use
      this.translationCache.set(languageId, targetTranslation);

      // Load the translation post
      this.loadPostOptimized(targetTranslation.postid.toString());
    } else {
      // Check if current post is already in the target language
      if (this.post?.language?.id === languageId) {
        console.log('PostDetail: Already viewing post in selected language');
        this.isLanguageSwitching = false;
        return;
      }

      // No translation found - try to find post in target language via API
      console.log(
        'PostDetail: No translation found, searching for post in target language'
      );
      this.findPostInTargetLanguage(languageId);
    }
  }

  // Find post in target language when no direct translation exists
  private findPostInTargetLanguage(languageId: number) {
    if (!this.originalPostId) {
      console.error('PostDetail: No original post ID available');
      this.isLanguageSwitching = false;
      return;
    }

    // Try to get the original post and its translations
    this.postService.getPostTranslations(+this.originalPostId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const allTranslations = response.data.translations || [];

          // Update our translations cache
          this.translations = allTranslations;

          // Look for the target language in updated translations
          const targetTranslation = allTranslations.find(
            (t: any) => t.languageid === languageId
          );

          if (targetTranslation) {
            console.log(
              'PostDetail: Found translation via API:',
              targetTranslation.postid
            );
            this.translationCache.set(languageId, targetTranslation);
            this.loadPostOptimized(targetTranslation.postid.toString());
          } else {
            // Still no translation - check if original post is in target language
            this.postService.getPost(+this.originalPostId!).subscribe({
              next: (originalPost) => {
                if (originalPost?.language?.id === languageId) {
                  console.log(
                    'PostDetail: Original post is in target language'
                  );
                  this.loadPostOptimized(this.originalPostId!);
                } else {
                  console.log(
                    'PostDetail: No version available in target language, staying with current'
                  );
                  // Stay with current post but update language tracking
                  this.isLanguageSwitching = false;
                }
              },
              error: (error) => {
                console.error(
                  'PostDetail: Failed to check original post language:',
                  error
                );
                this.isLanguageSwitching = false;
              },
            });
          }
        } else {
          console.log(
            'PostDetail: No translations available, staying with current post'
          );
          this.isLanguageSwitching = false;
        }
      },
      error: (error) => {
        console.error('PostDetail: Failed to fetch translations:', error);
        this.isLanguageSwitching = false;
      },
    });
  }

  // Optimized post loading with minimal UI disruption
  private loadPostOptimized(postId: string) {
    // Don't show full loading state - just update content smoothly
    this.postService.getPost(+postId).subscribe({
      next: (post) => {
        // Smooth content transition (like Medium)
        this.post = post;

        // Update original post ID if needed
        this.originalPostId = this.post?.originalid
          ? this.post.originalid.toString()
          : postId;

        // Load comments in background without disrupting UI
        this.loadCommentsOptimized(postId);

        // Update URL to reflect the new post
        this.updateUrlForPost(postId);

        console.log(
          'PostDetail: Optimized post load complete:',
          post?.title || 'Unknown',
          'Language:',
          post?.language?.locale_code
        );

        // Clear language switching flag
        this.isLanguageSwitching = false;
      },
      error: (error) => {
        console.error('PostDetail: Optimized post load failed:', error);
        // Graceful fallback - don't disrupt user experience
        this.isLanguageSwitching = false;
      },
    });
  }

  // Update URL to reflect current post without triggering reload
  private updateUrlForPost(postId: string) {
    // Only update if the URL postId is different
    const currentPostId = this.route.snapshot.paramMap.get('id');
    if (currentPostId !== postId) {
      this.router.navigate(['/post', postId], { replaceUrl: true });
    }
  }

  // Optimized comment loading
  private loadCommentsOptimized(postId: string) {
    this.postService.getComments(+postId).subscribe({
      next: (result) => {
        this.comments = result.comments;
        this.commentCount = result.pagination?.total || 0;
        this.pagination = result.pagination;
      },
      error: (error) => {
        console.error('PostDetail: Comment load failed:', error);
        // Fail silently - don't disrupt main content
      },
    });
  }

  loadComments(postId: string, page: number = 1) {
    this.loading = true;
    this.postService.getComments(+postId, page).subscribe((result) => {
      if (page === 1) {
        this.comments = result.comments;
      } else {
        this.comments = [...this.comments, ...result.comments];
      }
      this.pagination = result.pagination;
      this.commentCount = result.pagination?.total || this.comments.length;
      this.currentPage = page;
      this.loading = false;
    });
  }

  onSubmitComment() {
    if (this.newComment.trim() && this.post) {
      // For now, using a dummy username. In real app, get from auth service
      // const authorUsername = 'testuser'; // TODO: Get from auth service
      this.postService
        .addComment(this.post.postid, this.newComment)
        .subscribe((comment) => {
          this.comments.unshift(comment); // Add to beginning
          this.newComment = '';
          if (this.post) {
            this.post.comments++;
          }
        });
    }
  }

  onLoadMoreComments() {
    if (this.post && this.currentPage < this.pagination.totalPages) {
      this.loadComments(this.post.postid.toString(), this.currentPage + 1);
    }
  }

  onEditComment(data: { commentId: number; content: string }) {
    this.postService
      .updateComment(data.commentId, data.content)
      .subscribe((updatedComment) => {
        // Update the comment in the local array
        const index = this.comments.findIndex(
          (c) => c.commentid === data.commentId
        );
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
      });
  }

  onNewCommentChange(value: string) {
    this.newComment = value;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  sharePost() {
    // Always copy to clipboard
    this.copyToClipboard();
  }

  private copyToClipboard() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.showShareSuccess();
        })
        .catch(() => {
          this.fallbackCopyToClipboard(url);
        });
    } else {
      this.fallbackCopyToClipboard(url);
    }
  }

  private fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showShareSuccess();
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy link. Please copy manually: ' + text);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  private showShareSuccess() {
    // Simple success feedback - you can replace with a toast/snackbar
    const originalText = 'Share';
    const button = document.querySelector('.share-button');
    if (button) {
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  }
}
