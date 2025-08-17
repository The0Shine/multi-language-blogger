import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../services/post.service';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.css'],
})
export class CommentSectionComponent {
  @Input() comments: Comment[] = [];
  @Input() newComment = '';
  @Input() pagination: any = {};
  @Input() loading = false;
  @Output() newCommentChange = new EventEmitter<string>();
  @Output() submitComment = new EventEmitter<void>();
  @Output() loadMoreComments = new EventEmitter<void>();
  @Output() editComment = new EventEmitter<{
    commentId: number;
    content: string;
  }>();

  editingCommentId: number | null = null;
  editingContent: string = '';
  showResponseActions = false;
  isCommentBoxExpanded = false;

  onCommentChange(value: string) {
    this.newCommentChange.emit(value);
    // Auto-expand if content is getting longer
    if (value.length > 50 || value.includes('\n')) {
      this.isCommentBoxExpanded = true;
      this.showResponseActions = true;
    }
  }

  onSubmit() {
    this.submitComment.emit();
    this.showResponseActions = false;
    this.isCommentBoxExpanded = false;
  }

  expandCommentBox() {
    this.isCommentBoxExpanded = true;
    this.showResponseActions = true;
  }

  cancelResponse() {
    this.newCommentChange.emit('');
    this.showResponseActions = false;
    this.isCommentBoxExpanded = false;
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

  getAuthorInitials(comment: Comment): string {
    if (comment.authorUser) {
      const fullName =
        `${comment.authorUser.first_name} ${comment.authorUser.last_name}`.trim();
      if (fullName) {
        return fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
      }
      return comment.authorUser.username.substring(0, 2).toUpperCase();
    }
    return comment.author.substring(0, 2).toUpperCase();
  }

  getAuthorDisplayName(comment: Comment): string {
    if (comment.authorUser) {
      const fullName =
        `${comment.authorUser.first_name} ${comment.authorUser.last_name}`.trim();
      return fullName || comment.authorUser.username;
    }
    return comment.author;
  }

  onLoadMore() {
    this.loadMoreComments.emit();
  }

  get hasMoreComments(): boolean {
    return this.pagination?.page < this.pagination?.totalPages;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  startEdit(commentId: number, currentContent: string) {
    this.editingCommentId = commentId;
    this.editingContent = currentContent;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editingContent = '';
  }

  saveEdit() {
    if (this.editingCommentId && this.editingContent.trim()) {
      this.editComment.emit({
        commentId: this.editingCommentId,
        content: this.editingContent.trim(),
      });
      this.editingCommentId = null;
      this.editingContent = '';
    }
  }

  isEditing(commentId: number): boolean {
    return this.editingCommentId === commentId;
  }
}
