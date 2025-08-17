// Database Models
export interface User {
  userid: number;
  roleid: number;
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  status: number;
  extra_info?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Role {
  roleid: number;
  name: string; // admin, authuser
  updated_at: Date;
  created_at: Date;
  delete_at?: Date;
  status: number;
  description?: string;
}

export interface Language {
  languageid: number;
  language_name: string;
  locale_code: string; // en_US, vi_VN
  status: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Post {
  postid: number;
  userid: number;
  languageid: number;
  originalid?: number;
  title: string;
  status: number; // pending, reject, approve
  content: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Comment {
  commentid: number;
  postid: number;
  author: string;
  content: string;
  left: number; // nested set model: left value
  right: number; // nested set model: right value
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  categoryid: number;
  category_name: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CategoryPost {
  postid: number;
  categoryid: number;
}

// Extended models for UI
export interface PostWithDetails extends Post {
  author: User;
  language: Language;
  categories: Category[];
  comments: Comment[];
}

export interface CommentWithNesting extends Comment {
  level: number;
  children: CommentWithNesting[];
}
