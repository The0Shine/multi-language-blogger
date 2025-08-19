import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

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
    this.getAvailableLanguages().subscribe({
      next: (languages) => {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
          try {
            const language = JSON.parse(savedLanguage);

            // Check valid từ list vừa lấy
            const isValid = languages.some(
              (lang) =>
                lang.languageid === language.languageid &&
                lang.locale_code === language.locale_code
            );

            if (isValid) {
              console.log(
                'LanguageService: Loaded valid saved language:',
                language.language_name
              );
              this.currentLanguageSubject.next(language);
              this.loadTranslations(language.locale_code);
              return;
            }
          } catch (error) {
            console.error(
              'LanguageService: Error parsing saved language:',
              error
            );
          }
        }

        // Nếu không hợp lệ thì fallback mặc định
        this.setCurrentLanguage(
          languages[1] ?? {
            languageid: 1,
            language_name: 'English',
            locale_code: 'en',
            status: 1,
            created_at: new Date(),
            updated_at: new Date(),
          }
        );
      },
      error: (error) => {
        console.error('LanguageService: Failed to load languages:', error);
        // fallback hardcoded
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
    return this.httpService
      .get<any>('/languages', { onlyActive: 'true' }) // ✅ Bỏ wrapper "params"
      .pipe(
        map((response: any) => {
          if (response.success && response.data) {
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
      de: 'de',
      ko: 'ko_KR',
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
        'common.saving': 'Saving...',
        'common.processing': 'Processing...',
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
        'profile.password_hint': 'Password must be at least 6 characters',
        'profile.char_limit': 'Character limit: {{max}}',
        'profile.password_strength': 'Password strength',

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
      es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.write': 'Escribir',
        'nav.profile': 'Perfil',
        'nav.login': 'Iniciar sesión',
        'nav.register': 'Registrarse',
        'nav.logout': 'Cerrar sesión',
        'nav.my_stories': 'Mis historias',

        // Common
        'common.loading': 'Cargando...',
        'common.save': 'Guardar',
        'common.saving': 'Guardando...',
        'common.processing': 'Procesando...',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.publish': 'Publicar',
        'common.draft': 'Borrador',
        'common.search': 'Buscar',
        'common.language': 'Idioma',

        // Posts
        'post.title': 'Título',
        'post.content': 'Contenido',
        'post.author': 'Autor',
        'post.created_at': 'Creado el',
        'post.read_more': 'Leer más',
        'post.comments': 'Comentarios',
        'post.no_posts': 'No se encontraron publicaciones',

        // Comments
        'comment.add': 'Agregar comentario',
        'comment.reply': 'Responder',
        'comment.no_comments': 'Aún no hay comentarios',
        'comment.placeholder': 'Escribir un comentario...',

        // Profile
        'profile.title': 'Información del perfil',
        'profile.first_name': 'Nombre',
        'profile.last_name': 'Apellido',
        'profile.username': 'Nombre de usuario',
        'profile.email': 'Correo electrónico',
        'profile.update': 'Actualizar perfil',
        'profile.change_password': 'Cambiar contraseña',
        'profile.current_password': 'Contraseña actual',
        'profile.new_password': 'Nueva contraseña',
        'profile.confirm_password': 'Confirmar contraseña',
        'profile.danger_zone': 'Zona peligrosa',
        'profile.delete_account': 'Eliminar cuenta',
        'profile.delete_my_account': 'Eliminar mi cuenta',
        'profile.delete_account_info':
          'Eliminar tu cuenta borrará todas tus publicaciones y comentarios.',
        'profile.password_hint':
          'La contraseña debe tener al menos 6 caracteres',
        'profile.char_limit': 'Límite de caracteres: {{max}}',
        'profile.password_strength': 'Seguridad de la contraseña',

        // My Stories
        'mystories.title': 'Tus historias',
        'mystories.subtitle':
          'Gestiona y rastrea tus historias publicadas y borradores',
        'mystories.write_new': 'Escribir nueva historia',
        'mystories.view_story': 'Ver historia',
        'mystories.edit_story': 'Editar historia',
        'mystories.delete_story': 'Eliminar historia',
        'mystories.last_edited': 'Última edición',
        'mystories.no_posts': 'No se encontraron historias',
        'mystories.confirm_delete': 'Confirmar eliminación',
        'mystories.delete_warning':
          '¿Estás seguro de que quieres eliminar esta historia?',
        'mystories.delete_info':
          'Todas las traducciones de esta historia también serán eliminadas.',
        'mystories.cannot_undo': 'Esta acción no se puede deshacer',

        // Messages
        'message.success': '¡Éxito!',
        'message.error': 'Ocurrió un error',
        'message.post_created': 'Publicación creada exitosamente',
        'message.post_updated': 'Publicación actualizada exitosamente',
        'message.post_deleted': 'Publicación eliminada exitosamente',
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
        'common.saving': 'Đang lưu...',
        'common.processing': 'Đang xử lý...',
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
        'profile.danger_zone': 'Vùng nguy hiểm',
        'profile.delete_account': 'Xóa tài khoản',
        'profile.delete_my_account': 'Xóa tài khoản của tôi',
        'profile.delete_account_info':
          'Xóa tài khoản sẽ xóa tất cả bài viết và bình luận của bạn.',
        'profile.password_hint': 'Mật khẩu phải có ít nhất 6 ký tự',
        'profile.char_limit': 'Giới hạn ký tự: {{max}}',
        'profile.password_strength': 'Độ mạnh mật khẩu',

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
        'nav.register': "S'inscrire",
        'nav.logout': 'Déconnexion',
        'nav.my_stories': 'Mes histoires',

        // Common
        'common.loading': 'Chargement...',
        'common.save': 'Enregistrer',
        'common.saving': 'Enregistrement...',
        'common.processing': 'Traitement...',
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
        'profile.username': "Nom d'utilisateur",
        'profile.email': 'Email',
        'profile.update': 'Mettre à jour le profil',
        'profile.change_password': 'Changer le mot de passe',
        'profile.current_password': 'Mot de passe actuel',
        'profile.new_password': 'Nouveau mot de passe',
        'profile.confirm_password': 'Confirmer le mot de passe',
        'profile.danger_zone': 'Zone dangereuse',
        'profile.delete_account': 'Supprimer le compte',
        'profile.delete_my_account': 'Supprimer mon compte',
        'profile.delete_account_info':
          'Supprimer votre compte supprimera tous vos articles et commentaires.',
        'profile.password_hint':
          'Le mot de passe doit contenir au moins 6 caractères',
        'profile.char_limit': 'Limite de caractères: {{max}}',
        'profile.password_strength': 'Force du mot de passe',

        // My Stories
        'mystories.title': 'Vos histoires',
        'mystories.subtitle':
          'Gérez et suivez vos histoires publiées et brouillons',
        'mystories.write_new': 'Écrire une nouvelle histoire',
        'mystories.view_story': "Voir l'histoire",
        'mystories.edit_story': "Modifier l'histoire",
        'mystories.delete_story': "Supprimer l'histoire",
        'mystories.last_edited': 'Dernière modification',
        'mystories.no_posts': 'Aucune histoire trouvée',
        'mystories.confirm_delete': 'Confirmer la suppression',
        'mystories.delete_warning':
          'Êtes-vous sûr de vouloir supprimer cette histoire ?',
        'mystories.delete_info':
          'Toutes les traductions de cette histoire seront également supprimées.',
        'mystories.cannot_undo': 'Cette action ne peut pas être annulée',

        // Messages
        'message.success': 'Succès !',
        'message.error': 'Une erreur est survenue',
        'message.post_created': 'Article créé avec succès',
        'message.post_updated': 'Article mis à jour avec succès',
        'message.post_deleted': 'Article supprimé avec succès',
      },

      de: {
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
        'common.saving': 'Wird gespeichert...',
        'common.processing': 'Wird verarbeitet...',
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
        'profile.danger_zone': 'Gefahrenzone',
        'profile.delete_account': 'Konto löschen',
        'profile.delete_my_account': 'Mein Konto löschen',
        'profile.delete_account_info':
          'Das Löschen Ihres Kontos entfernt alle Ihre Beiträge und Kommentare.',
        'profile.password_hint': 'Passwort muss mindestens 6 Zeichen haben',
        'profile.char_limit': 'Zeichenlimit: {{max}}',
        'profile.password_strength': 'Passwortstärke',

        // My Stories
        'mystories.title': 'Ihre Geschichten',
        'mystories.subtitle':
          'Verwalten und verfolgen Sie Ihre veröffentlichten Geschichten und Entwürfe',
        'mystories.write_new': 'Neue Geschichte schreiben',
        'mystories.view_story': 'Geschichte anzeigen',
        'mystories.edit_story': 'Geschichte bearbeiten',
        'mystories.delete_story': 'Geschichte löschen',
        'mystories.last_edited': 'Zuletzt bearbeitet',
        'mystories.no_posts': 'Keine Geschichten gefunden',
        'mystories.confirm_delete': 'Löschen bestätigen',
        'mystories.delete_warning':
          'Sind Sie sicher, dass Sie diese Geschichte löschen möchten?',
        'mystories.delete_info':
          'Alle Übersetzungen dieser Geschichte werden ebenfalls gelöscht.',
        'mystories.cannot_undo':
          'Diese Aktion kann nicht rückgängig gemacht werden',

        // Messages
        'message.success': 'Erfolg!',
        'message.error': 'Ein Fehler ist aufgetreten',
        'message.post_created': 'Beitrag erfolgreich erstellt',
        'message.post_updated': 'Beitrag erfolgreich aktualisiert',
        'message.post_deleted': 'Beitrag erfolgreich gelöscht',
      },

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
        'common.saving': '저장 중...',
        'common.processing': '처리 중...',
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
        'profile.danger_zone': '위험 구역',
        'profile.delete_account': '계정 삭제',
        'profile.delete_my_account': '내 계정 삭제',
        'profile.delete_account_info':
          '계정을 삭제하면 모든 게시물과 댓글이 제거됩니다.',
        'profile.password_hint': '비밀번호는 최소 6자 이상이어야 합니다',
        'profile.char_limit': '문자 제한: {{max}}',
        'profile.password_strength': '비밀번호 강도',

        // My Stories
        'mystories.title': '내 이야기',
        'mystories.subtitle': '게시된 이야기와 초안을 관리하고 추적하세요',
        'mystories.write_new': '새 이야기 작성',
        'mystories.view_story': '이야기 보기',
        'mystories.edit_story': '이야기 편집',
        'mystories.delete_story': '이야기 삭제',
        'mystories.last_edited': '마지막 편집',
        'mystories.no_posts': '이야기를 찾을 수 없습니다',
        'mystories.confirm_delete': '삭제 확인',
        'mystories.delete_warning': '이 이야기를 삭제하시겠습니까?',
        'mystories.delete_info': '이 이야기의 모든 번역도 삭제됩니다.',
        'mystories.cannot_undo': '이 작업은 되돌릴 수 없습니다',

        // Messages
        'message.success': '성공!',
        'message.error': '오류가 발생했습니다',
        'message.post_created': '게시물이 성공적으로 생성되었습니다',
        'message.post_updated': '게시물이 성공적으로 업데이트되었습니다',
        'message.post_deleted': '게시물이 성공적으로 삭제되었습니다',
      },

      'zh-CN': {
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
        'common.saving': '保存中...',
        'common.processing': '处理中...',
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
        'profile.danger_zone': '危险区域',
        'profile.delete_account': '删除账户',
        'profile.delete_my_account': '删除我的账户',
        'profile.delete_account_info': '删除您的账户将移除所有您的文章和评论。',
        'profile.password_hint': '密码必须至少6个字符',
        'profile.char_limit': '字符限制：{{max}}',
        'profile.password_strength': '密码强度',

        // My Stories
        'mystories.title': '您的文章',
        'mystories.subtitle': '管理和跟踪您已发布的文章和草稿',
        'mystories.write_new': '写新文章',
        'mystories.view_story': '查看文章',
        'mystories.edit_story': '编辑文章',
        'mystories.delete_story': '删除文章',
        'mystories.last_edited': '最后编辑',
        'mystories.no_posts': '未找到文章',
        'mystories.confirm_delete': '确认删除',
        'mystories.delete_warning': '您确定要删除这篇文章吗？',
        'mystories.delete_info': '这篇文章的所有翻译也将被删除。',
        'mystories.cannot_undo': '此操作无法撤销',

        // Messages
        'message.success': '成功！',
        'message.error': '发生错误',
        'message.post_created': '文章创建成功',
        'message.post_updated': '文章更新成功',
        'message.post_deleted': '文章删除成功',
      },
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
