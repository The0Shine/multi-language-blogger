import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { map } from 'rxjs/operators';

export interface Language {
  languageid: number;
  language_name: string;
  locale_code: string;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface Translation {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language | null>(null);
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translationsSubject = new BehaviorSubject<Translation>({});
  public translations$ = this.translationsSubject.asObservable();

  private availableLanguages: Language[] = [];

  constructor(private httpService: HttpService) {
    this.initializeLanguage();
  }

  private initializeLanguage() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      try {
        const language = JSON.parse(savedLanguage);
        console.log(
          'LanguageService: Loaded saved language:',
          language.language_name
        );
        this.currentLanguageSubject.next(language);
        this.loadTranslations(language.locale_code);
      } catch (error) {
        console.error('LanguageService: Error parsing saved language:', error);
        this.setDefaultLanguage();
      }
    } else {
      console.log('LanguageService: No saved language, setting default');
      this.setDefaultLanguage();
    }
  }

  private setDefaultLanguage() {
    // Load from API instead of hardcoded default
    this.getAvailableLanguages().subscribe({
      next: (languages) => {
        if (languages && languages.length > 0) {
          // Set first language as default (usually English)
          console.log(
            'LanguageService: Setting default language:',
            languages[0].language_name
          );
          this.setCurrentLanguage(languages[0]);
        } else {
          console.warn('LanguageService: No languages available from API');
        }
      },
      error: (error) => {
        console.error(
          'LanguageService: Failed to load default language:',
          error
        );
        // Hardcoded fallback
        this.setCurrentLanguage({
          languageid: 1,
          language_name: 'English',
          locale_code: 'en',
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        });
      },
    });
  }

  // Get all available languages from backend
  getAvailableLanguages(): Observable<Language[]> {
    return this.httpService.get<any>('/languages').pipe(
      map((response: any) => {
        if (response.success && response.data) {
          // Handle nested data structure: response.data.data contains the array
          const languagesArray = response.data.data || response.data;
          this.availableLanguages = languagesArray;
          console.log('Languages loaded:', languagesArray);

          return languagesArray;
        } else {
          console.error('Languages API failed:', response);
          this.availableLanguages = [];
          return [];
        }
      })
    );
  }

  // Set current language
  setCurrentLanguage(language: Language) {
    console.log('LanguageService: Setting current language to:', language);
    this.currentLanguageSubject.next(language);
    localStorage.setItem('selectedLanguage', JSON.stringify(language));
    this.loadTranslations(language.locale_code);
  }

  // Get current language
  getCurrentLanguage(): Language | null {
    return this.currentLanguageSubject.value;
  }

  // Load translations for a specific locale
  private loadTranslations(localeCode: string) {
    // TODO: Load translations from backend API
    // For now, use basic hardcoded translations
    const translations = this.getTranslationsForLocale(localeCode);
    this.translationsSubject.next(translations);
  }

  // Get translation for a key
  translate(key: string, params?: { [key: string]: string }): string {
    const translations = this.translationsSubject.value;
    let translation = translations[key] || key;

    // Replace parameters in translation
    if (params) {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }

    return translation;
  }

  // Get translations for a specific locale
  private getTranslationsForLocale(localeCode: string): Translation {
    // Map short codes to long codes for backward compatibility
    const localeMapping: { [key: string]: string } = {
      en: 'en_US',
      vi: 'vi_VN',
      fr: 'fr_FR',
      zh: 'zh_CN',
    };

    const mappedLocale = localeMapping[localeCode] || localeCode;
    console.log(
      `LanguageService: Mapping locale '${localeCode}' to '${mappedLocale}'`
    );

    const translations: { [locale: string]: Translation } = {
      en_US: {
        // Navigation
        'nav.home': 'Home',
        'nav.write': 'Write',
        'nav.profile': 'Profile',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'nav.logout': 'Logout',
        'nav.my_stories': 'My Stories',

        // Common
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.publish': 'Publish',
        'common.draft': 'Draft',
        'common.search': 'Search',
        'common.language': 'Language',

        // Posts
        'post.title': 'Title',
        'post.content': 'Content',
        'post.author': 'Author',
        'post.created_at': 'Created at',
        'post.read_more': 'Read more',
        'post.comments': 'Comments',
        'post.no_posts': 'No posts found',

        // Comments
        'comment.add': 'Add comment',
        'comment.reply': 'Reply',
        'comment.no_comments': 'No comments yet',
        'comment.placeholder': 'Write a comment...',

        // Profile
        'profile.title': 'Profile Information',
        'profile.first_name': 'First Name',
        'profile.last_name': 'Last Name',
        'profile.username': 'Username',
        'profile.email': 'Email',
        'profile.update': 'Update Profile',
        'profile.change_password': 'Change Password',
        'profile.current_password': 'Current Password',
        'profile.new_password': 'New Password',
        'profile.confirm_password': 'Confirm Password',
        'profile.danger_zone': 'Danger Zone',
        'profile.delete_account': 'Delete Account',
        'profile.delete_my_account': 'Delete My Account',
        'profile.delete_account_info':
          'Deleting your account will remove all your posts and comments.',
        'profile.password_hint': 'Password must be at least 8 characters',
        'profile.char_limit': 'Character limit',

        // My Stories
        'mystories.title': 'Your stories',
        'mystories.subtitle':
          'Manage and track your published stories and drafts',
        'mystories.write_new': 'Write new story',
        'mystories.view_story': 'View story',
        'mystories.edit_story': 'Edit story',
        'mystories.delete_story': 'Delete story',
        'mystories.last_edited': 'Last edited',
        'mystories.no_posts': 'No stories found',
        'mystories.confirm_delete': 'Confirm Delete',
        'mystories.delete_warning':
          'Are you sure you want to delete this story?',
        'mystories.delete_info':
          'All translations of this story will also be deleted.',
        'mystories.cannot_undo': 'This action cannot be undone',

        // Messages
        'message.success': 'Success!',
        'message.error': 'Error occurred',
        'message.post_created': 'Post created successfully',
        'message.post_updated': 'Post updated successfully',
        'message.post_deleted': 'Post deleted successfully',
      },

      vi_VN: {
        // Navigation
        'nav.home': 'Trang chủ',
        'nav.write': 'Viết bài',
        'nav.profile': 'Hồ sơ',
        'nav.login': 'Đăng nhập',
        'nav.register': 'Đăng ký',
        'nav.logout': 'Đăng xuất',
        'nav.my_stories': 'Bài viết của tôi',

        // Common
        'common.loading': 'Đang tải...',
        'common.save': 'Lưu',
        'common.cancel': 'Hủy',
        'common.delete': 'Xóa',
        'common.edit': 'Chỉnh sửa',
        'common.publish': 'Xuất bản',
        'common.draft': 'Bản nháp',
        'common.search': 'Tìm kiếm',
        'common.language': 'Ngôn ngữ',

        // Posts
        'post.title': 'Tiêu đề',
        'post.content': 'Nội dung',
        'post.author': 'Tác giả',
        'post.created_at': 'Ngày tạo',
        'post.read_more': 'Đọc thêm',
        'post.comments': 'Bình luận',
        'post.no_posts': 'Không tìm thấy bài viết',

        // Comments
        'comment.add': 'Thêm bình luận',
        'comment.reply': 'Trả lời',
        'comment.no_comments': 'Chưa có bình luận',
        'comment.placeholder': 'Viết bình luận...',

        // Profile
        'profile.title': 'Thông tin hồ sơ',
        'profile.first_name': 'Tên',
        'profile.last_name': 'Họ',
        'profile.username': 'Tên đăng nhập',
        'profile.email': 'Email',
        'profile.update': 'Cập nhật hồ sơ',
        'profile.change_password': 'Đổi mật khẩu',
        'profile.current_password': 'Mật khẩu hiện tại',
        'profile.new_password': 'Mật khẩu mới',
        'profile.confirm_password': 'Xác nhận mật khẩu',
        'profile.danger_zone': 'Khu vực nguy hiểm',
        'profile.delete_account': 'Xóa tài khoản',
        'profile.delete_my_account': 'Xóa tài khoản của tôi',
        'profile.delete_account_info':
          'Xóa tài khoản sẽ xóa tất cả bài viết và bình luận của bạn.',
        'profile.password_hint': 'Mật khẩu phải có ít nhất 8 ký tự',
        'profile.char_limit': 'Ký tự tối đa',

        // My Stories
        'mystories.title': 'Bài viết của bạn',
        'mystories.subtitle':
          'Quản lý và theo dõi các bài viết đã xuất bản và bản nháp',
        'mystories.write_new': 'Viết bài mới',
        'mystories.view_story': 'Xem bài viết',
        'mystories.edit_story': 'Chỉnh sửa bài viết',
        'mystories.delete_story': 'Xóa bài viết',
        'mystories.last_edited': 'Chỉnh sửa lần cuối',
        'mystories.no_posts': 'Không tìm thấy bài viết',
        'mystories.confirm_delete': 'Xác nhận xóa',
        'mystories.delete_warning': 'Bạn có chắc chắn muốn xóa bài viết này?',
        'mystories.delete_info':
          'Tất cả bản dịch của bài viết này cũng sẽ bị xóa.',
        'mystories.cannot_undo': 'Hành động này không thể hoàn tác',

        // Messages
        'message.success': 'Thành công!',
        'message.error': 'Có lỗi xảy ra',
        'message.post_created': 'Tạo bài viết thành công',
        'message.post_updated': 'Cập nhật bài viết thành công',
        'message.post_deleted': 'Xóa bài viết thành công',
      },
      fr_FR: {
        // Navigation
        'nav.home': 'Accueil',
        'nav.write': 'Écrire',
        'nav.profile': 'Profil',
        'nav.login': 'Connexion',
        'nav.register': 'S’inscrire',
        'nav.logout': 'Déconnexion',
        'nav.my_stories': 'Mes histoires',

        // Common
        'common.loading': 'Chargement...',
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler',
        'common.delete': 'Supprimer',
        'common.edit': 'Modifier',
        'common.publish': 'Publier',
        'common.draft': 'Brouillon',
        'common.search': 'Rechercher',
        'common.language': 'Langue',

        // Posts
        'post.title': 'Titre',
        'post.content': 'Contenu',
        'post.author': 'Auteur',
        'post.created_at': 'Créé le',
        'post.read_more': 'Lire la suite',
        'post.comments': 'Commentaires',
        'post.no_posts': 'Aucun article trouvé',

        // Comments
        'comment.add': 'Ajouter un commentaire',
        'comment.reply': 'Répondre',
        'comment.no_comments': 'Pas encore de commentaires',
        'comment.placeholder': 'Écrire un commentaire...',

        // Profile
        'profile.title': 'Informations du profil',
        'profile.first_name': 'Prénom',
        'profile.last_name': 'Nom',
        'profile.username': 'Nom d’utilisateur',
        'profile.email': 'Email',
        'profile.update': 'Mettre à jour le profil',
        'profile.change_password': 'Changer le mot de passe',
        'profile.current_password': 'Mot de passe actuel',
        'profile.new_password': 'Nouveau mot de passe',
        'profile.confirm_password': 'Confirmer le mot de passe',
        'profile.danger_zone': 'Danger Zone',
        'profile.delete_account': 'Delete Account',
        'profile.delete_my_account': 'Delete My Account',
        'profile.delete_account_info':
          'Deleting your account will remove all your posts and comments.',
        'profile.password_hint': 'Password must be at least 8 characters',
        'profile.char_limit': 'Character limit',

        // My Stories
        'mystories.title': 'Your stories',
        'mystories.subtitle':
          'Manage and track your published stories and drafts',
        'mystories.write_new': 'Write new story',
        'mystories.view_story': 'View story',
        'mystories.edit_story': 'Edit story',
        'mystories.delete_story': 'Delete story',
        'mystories.last_edited': 'Last edited',
        'mystories.no_posts': 'No stories found',
        'mystories.confirm_delete': 'Confirm Delete',
        'mystories.delete_warning':
          'Are you sure you want to delete this story?',
        'mystories.delete_info':
          'All translations of this story will also be deleted.',
        'mystories.cannot_undo': 'This action cannot be undone',

        // Messages
        'message.success': 'Succès !',
        'message.error': 'Une erreur est survenue',
        'message.post_created': 'Article créé avec succès',
        'message.post_updated': 'Article mis à jour avec succès',
        'message.post_deleted': 'Article supprimé avec succès',
      },

      // ===== de_DE =====
      de_DE: {
        // Navigation
        'nav.home': 'Startseite',
        'nav.write': 'Schreiben',
        'nav.profile': 'Profil',
        'nav.login': 'Anmelden',
        'nav.register': 'Registrieren',
        'nav.logout': 'Abmelden',
        'nav.my_stories': 'Meine Geschichten',

        // Common
        'common.loading': 'Wird geladen...',
        'common.save': 'Speichern',
        'common.cancel': 'Abbrechen',
        'common.delete': 'Löschen',
        'common.edit': 'Bearbeiten',
        'common.publish': 'Veröffentlichen',
        'common.draft': 'Entwurf',
        'common.search': 'Suche',
        'common.language': 'Sprache',

        // Posts
        'post.title': 'Titel',
        'post.content': 'Inhalt',
        'post.author': 'Autor',
        'post.created_at': 'Erstellt am',
        'post.read_more': 'Weiterlesen',
        'post.comments': 'Kommentare',
        'post.no_posts': 'Keine Beiträge gefunden',

        // Comments
        'comment.add': 'Kommentar hinzufügen',
        'comment.reply': 'Antworten',
        'comment.no_comments': 'Noch keine Kommentare',
        'comment.placeholder': 'Kommentar schreiben...',

        // Profile
        'profile.title': 'Profilinformationen',
        'profile.first_name': 'Vorname',
        'profile.last_name': 'Nachname',
        'profile.username': 'Benutzername',
        'profile.email': 'E-Mail',
        'profile.update': 'Profil aktualisieren',
        'profile.change_password': 'Passwort ändern',
        'profile.current_password': 'Aktuelles Passwort',
        'profile.new_password': 'Neues Passwort',
        'profile.confirm_password': 'Passwort bestätigen',
        'profile.danger_zone': 'Danger Zone',
        'profile.delete_account': 'Delete Account',
        'profile.delete_my_account': 'Delete My Account',
        'profile.delete_account_info':
          'Deleting your account will remove all your posts and comments.',
        'profile.password_hint': 'Password must be at least 8 characters',
        'profile.char_limit': 'Character limit',

        // My Stories
        'mystories.title': 'Your stories',
        'mystories.subtitle':
          'Manage and track your published stories and drafts',
        'mystories.write_new': 'Write new story',
        'mystories.view_story': 'View story',
        'mystories.edit_story': 'Edit story',
        'mystories.delete_story': 'Delete story',
        'mystories.last_edited': 'Last edited',
        'mystories.no_posts': 'No stories found',
        'mystories.confirm_delete': 'Confirm Delete',
        'mystories.delete_warning':
          'Are you sure you want to delete this story?',
        'mystories.delete_info':
          'All translations of this story will also be deleted.',
        'mystories.cannot_undo': 'This action cannot be undone',

        // Messages
        'message.success': 'Erfolg!',
        'message.error': 'Ein Fehler ist aufgetreten',
        'message.post_created': 'Beitrag erfolgreich erstellt',
        'message.post_updated': 'Beitrag erfolgreich aktualisiert',
        'message.post_deleted': 'Beitrag erfolgreich gelöscht',
      },

      // ===== ko_KR =====
      ko_KR: {
        // Navigation
        'nav.home': '홈',
        'nav.write': '작성하기',
        'nav.profile': '프로필',
        'nav.login': '로그인',
        'nav.register': '가입하기',
        'nav.logout': '로그아웃',
        'nav.my_stories': '내 이야기',

        // Common
        'common.loading': '로딩 중...',
        'common.save': '저장',
        'common.cancel': '취소',
        'common.delete': '삭제',
        'common.edit': '편집',
        'common.publish': '게시',
        'common.draft': '초안',
        'common.search': '검색',
        'common.language': '언어',

        // Posts
        'post.title': '제목',
        'post.content': '내용',
        'post.author': '작성자',
        'post.created_at': '작성일',
        'post.read_more': '더 보기',
        'post.comments': '댓글',
        'post.no_posts': '게시물이 없습니다',

        // Comments
        'comment.add': '댓글 추가',
        'comment.reply': '답글',
        'comment.no_comments': '댓글이 없습니다',
        'comment.placeholder': '댓글 작성...',

        // Profile
        'profile.title': '프로필 정보',
        'profile.first_name': '이름',
        'profile.last_name': '성',
        'profile.username': '사용자 이름',
        'profile.email': '이메일',
        'profile.update': '프로필 업데이트',
        'profile.change_password': '비밀번호 변경',
        'profile.current_password': '현재 비밀번호',
        'profile.new_password': '새 비밀번호',
        'profile.confirm_password': '비밀번호 확인',
        'profile.danger_zone': 'Danger Zone',
        'profile.delete_account': 'Delete Account',
        'profile.delete_my_account': 'Delete My Account',
        'profile.delete_account_info':
          'Deleting your account will remove all your posts and comments.',
        'profile.password_hint': 'Password must be at least 8 characters',
        'profile.char_limit': 'Character limit',

        // My Stories
        'mystories.title': 'Your stories',
        'mystories.subtitle':
          'Manage and track your published stories and drafts',
        'mystories.write_new': 'Write new story',
        'mystories.view_story': 'View story',
        'mystories.edit_story': 'Edit story',
        'mystories.delete_story': 'Delete story',
        'mystories.last_edited': 'Last edited',
        'mystories.no_posts': 'No stories found',
        'mystories.confirm_delete': 'Confirm Delete',
        'mystories.delete_warning':
          'Are you sure you want to delete this story?',
        'mystories.delete_info':
          'All translations of this story will also be deleted.',
        'mystories.cannot_undo': 'This action cannot be undone',

        // Messages
        'message.success': '성공!',
        'message.error': '오류가 발생했습니다',
        'message.post_created': '게시물이 성공적으로 생성되었습니다',
        'message.post_updated': '게시물이 성공적으로 업데이트되었습니다',
        'message.post_deleted': '게시물이 성공적으로 삭제되었습니다',
      },

      // ===== zh_CN =====
      zh_CN: {
        // Navigation
        'nav.home': '首页',
        'nav.write': '写文章',
        'nav.profile': '个人资料',
        'nav.login': '登录',
        'nav.register': '注册',
        'nav.logout': '退出登录',
        'nav.my_stories': '我的文章',

        // Common
        'common.loading': '加载中...',
        'common.save': '保存',
        'common.cancel': '取消',
        'common.delete': '删除',
        'common.edit': '编辑',
        'common.publish': '发布',
        'common.draft': '草稿',
        'common.search': '搜索',
        'common.language': '语言',

        // Posts
        'post.title': '标题',
        'post.content': '内容',
        'post.author': '作者',
        'post.created_at': '创建时间',
        'post.read_more': '阅读更多',
        'post.comments': '评论',
        'post.no_posts': '没有找到文章',

        // Comments
        'comment.add': '添加评论',
        'comment.reply': '回复',
        'comment.no_comments': '暂无评论',
        'comment.placeholder': '写评论...',

        // Profile
        'profile.title': '个人资料信息',
        'profile.first_name': '名字',
        'profile.last_name': '姓氏',
        'profile.username': '用户名',
        'profile.email': '邮箱',
        'profile.update': '更新资料',
        'profile.change_password': '修改密码',
        'profile.current_password': '当前密码',
        'profile.new_password': '新密码',
        'profile.confirm_password': '确认密码',
        'profile.danger_zone': 'Danger Zone',
        'profile.delete_account': 'Delete Account',
        'profile.delete_my_account': 'Delete My Account',
        'profile.delete_account_info':
          'Deleting your account will remove all your posts and comments.',
        'profile.password_hint': 'Password must be at least 8 characters',
        'profile.char_limit': 'Character limit',

        // My Stories
        'mystories.title': 'Your stories',
        'mystories.subtitle':
          'Manage and track your published stories and drafts',
        'mystories.write_new': 'Write new story',
        'mystories.view_story': 'View story',
        'mystories.edit_story': 'Edit story',
        'mystories.delete_story': 'Delete story',
        'mystories.last_edited': 'Last edited',
        'mystories.no_posts': 'No stories found',
        'mystories.confirm_delete': 'Confirm Delete',
        'mystories.delete_warning':
          'Are you sure you want to delete this story?',
        'mystories.delete_info':
          'All translations of this story will also be deleted.',
        'mystories.cannot_undo': 'This action cannot be undone',

        // Messages
        'message.success': '成功！',
        'message.error': '发生错误',
        'message.post_created': '文章创建成功',
        'message.post_updated': '文章更新成功',
        'message.post_deleted': '文章删除成功',
      },
      // TODO: de_DE, ko_KR — sẽ copy từ en_US làm mặc định để không thiếu key
    };

    const result = translations[mappedLocale] || translations['en_US'];
    console.log(
      `LanguageService: Using translations for '${mappedLocale}', found: ${!!translations[
        mappedLocale
      ]}`
    );
    return result;
  }
}
