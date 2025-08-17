import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Import NavigationEnd
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators'; // Import filter operator
import { EditorStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery = '';
  currentUser: User | null = null;
  showUserMenu = false;
  showLanguageMenu = false;

  // Language properties
  currentLanguage: any = {
    code: 'en_US',
    name: 'English',
    flag: '🇺🇸',
  };

  availableLanguages: any[] = [];

  private headerHeight = 57;
  private lastScrollTop = 0;
  private ticking = false;
  private authSubscription?: Subscription;
  private editorStateSubscription?: Subscription;

  // New properties for write page header
  showWritePageControls = false;
  isSaving = false;
  lastSaved: Date | null = null;
  isEditMode = false;

  // Thêm biến để biết đang ở trang /write/:id (edit mode)
  isWriteEditMode = false;

  private router = inject(Router);
  private authService = inject(AuthService);
  public languageService = inject(LanguageService);
  private editorStateService = inject(EditorStateService);

  // Route tracking for smart language switching
  currentRoute = '';
  currentPostId: string | null = null;

  ngOnInit() {
    // Initialize scroll handling
    this.setupScrollHandler();

    // Track current route for smart language switching
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        // Extract post ID if on post detail page
        const postMatch = event.url.match(/\/post\/(\d+)/);
        this.currentPostId = postMatch ? postMatch[1] : null;
      });

    // Load saved language from localStorage
    this.loadSavedLanguage();

    // Load available languages from database
    this.loadAvailableLanguages();

    // Subscribe to authentication state
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
      }
    });

    // Subscribe to router events to detect route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Show write page controls for both /write and /write/:id (edit mode)
        this.showWritePageControls =
          event.urlAfterRedirects === '/write' ||
          event.urlAfterRedirects.startsWith('/write/');
      });

    // Subscribe to editor state changes
    this.editorStateSubscription = this.editorStateService.isSaving$.subscribe(
      (saving) => {
        this.isSaving = saving;
      }
    );
    this.editorStateService.lastSaved$.subscribe((date) => {
      this.lastSaved = date;
    });
    this.editorStateService.isEditMode$.subscribe((editMode) => {
      this.isEditMode = editMode;
      console.log('Edit mode changed:', editMode);
    });

    this.router.events.subscribe(() => {
      const url = this.router.url;
      this.isWriteEditMode = /^\/write\/\d+/.test(url);
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.editorStateSubscription) {
      this.editorStateSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.requestTick();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.showUserMenu = false;
    }
    if (!target.closest('.language-selector')) {
      this.showLanguageMenu = false;
    }
  }

  private setupScrollHandler() {
    // Get header height after view init
    setTimeout(() => {
      const headerElement = document.getElementById('mainHeader');
      if (headerElement) {
        this.headerHeight = headerElement.offsetHeight;
      }
    }, 0);
  }

  private requestTick() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.handleScroll();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private handleScroll() {
    const header = document.getElementById('mainHeader')!;
    const navTabs = document.getElementById('navTabs');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    const delta = scrollTop - this.lastScrollTop;

    // Lấy vị trí hiện tại của header (transform: translateY)
    const currentY =
      Number.parseFloat(
        header.style.transform.replace('translateY(', '').replace('px)', '')
      ) || 0;

    // Cập nhật theo delta: cuộn xuống thì header đi lên (-), cuộn lên thì header đi xuống (+)
    let newY = currentY - delta;

    // Giới hạn: chỉ cho phép trượt trong khoảng từ 0 đến -headerHeight
    newY = Math.min(0, Math.max(newY, -this.headerHeight));

    // Áp dụng translateY cho header
    header.style.transform = `translateY(${newY}px)`;

    // NavTabs bám ngay phía dưới header, khi header ẩn hoàn toàn thì nav dính ở top
    if (navTabs) {
      if (newY <= -this.headerHeight) {
        // Header ẩn hoàn toàn -> navigation dính ở top
        navTabs.style.top = '0px';
        console.log('Nav fixed at top');
      } else {
        // Header vẫn hiện -> navigation bám theo header
        navTabs.style.top = `${this.headerHeight + newY}px`;
        console.log('Nav following header:', this.headerHeight + newY);
      }
    }

    // Cập nhật scrollTop cũ
    this.lastScrollTop = scrollTop;
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Navigate to home with search query
      this.router.navigate(['/'], {
        queryParams: { search: this.searchQuery.trim() },
      });
    }
  }

  navigateToWrite() {
    if (this.currentUser) {
      this.router.navigate(['/write']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateHome() {
    this.router.navigate(['/']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }

  navigateToMyStory() {
    this.router.navigate(['/my-story']);
    this.showUserMenu = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';

    const firstName = this.currentUser.first_name || '';
    const lastName = this.currentUser.last_name || '';

    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (lastName) {
      return lastName[0].toUpperCase();
    } else if (this.currentUser.username) {
      return this.currentUser.username[0].toUpperCase();
    }

    return 'U';
  }

  // New method to trigger publish modal in WriteComponent
  onPublishClick() {
    this.editorStateService.publishClicked();
  }

  // Language selector methods
  loadSavedLanguage() {
    // Subscribe to LanguageService current language (single source of truth)
    this.languageService.currentLanguage$.subscribe((language) => {
      if (language) {
        // Map LanguageService format to HeaderComponent format
        this.currentLanguage = {
          code: language.locale_code,
          name: language.language_name,
          flag: this.getLanguageFlag(language.locale_code),
          languageid: language.languageid,
        };
        console.log(
          'HeaderComponent: Language updated from service:',
          this.currentLanguage
        );
      }
    });
  }

  loadAvailableLanguages() {
    this.languageService.getAvailableLanguages().subscribe({
      next: (languages) => {
        // Ensure languages is an array
        if (!Array.isArray(languages)) {
          console.error('Languages is not an array:', languages);
          this.availableLanguages = [];
          return;
        }

        // Map database languages to header format
        this.availableLanguages = languages.map((lang) => ({
          code: lang.locale_code,
          name: lang.language_name,
          flag: this.getLanguageFlag(lang.locale_code),
          languageid: lang.languageid,
          status: lang.status,
        }));

        // Update current language if it was loaded from localStorage
        if (this.currentLanguage && this.currentLanguage.code) {
          const foundLang = this.availableLanguages.find(
            (lang) => lang.code === this.currentLanguage.code
          );
          if (foundLang) {
            this.currentLanguage = foundLang;
          }
        } else {
          // No saved language, set English as default
          this.setDefaultEnglishLanguage();
        }
      },
      error: (error) => {
        console.error('Error loading languages from database:', error);
        // Fallback to English if API fails
        this.setFallbackEnglishLanguage();
      },
    });
  }

  // Set default English language
  private setDefaultEnglishLanguage() {
    const englishLang = this.availableLanguages.find(
      (lang) => lang.code === 'en_US'
    );
    if (englishLang) {
      console.log('HeaderComponent: Setting default English language');
      this.selectLanguage(englishLang);
    }
  }

  // Fallback when API fails
  private setFallbackEnglishLanguage() {
    this.availableLanguages = [
      {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        languageid: 1,
      },
    ];

    this.currentLanguage = this.availableLanguages[0];
    console.log('HeaderComponent: Using fallback English language');

    // Also set in LanguageService
    this.languageService.setCurrentLanguage({
      languageid: 1,
      language_name: 'English',
      locale_code: 'en',
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  private getLanguageFlag(localeCode: string): string {
    const flags: { [key: string]: string } = {
      // Existing languages
      en_US: '🇺🇸',
      en: '🇺🇸',
      vi_VN: '🇻🇳',
      vi: '🇻🇳',
      fr_FR: '🇫🇷',
      fr: '🇫🇷',
      // New languages
      es_ES: '🇪🇸',
      es: '🇪🇸',
      'zh-CN': '🇨🇳',
      zh_CN: '🇨🇳',
      zh: '🇨🇳',
      de_DE: '🇩🇪',
      de: '🇩🇪',
    };

    return flags[localeCode] || '🌍';
  }

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
    // Close user menu if open
    if (this.showLanguageMenu) {
      this.showUserMenu = false;
    }
  }

  selectLanguage(language: any) {
    this.currentLanguage = language;
    this.showLanguageMenu = false;

    // Save to localStorage
    localStorage.setItem('selectedLanguage', JSON.stringify(language));

    // Integrate with LanguageService
    const languageData = {
      languageid:
        language.languageid || this.availableLanguages.indexOf(language) + 1,
      language_name: language.name,
      locale_code: language.code,
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log(
      'HeaderComponent: Calling setCurrentLanguage with:',
      languageData
    );

    // Professional approach: Just emit language change, let components handle themselves
    // No manual navigation - prevents page reload and maintains scroll position
    this.languageService.setCurrentLanguage(languageData);
  }

  getCurrentLanguageFlag(): string {
    return this.currentLanguage?.flag || '🌍';
  }

  getCurrentLanguageName(): string {
    return this.currentLanguage?.name || 'Language';
  }

  // formatLastSaved(): string {
  //   if (!this.lastSaved) return '';

  //   const now = new Date();
  //   const diff = now.getTime() - this.lastSaved.getTime();
  //   const minutes = Math.floor(diff / 60000);

  //   if (minutes < 1) return 'Saved just now';
  //   if (minutes === 1) return 'Saved 1 minute ago';
  //   if (minutes < 60) return `Saved ${minutes} minutes ago`;

  //   const hours = Math.floor(minutes / 60);
  //   if (hours === 1) return 'Saved 1 hour ago';
  //   if (hours < 24) return `Saved ${hours} hours ago`;

  //   return this.lastSaved.toLocaleDateString();
  // }
}
