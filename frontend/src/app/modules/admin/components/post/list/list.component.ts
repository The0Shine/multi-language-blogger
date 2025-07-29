import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-post',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AdminPostListComponent {
  searchText: string = '';
  statusFilter: string = '';
  selectedPost: any = null;

  posts = [
    {
      postid: 1,
      title: 'Welcome to the Blog',
      author: 'Admin',
      status: 'Published',
      content: `<p>Welcome to our blog! Here you will find <strong>latest updates</strong>, tutorials, and more.</p><p>Enjoy reading and feel free to comment!</p>`
    },
    {
      postid: 2,
      title: 'How to Use Categories',
      author: 'Jane',
      status: 'Pending Review',
      content: `<p>This post explains how to use categories to organize your blog posts.</p><ul><li>Go to Categories section</li><li>Add or edit categories</li><li>Assign categories to posts</li></ul>`
    },
    {
      postid: 3,
      title: 'Tips for Writing',
      author: 'Alex',
      status: 'Pending Review',
      content: `<h3>Tips for Writing Great Blog Posts</h3><ol><li>Choose interesting topics</li><li>Write clearly and concisely</li><li>Use images and examples</li></ol><p>Happy blogging!</p>`
    }
  ];

  constructor(private router: Router) {}

  get filteredPosts() {
    return this.posts.filter(post =>
      post.title.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter ? post.status === this.statusFilter : true)
    );
  }

  showPostDetail(post: any) {
    this.selectedPost = post;
    (document.getElementById('post-modal') as HTMLElement).style.display = 'flex';
  }

  closePostModal() {
    (document.getElementById('post-modal') as HTMLElement).style.display = 'none';
    this.selectedPost = null;
  }

  approvePostFromModal() {
    if (this.selectedPost) {
      this.selectedPost.status = 'Published';
      this.closePostModal();
    }
  }

  rejectPostFromModal() {
    if (this.selectedPost) {
      this.selectedPost.status = 'Rejected';
      this.closePostModal();
    }
  }

  deletePost(post: any) {
    this.posts = this.posts.filter(p => p !== post);
  }

  goToAddPost() {
    this.router.navigate(['/admin/post/create']);
  }

  editPost(postId: number) {
    this.router.navigate(['/admin/post/update', postId]);
  }
}
