import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { UploadService } from './upload.service';

export interface EditorImage {
  public_id: string;
  url: string;
  is_temp: boolean;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EditorImageManagerService {
  private uploadService = inject(UploadService);

  // Track images used in current editor session
  private currentImagesSubject = new BehaviorSubject<EditorImage[]>([]);
  public currentImages$ = this.currentImagesSubject.asObservable();

  // Track deleted images that need cleanup
  private deletedImagesSubject = new BehaviorSubject<string[]>([]);
  public deletedImages$ = this.deletedImagesSubject.asObservable();

  constructor() {}

  /**
   * Add image to current session tracking
   */
  addImage(image: EditorImage): void {
    const currentImages = this.currentImagesSubject.value;
    const existingIndex = currentImages.findIndex(
      (img) => img.public_id === image.public_id
    );

    if (existingIndex === -1) {
      this.currentImagesSubject.next([...currentImages, image]);
    }
  }

  /**
   * Remove image from current session and mark for deletion
   */
  removeImage(publicId: string): void {
    const currentImages = this.currentImagesSubject.value;
    const updatedImages = currentImages.filter(
      (img) => img.public_id !== publicId
    );
    this.currentImagesSubject.next(updatedImages);

    // Add to deleted images for cleanup
    const deletedImages = this.deletedImagesSubject.value;
    if (!deletedImages.includes(publicId)) {
      this.deletedImagesSubject.next([...deletedImages, publicId]);
    }
  }

  /**
   * Get all current images
   */
  getCurrentImages(): EditorImage[] {
    return this.currentImagesSubject.value;
  }

  /**
   * Get all temporary images
   */
  getTempImages(): EditorImage[] {
    return this.currentImagesSubject.value.filter((img) => img.is_temp);
  }

  /**
   * Get all permanent images
   */
  getPermanentImages(): EditorImage[] {
    return this.currentImagesSubject.value.filter((img) => !img.is_temp);
  }

  /**
   * Move all temporary images to permanent storage
   */
  moveAllTempToPermanent(
    targetFolder: 'posts' | 'drafts' = 'posts'
  ): Observable<any> {
    const tempImages = this.getTempImages();
    const publicIds = tempImages.map((img) => img.public_id);

    if (publicIds.length === 0) {
      return new Observable((observer) => {
        observer.next({ successful: 0, failed: 0, results: [] });
        observer.complete();
      });
    }

    return this.uploadService.moveToPermament(publicIds, targetFolder);
  }

  /**
   * Clean up deleted images from cloud storage
   */
  cleanupDeletedImages(): Observable<any[]> {
    const deletedImages = this.deletedImagesSubject.value;

    if (deletedImages.length === 0) {
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    const deletePromises = deletedImages.map((publicId) =>
      this.uploadService.deleteImage(publicId)
    );

    return new Observable((observer) => {
      Promise.allSettled(deletePromises.map((obs) => firstValueFrom(obs)))
        .then((results) => {
          // Clear deleted images list after cleanup attempt
          this.deletedImagesSubject.next([]);
          observer.next(results);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  /**
   * Extract images from EditorJS data
   */
  extractImagesFromEditorData(editorData: any): EditorImage[] {
    const images: EditorImage[] = [];

    if (editorData?.blocks) {
      editorData.blocks.forEach((block: any) => {
        if (block.type === 'image' && block.data?.file) {
          const file = block.data.file;
          images.push({
            public_id: file.public_id || this.extractPublicIdFromUrl(file.url),
            url: file.url,
            is_temp: file.is_temp || false,
            width: file.width,
            height: file.height,
            format: file.format,
            bytes: file.bytes,
          });
        }
      });
    }

    return images;
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  private extractPublicIdFromUrl(url: string): string {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
        // Skip version if present (starts with 'v')
        let startIndex = uploadIndex + 1;
        if (urlParts[startIndex].startsWith('v')) {
          startIndex++;
        }

        // Join remaining parts and remove file extension
        const publicIdWithExt = urlParts.slice(startIndex).join('/');
        const lastDotIndex = publicIdWithExt.lastIndexOf('.');
        return lastDotIndex !== -1
          ? publicIdWithExt.substring(0, lastDotIndex)
          : publicIdWithExt;
      }
    } catch (error) {
      console.warn('Failed to extract public_id from URL:', url, error);
    }

    return url; // Fallback to full URL
  }

  /**
   * Update images from editor data
   */
  updateImagesFromEditor(editorData: any): void {
    const extractedImages = this.extractImagesFromEditorData(editorData);
    const currentImages = this.currentImagesSubject.value;

    // Find images that were removed from editor
    const currentPublicIds = extractedImages.map((img) => img.public_id);
    const removedImages = currentImages.filter(
      (img) => !currentPublicIds.includes(img.public_id)
    );

    // Mark removed images for deletion
    removedImages.forEach((img) => {
      this.removeImage(img.public_id);
    });

    // Update current images list
    this.currentImagesSubject.next(extractedImages);
  }

  /**
   * Clear all tracking data (use when starting new editor session)
   */
  clearSession(): void {
    this.currentImagesSubject.next([]);
    this.deletedImagesSubject.next([]);
  }

  /**
   * Get summary of current session
   */
  getSessionSummary(): {
    total: number;
    temp: number;
    permanent: number;
    deleted: number;
  } {
    const currentImages = this.currentImagesSubject.value;
    const deletedImages = this.deletedImagesSubject.value;

    return {
      total: currentImages.length,
      temp: currentImages.filter((img) => img.is_temp).length,
      permanent: currentImages.filter((img) => !img.is_temp).length,
      deleted: deletedImages.length,
    };
  }

  /**
   * Validate image optimization settings
   */
  getOptimizedImageUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
    }
  ): string {
    return this.uploadService.getOptimizedImageUrl(publicId, options);
  }
}
