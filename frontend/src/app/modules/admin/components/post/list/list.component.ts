import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../post.service';

@Component({
  selector: 'app-list-post',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
})
export class AdminPostListComponent implements OnInit {
  searchText: string = '';
  statusFilter: string | number = '';

  selectedPost: any = null;

  posts = [
    {
      postid: 1,
      title: 'Welcome to the Blog',
      author: 'Admin',
      status: 1,
      content: `<p>Welcome to our blog! Here you will find <strong>latest updates</strong>, tutorials, and more.</p><p>Enjoy reading and feel free to comment!</p>`
    },
    {
      postid: 2,
      title: 'How to Use Categories',
      author: 'Jane',
      status: 0,
      content: `<p>This post explains how to use categories to organize your blog posts.</p><ul><li>Go to Categories section</li><li>Add or edit categories</li><li>Assign categories to posts</li></ul>`
    },
    {
      postid: 3,
      title: 'Tips for Writing',
      author: 'Alex',
      status: 0,
      content: `<h3>Tips for Writing Great Blog Posts</h3><ol><li>Choose interesting topics</li><li>Write clearly and concisely</li><li>Use images and examples</li></ol><p>Happy blogging!</p>`
    }
  ];

  constructor(private router: Router, private postService: PostService) {}

  ngOnInit(): void {
    this.posts = this.postService.getPosts();
  }

 get filteredPosts() {
  return this.posts.filter(post =>

    post.title.toLowerCase().includes(this.searchText.toLowerCase()) &&
    (this.statusFilter !== '' ? post.status === +this.statusFilter : true)
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
    this.selectedPost.status = 1; // ✅ Published
    this.postService.updatePost(this.selectedPost); // ✅ lưu lại vào localStorage
    this.posts = this.postService.getPosts(); // reload danh sách
    this.closePostModal();
  }
}

rejectPostFromModal() {
  if (this.selectedPost) {
    this.selectedPost.status = 2; // ✅ Rejected
    this.postService.updatePost(this.selectedPost); // ✅ lưu lại vào localStorage
    this.posts = this.postService.getPosts(); // reload danh sách
    this.closePostModal();
  }
}


  deletePost(postid: number) {
  if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
    this.postService.deletePost(postid);
    this.posts = this.postService.getPosts(); // load lại danh sách
  }
}


  goToAddPost() {
    this.router.navigate(['/admin/post/create']);
  }

  editPost(postId: number) {
    this.router.navigate(['/admin/post/update', postId]);
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Published';
      case 2: return 'Rejected';
      default: return 'Pending Review';
    }
  }

}
