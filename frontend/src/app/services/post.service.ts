import { Injectable } from '@angular/core';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { HttpService } from './http.service';
import { LanguageService } from './language.service';

// Backend response interfaces
interface BackendPost {
  postid: number;
  title: string;
  content: any;
  author: {
    userid: number;
    first_name: string;
    last_name: string;
    username: string;
  };
  language: {
    languageid: number;
    name: string;
    locale_code: string;
  };
  categories: {
    categoryid: number;
    category_name: string;
  }[];
  created_at: string;
  status: number;
}

// Frontend interface
export interface Post {
  postid: number;
  title: string;
  content: any; // EditorJS block content
  originalid?: number; // For translations, links to original post
  author: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    is_deleted?: boolean;
  };
  language: {
    id: number;
    name: string;
    locale_code: string;
  };
  categories: {
    categoryid: number;
    name: string;
  }[];
  created_at: Date;
  updated_at: Date;
  comments: number;
  comment_count?: number; // Explicit comment count from database
  status?: number; // 0: pending, 1: approved, 2: rejected
}

// API Response types - defined inline where needed

export interface Comment {
  commentid: number;
  author: string; // username for backward compatibility
  content: string;
  created_at: Date;
  authorUser?: {
    userid: number;
    first_name: string;
    last_name: string;
    username: string;
  };
}

export interface CreatePostRequest {
  title: string;
  content: string;
  languageid?: number; // Use languageid to match backend
  categoryids?: number[];
  status?: number;
  userid: number;
  create_for_all_languages?: boolean; // New option to create for all languages
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  languageid?: number; // Use languageid to match backend
  categoryids?: number[];
  status?: number;
}

export interface CreatePostResponse {
  success: boolean;
  data: {
    postid: number;
    post?: Post;
  };
  message?: string;
}

export interface SearchPostsResponse {
  success: boolean;
  data: {
    items: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export interface SearchPostsParams {
  search: string;
  page?: number;
  limit?: number;
  categoryid?: number;
  languageid?: number;
  sortBy?: string;
  sortOrder?: string;
  startDate?: string;
  endDate?: string;
}

// Removed PostsResponse - using standardized ApiResponse instead

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(
    private httpService: HttpService,
    private languageService: LanguageService
  ) {}

  getPosts(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<Post[]> {
    const params: any = { page, limit };
    if (status) {
      params.status = status;
    }

    return this.httpService.get<any>('/posts', params).pipe(
      map((response: any) => {
        // Backend returns response.data.posts, not response.data.items
        const posts: BackendPost[] = response.data?.posts || [];
        return posts.map((post: BackendPost) => this.mapPostToFrontend(post));
      })
    );
  }

  getPost(id: number): Observable<Post | undefined> {
    return this.httpService.get<any>(`/posts/${id}`).pipe(
      map((response: any) => {
        const postData: BackendPost = response.data.post;
        return this.mapPostToFrontend(postData);
      })
    );
  }

  // Get posts with language filter
  getPostsByLanguage(languageId?: number): Observable<Post[]> {
    const currentLanguage = this.languageService.getCurrentLanguage();
    const targetLanguageId = languageId || currentLanguage?.languageid || 1;

    console.log('Current language object:', currentLanguage);
    console.log('Target language ID:', targetLanguageId);

    const params = {
      languageid: targetLanguageId,
    };

    console.log('Request params:', params);

    return this.httpService.get<any>('/posts', params).pipe(
      map((response: any) => {
        const posts = response.data?.posts || response.data?.items || [];
        console.log(
          `Loaded ${posts.length} posts for language ${targetLanguageId}`
        );
        return posts.map((post: BackendPost) => this.mapPostToFrontend(post));
      })
    );
  }

  getMyPosts(params?: any): Observable<any> {
    const queryParams = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search || '',
      status: params?.status,
      startDate: params?.startDate,
      endDate: params?.endDate,
      sortBy: params?.sortBy || 'created_at',
      sortOrder: params?.sortOrder || 'desc',
    };

    // Remove undefined values
    Object.keys(queryParams).forEach((key) => {
      if (
        (queryParams as any)[key] === undefined ||
        (queryParams as any)[key] === ''
      ) {
        delete (queryParams as any)[key];
      }
    });

    return this.httpService.get<any>('/posts/my-posts', queryParams).pipe(
      map((response: any) => {
        console.log('🔍 PostService getMyPosts response:', response);

        // Return backend structure directly
        const responseData = response.data;
        // Backend now returns standardized 'items' format
        const posts: BackendPost[] = responseData.items || [];
        const pagination = responseData.pagination || {};

        console.log('📝 Raw posts from backend:', posts);
        console.log('📊 Raw pagination from backend:', pagination);

        const mappedPosts = posts.map((post: BackendPost) =>
          this.mapPostToFrontend(post)
        );
        console.log('✅ Mapped posts:', mappedPosts);

        return {
          data: mappedPosts,
          pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 10,
            total: pagination.total || 0,
            totalPages: pagination.totalPages || 1,
          },
        };
      })
    );
  }

  createPost(postData: CreatePostRequest): Observable<CreatePostResponse> {
    // Auto-add current language if not specified
    const postDataWithLanguage = {
      ...postData,
      languageid: postData.languageid || 1, // Use languageid from Language
    };

    return this.httpService.post<any>('/posts', postDataWithLanguage).pipe(
      map((response: any) => {
        return {
          success: response.success || true,
          data: {
            postid: response.data?.postid || response.data?.post?.postid,
            post: response.data?.post
              ? this.mapPostToFrontend(response.data.post)
              : undefined,
          },
          message: response.message,
        };
      })
    );
  }

  // Create post for all active languages
  createPostForAllLanguages(
    postData: CreatePostRequest
  ): Observable<CreatePostResponse> {
    const postDataWithFlag = {
      ...postData,
      create_for_all_languages: true,
    };

    return this.createPost(postDataWithFlag);
  }

  // Get all translations of a post
  getPostTranslations(postId: number): Observable<any> {
    return this.httpService.get<any>(`/posts/${postId}/translations`).pipe(
      map((response: any) => {
        return {
          success: response.success || true,
          data: response.data,
          message: response.message,
        };
      })
    );
  }

  updatePost(id: number, postData: UpdatePostRequest): Observable<Post> {
    return this.httpService.put<any>(`/posts/${id}`, postData).pipe(
      map((response: any) => {
        const post: BackendPost = response.data.post || response.data;
        return this.mapPostToFrontend(post);
      })
    );
  }

  deletePost(id: number): Observable<any> {
    return this.httpService
      .delete<any>(`/posts/${id}`)
      .pipe(map((response: any) => response.data));
  }

  getComments(
    postId: number,
    page: number = 1,
    limit: number = 10
  ): Observable<{ comments: Comment[]; pagination: any }> {
    const params = { page, limit };
    return this.httpService.get<any>(`/posts/${postId}/comments`, params).pipe(
      map((response: any) => {
        const comments: any[] = response.data.items;
        const pagination = response.data.pagination;
        return {
          comments: comments.map((comment: any) =>
            this.mapDbCommentToComment(comment)
          ),
          pagination,
        };
      })
    );
  }

  addComment(postId: number, content: string): Observable<Comment> {
    return this.httpService
      .post<any>(`/posts/${postId}/comments`, { content })
      .pipe(
        map((response: any) => {
          const commentData = response.data.comment || response.data;
          return this.mapDbCommentToComment(commentData);
        })
      );
  }

  updateComment(commentId: number, content: string): Observable<Comment> {
    return this.httpService
      .put<any>(`/comments/${commentId}`, { content })
      .pipe(
        map((response) => {
          // Handle standardized API response: {success, status, message, data: {comment: {}}, timestamp}
          const commentData = (response.data as any)?.comment || response.data;
          return this.mapDbCommentToComment(commentData);
        })
      );
  }

  deleteComment(commentId: number): Observable<any> {
    return this.httpService
      .delete<any>(`/comments/${commentId}`)
      .pipe(map((response) => response.data));
  }

  searchPosts(
    query: string,
    page: number = 1,
    limit: number = 10,
    categoryid?: number,
    sortBy?: string,
    sortOrder?: string,
    startDate?: string,
    endDate?: string
  ): Observable<Post[]> {
    const params: SearchPostsParams = { search: query, page, limit };

    // Add current language to search
    const currentLanguage = this.languageService.getCurrentLanguage();
    if (currentLanguage) {
      params.languageid = currentLanguage.languageid;
      console.log(
        `🌍 Full-Text Searching in language: ${currentLanguage.language_name} (${currentLanguage.languageid})`
      );
    }

    // Add optional parameters
    if (categoryid) params.categoryid = categoryid;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    console.log('🔍 Full-Text Search with params:', params);

    return this.httpService.get<any>('/posts/search', params).pipe(
      map((response: any) => {
        console.log('🔍 Full-Text Search response:', response);

        // Handle consistent response format: { data: { items: [], pagination: {} } }
        const posts: BackendPost[] = response.data?.items || [];

        console.log('🔍 Full-Text Search results:', posts.length);
        return posts.map((post: BackendPost) => this.mapPostToFrontend(post));
      })
    );
  }

  // Get search suggestions
  getSearchSuggestions(query: string): Observable<string[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    return this.httpService
      .get<any>('/posts/search/suggestions', { q: query.trim() })
      .pipe(
        map((response: any) => {
          console.log('🔍 Search suggestions response:', response);
          return response.data?.suggestions || [];
        }),
        catchError((error) => {
          console.error('Error getting search suggestions:', error);
          return of([]);
        })
      );
  }

  // Enhanced search with pagination info
  searchPostsWithPagination(
    query: string,
    page: number = 1,
    limit: number = 10,
    categoryid?: number,
    sortBy?: string,
    sortOrder?: string,
    startDate?: string,
    endDate?: string
  ): Observable<{ data: Post[]; pagination: any }> {
    const params: SearchPostsParams = { search: query, page, limit };

    // Add current language to search
    const currentLanguage = this.languageService.getCurrentLanguage();
    if (currentLanguage) {
      params.languageid = currentLanguage.languageid;
      console.log(
        `🌍 Searching with pagination in language: ${currentLanguage.language_name} (${currentLanguage.languageid})`
      );
    }

    // Add optional parameters
    if (categoryid) params.categoryid = categoryid;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    console.log('🔍 Searching posts with pagination:', params);

    return this.httpService.get<any>('/posts/search', params).pipe(
      map((response: any) => {
        console.log('🔍 Search response with pagination:', response);

        const posts: BackendPost[] = response.data?.items || [];
        const pagination = response.data?.pagination || {};

        return {
          data: posts.map((post: BackendPost) => this.mapPostToFrontend(post)),
          pagination,
        };
      }),
      catchError((error) => {
        console.error(
          '🔍 PostService: searchPostsWithPagination error:',
          error
        );
        throw error;
      })
    );
  }

  // Enhanced search with pagination (new unified method)
  searchPostsUnified(params: any): Observable<any> {
    console.log(
      '🔍 PostService: searchPostsWithPagination called with params:',
      params
    );

    const queryParams: any = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams[key] = params[key];
      }
    });

    return this.httpService.get<any>('/posts/search', queryParams).pipe(
      map((response: any) => {
        console.log('🔍 Search response with pagination:', response);

        if (!response.success) {
          throw new Error(response.message || 'Search failed');
        }

        const posts: BackendPost[] =
          response.data?.items || response.data?.posts || [];
        const backendPagination = response.data?.pagination || {};

        // Map backend pagination structure to frontend expected structure
        const pagination = {
          page: backendPagination.currentPage || backendPagination.page || 1,
          limit:
            backendPagination.itemsPerPage || backendPagination.limit || 10,
          total:
            backendPagination.totalItems ||
            backendPagination.total ||
            posts.length,
          totalPages:
            backendPagination.totalPages || Math.ceil(posts.length / 10),
        };

        console.log('🔍 Backend search pagination:', backendPagination);
        console.log('🔍 Mapped search pagination:', pagination);

        return {
          data: posts.map((post: BackendPost) => this.mapPostToFrontend(post)),
          pagination,
        };
      }),
      catchError((error) => {
        console.error(
          '🔍 PostService: searchPostsWithPagination error:',
          error
        );
        throw error;
      })
    );
  }

  // Get posts with pagination for home page
  getPostsWithPagination(params: any): Observable<any> {
    console.log(
      '📄 PostService: getPostsWithPagination called with params:',
      params
    );

    const queryParams: any = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams[key] = params[key];
      }
    });

    return this.httpService.get<any>('/posts', queryParams).pipe(
      map((response: any) => {
        console.log('📄 Posts response with pagination:', response);

        if (!response.success) {
          throw new Error(response.message || 'Failed to retrieve posts');
        }

        // Backend returns different structure for posts endpoint
        const posts: BackendPost[] =
          response.data?.posts || response.data?.items || [];
        const backendPagination = response.data?.pagination || {};

        // Map backend pagination structure to frontend expected structure
        const pagination = {
          page: backendPagination.currentPage || 1,
          limit: backendPagination.itemsPerPage || 10,
          total: backendPagination.totalItems || posts.length,
          totalPages:
            backendPagination.totalPages || Math.ceil(posts.length / 10),
        };

        console.log('🔄 Backend pagination:', backendPagination);
        console.log('🔄 Mapped pagination:', pagination);

        return {
          data: posts.map((post: BackendPost) => this.mapPostToFrontend(post)),
          pagination,
        };
      }),
      catchError((error) => {
        console.error('📄 PostService: getPostsWithPagination error:', error);
        throw error;
      })
    );
  }

  private mapPostToFrontend(post: any): Post {
    if (!post) {
      throw new Error('Post data is null or undefined');
    }

    return {
      postid: post.postid,
      title: post.title,
      content: post.content,
      originalid: post.originalid,
      author: {
        id: post.author?.userid,
        name: post.author
          ? post.author.deleted_at
            ? 'Deleted User'
            : `${post.author.first_name || ''} ${
                post.author.last_name || ''
              }`.trim()
          : 'Unknown Author',
        first_name: post.author?.deleted_at
          ? ''
          : post.author?.first_name || '',
        last_name: post.author?.deleted_at ? '' : post.author?.last_name || '',
        username: post.author?.deleted_at
          ? 'deleted_user'
          : post.author?.username || 'unknown',
        is_deleted: !!post.author?.deleted_at,
      },
      language: {
        id: post.language?.languageid || 1,
        name: post.language?.language_name || 'English',
        locale_code: post.language?.locale_code || 'en_US',
      },
      categories:
        post.categories && Array.isArray(post.categories)
          ? post.categories.map((c: any) => ({
              categoryid: c.categoryid,
              name: c.category_name,
            }))
          : [],
      created_at: new Date(post.created_at),
      updated_at: new Date(post.updated_at || post.created_at),
      comments:
        post.comment_count ||
        (post.comments && Array.isArray(post.comments)
          ? post.comments.length
          : 0),
      comment_count: post.comment_count || 0,
      status: post.status,
    };
  }

  private mapDbCommentToComment(comment: any): Comment {
    if (!comment) {
      throw new Error('Comment data is null or undefined');
    }

    return {
      commentid: comment.commentid,
      author: comment.author,
      content: comment.content,
      created_at: new Date(comment.created_at),
      authorUser: comment.authorUser
        ? {
            userid: comment.authorUser.userid,
            first_name: comment.authorUser.first_name,
            last_name: comment.authorUser.last_name,
            username: comment.authorUser.username,
          }
        : undefined,
    };
  }
}
