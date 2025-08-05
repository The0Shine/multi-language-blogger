import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  posts: any[] = [];

  constructor(private router: Router, private postService: PostService
    ,private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
    const postId = params['view'];
    if (postId) {
      this.loadPostAndShowModal(Number(postId));
    }
  });

    this.loadPosts();
  }

  loadPostAndShowModal(id: number) {
  this.postService.getPostById(id).subscribe(post => {
    this.selectedPost = post;
  });
}




  loadPosts(): void {
    this.postService.getPosts().subscribe((data) => {
      this.posts = data;
    });
  }

  get filteredPosts() {
    return this.posts.filter(post =>
      post.title.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.statusFilter !== '' ? post.status === +this.statusFilter : true)
    );
  }

  showPostDetail(post: any) {
  this.selectedPost = post;
}

closePostModal() {
  this.selectedPost = null;
}

approvePostFromModal() {
  if (this.selectedPost) {
    this.selectedPost.status = 1;
    this.postService.updatePost(this.selectedPost).subscribe(() => {
      this.loadPosts();
      this.closePostModal();
    });
  }
}


rejectPostFromModal() {
  if (this.selectedPost) {
    this.selectedPost.status = 2;
    this.postService.updatePost(this.selectedPost).subscribe(() => {
      this.loadPosts();
      this.closePostModal();
    });
  }
}



deletePost(id: number) {
  if (confirm('Are you sure you want to delete this post?')) {
    this.postService.deletePost(id).subscribe(() => {
      this.loadPosts(); // Hoặc this.posts = this.posts.filter(p => p.id !== id);
    });
  }
}


  goToAddPost(): void {
    this.router.navigate(['/admin/post/create']);
  }

  editPost(postId: number): void {
    this.router.navigate(['/admin/post/update', postId]);
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Published';
      case 2:
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  }
}
