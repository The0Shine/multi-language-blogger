import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private storageKey = 'posts';

  private defaultPosts = [
    {
      postid: 1,
      title: 'Welcome to the Blog',
      author: 'Admin',
      status: 1,
      content: `<p>Welcome to our blog! Here you will find <strong>latest updates</strong>, tutorials, and more.</p>`
    },
    {
      postid: 2,
      title: 'How to Use Categories',
      author: 'Jane',
      status: 0,
      content: `<p>This post explains how to use categories...</p>`
    }
  ];

  constructor() {
    // Nếu localStorage chưa có thì khởi tạo dữ liệu mặc định
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultPosts));
    }
  }

  getPosts() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }
addPost(post: any) {
  const posts = this.getPosts();
  post.postid = posts.length ? Math.max(...posts.map((p: any) => p.postid)) + 1 : 1;
  post.createdAt = new Date().toISOString();

  // nếu không có status từ form thì mặc định là Pending Review
  if (post.status === undefined || post.status === null) {
    post.status = 0;
  }

  posts.push(post);
  localStorage.setItem(this.storageKey, JSON.stringify(posts));
}

updatePost(updatedPost: any) {
  const posts = this.getPosts();
  const index = posts.findIndex((p: any) => p.postid === updatedPost.postid);
  if (index !== -1) {
    posts[index] = updatedPost;
    localStorage.setItem(this.storageKey, JSON.stringify(posts));
  }
}


  deletePost(postid: number) {
    const posts = this.getPosts().filter((p: any) => p.postid !== postid);
    localStorage.setItem(this.storageKey, JSON.stringify(posts));
  }
getRecentPosts(limit: number = 5) {
  const posts = this.getPosts();

  return posts
    .sort((a: any, b: any) => b.postid - a.postid)
    .slice(0, limit)
    .map((p: any) => ({
      ...p,
      status: Number(p.status) // ép kiểu status thành số
    }));
}


}
