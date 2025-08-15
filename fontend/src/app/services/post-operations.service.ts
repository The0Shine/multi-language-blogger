import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  PostService,
  CreatePostRequest,
  UpdatePostRequest,
  CreatePostResponse,
} from './post.service';
import { EditorStateService } from './editor-state.service';
import EditorJS from '@editorjs/editorjs';

@Injectable({
  providedIn: 'root',
})
export class PostOperationsService {
  private postService = inject(PostService);
  private editorStateService = inject(EditorStateService);
  private router = inject(Router);

  constructor() {}

  // Simple content sanitization like major platforms
  private sanitizeEditorData(editorData: any): any {
    if (!editorData?.blocks) return editorData;

    const sanitizedBlocks = editorData.blocks.map((block: any) => {
      if (block.data?.text) {
        // Clean unwanted formatting (RTF codes, control chars, etc.)
        block.data.text = block.data.text
          .replace(/\{[^}]*\}/g, '') // Remove {RTF codes}
          .replace(/\\[a-zA-Z]+\d*/g, '') // Remove \commands
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control chars
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
      }
      return block;
    });

    return { ...editorData, blocks: sanitizedBlocks };
  }

  async quickSave(
    editor: EditorJS,
    title: string,
    editPostId: string,
    selectedCategoryIds: number[]
  ): Promise<void> {
    console.log('Quick save called for edit mode');

    if (!editor || !title.trim()) {
      alert('Please provide a title for your post.');
      return;
    }

    this.editorStateService.setIsSaving(true);

    try {
      const rawEditorData = await editor.save();
      // Sanitize content before processing
      const editorData = this.sanitizeEditorData(rawEditorData);
      console.log('Editor data saved:', editorData);

      // Validate that we have content
      if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
        alert('Please add some content to your post.');
        this.editorStateService.setIsSaving(false);
        return;
      }

      // Update existing post (keep existing published/draft status)
      const updateData: UpdatePostRequest = {
        title: title,
        content: JSON.stringify(editorData),
        // Always include categoryids to preserve current categories (empty array if none)
        categoryids: selectedCategoryIds,
      };

      console.log('Updating post with data:', updateData);

      this.postService.updatePost(+editPostId, updateData).subscribe({
        next: (response) => {
          console.log('Post updated successfully:', response);
          this.editorStateService.setIsSaving(false);
          this.editorStateService.setLastSaved(new Date());

          console.log('✅ Changes saved successfully!');

          // Redirect to post detail page
          this.router.navigate(['/post', editPostId]);
        },
        error: (error) => {
          console.error('Error updating post:', error);
          this.editorStateService.setIsSaving(false);
          alert('Failed to save changes. Please try again.');
        },
      });
    } catch (error) {
      console.error('Error saving editor data:', error);
      this.editorStateService.setIsSaving(false);
      alert('Failed to save changes. Please try again.');
    }
  }

  async publishPost(
    editor: EditorJS,
    title: string,
    selectedCategoryIds: number[],
    publishStatus: 'draft' | 'published',
    isEditMode: boolean,
    editPostId: string | null,
    currentUser: any
  ): Promise<void> {
    console.log('publishPost called with status:', publishStatus);

    if (!editor || !title.trim()) {
      alert('Please provide a title for your post.');
      return;
    }

    this.editorStateService.setIsSaving(true);

    try {
      const editorData = await editor.save();
      console.log('Editor data saved:', editorData);

      // Validate that we have content
      if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
        alert('Please add some content to your post.');
        this.editorStateService.setIsSaving(false);
        return;
      }

      const status = publishStatus === 'published' ? 1 : 0; // 1 = published, 0 = draft

      if (isEditMode && editPostId) {
        // Update existing post
        const updateData: UpdatePostRequest = {
          title: title,
          content: JSON.stringify(editorData),
          status: status,
          // Always include categoryids to preserve current categories (empty array if none)
          categoryids: selectedCategoryIds,
        };

        console.log('Updating post with data:', updateData);

        this.postService.updatePost(+editPostId, updateData).subscribe({
          next: (response) => {
            console.log('Post updated successfully:', response);
            this.handlePublishSuccess(publishStatus, editPostId);
          },
          error: (error) => {
            console.error('Error updating post:', error);
            this.handlePublishError();
          },
        });
      } else {
        // Create new post
        const createData: CreatePostRequest = {
          title: title,
          content: JSON.stringify(editorData),
          categoryids:
            selectedCategoryIds.length > 0 ? selectedCategoryIds : [1],
          status: status,
          userid: currentUser.userid,
        };

        console.log('Creating post with data:', createData);

        this.postService.createPost(createData).subscribe({
          next: (response: CreatePostResponse) => {
            console.log('Post created successfully:', response);
            if (response.success && response.data?.postid) {
              this.handlePublishSuccess(
                publishStatus,
                response.data.postid.toString()
              );
            } else {
              this.handlePublishError();
            }
          },
          error: (error) => {
            console.error('Error creating post:', error);
            this.handlePublishError();
          },
        });
      }
    } catch (error) {
      console.error('Error saving editor data:', error);
      this.handlePublishError();
    }
  }

  private handlePublishSuccess(
    publishStatus: 'draft' | 'published',
    postId: string
  ): void {
    this.editorStateService.setIsSaving(false);
    this.editorStateService.setLastSaved(new Date());

    const message =
      publishStatus === 'published'
        ? 'Post published successfully!'
        : 'Post saved as draft!';

    console.log('✅', message);

    // Navigate to the post detail page or my story page
    if (publishStatus === 'published') {
      this.router.navigate(['/post', postId]);
    } else {
      this.router.navigate(['/my-story']);
    }
  }

  private handlePublishError(): void {
    this.editorStateService.setIsSaving(false);
    alert('Failed to save post. Please try again.');
  }

  async loadPostForEdit(
    postId: string,
    postService: PostService
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      postService.getPost(+postId).subscribe({
        next: (post) => {
          if (post) {
            resolve(post);
          } else {
            reject(new Error('Post not found'));
          }
        },
        error: (error) => {
          console.error('Error loading post:', error);
          reject(error);
        },
      });
    });
  }
}
