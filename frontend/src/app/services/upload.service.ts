import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UploadResponse {
  success: number;
  file: {
    url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    is_temp?: boolean;
  };
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  transformation: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4000/api/upload';

  // Upload image file
  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http
      .post<any>(`${this.baseUrl}/image`, formData)
      .pipe(map((response) => response.data));
  }

  // Upload image by URL (for EditorJS Image tool)
  uploadImageByUrl(url: string): Observable<UploadResponse> {
    return this.http
      .post<any>(`${this.baseUrl}/image-by-url`, { url })
      .pipe(map((response) => response.data));
  }

  // Delete image
  deleteImage(publicId: string): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/image/${publicId}`)
      .pipe(map((response) => response.data));
  }

  // Move images from temp to permanent storage
  moveToPermament(
    publicIds: string[],
    targetFolder: 'posts' | 'drafts' = 'posts'
  ): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/move-to-permanent`, {
        public_ids: publicIds,
        target_folder: targetFolder,
      })
      .pipe(map((response) => response.data));
  }

  // Get image info
  getImageInfo(publicId: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/info/${publicId}`)
      .pipe(map((response) => response.data));
  }

  // Clean up temporary images (admin only)
  cleanupTempImages(maxAgeHours: number = 24): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/cleanup-temp?max_age_hours=${maxAgeHours}`)
      .pipe(map((response) => response.data));
  }

  // Get optimized image URL with transformations
  getOptimizedImageUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
      crop?: string;
    }
  ): string {
    const cloudName = 'dnehzymia';
    let transformations = [];

    // Default responsive sizing for better display
    if (options?.width || options?.height) {
      const width = options.width || 800;
      const height = options.height || 600;
      const crop = options.crop || 'fill'; // fill, fit, limit, scale, etc.
      transformations.push(`w_${width},h_${height},c_${crop}`);
    } else {
      // Default size for editor images - make them larger and responsive
      transformations.push('w_800,h_600,c_fill');
    }

    // Quality optimization
    const quality = options?.quality || 'auto:good';
    transformations.push(`q_${quality}`);

    // Format optimization
    const format = options?.format || 'auto';
    transformations.push(`f_${format}`);

    // Add responsive and DPR support
    transformations.push('dpr_auto');

    const transformString = transformations.join(',');
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
  }

  // Get upload signature for direct uploads
  getUploadSignature(): Observable<CloudinarySignature> {
    return this.http
      .get<any>(`${this.baseUrl}/signature`)
      .pipe(map((response) => response.data));
  }

  // Direct upload to Cloudinary (using signature)
  directUploadToCloudinary(
    file: File,
    signature: CloudinarySignature
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature.signature);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('api_key', signature.api_key);
    formData.append('folder', signature.folder);
    formData.append('transformation', signature.transformation);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`;

    return this.http.post(cloudinaryUrl, formData);
  }

  // Utility method to validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Only image files are allowed' };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    // Check supported formats
    const supportedFormats = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Supported formats: JPEG, PNG, GIF, WebP' };
    }

    return { valid: true };
  }
}
