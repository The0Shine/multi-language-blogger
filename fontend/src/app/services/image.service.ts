import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  /**
   * Optimize Cloudinary image URL with transformations
   * @param url Original Cloudinary URL
   * @param options Transformation options
   * @returns Optimized URL
   */
  optimizeCloudinaryUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    try {
      // Default optimizations
      const defaultOptions = {
        quality: 'auto',
        format: 'auto',
        crop: 'limit'
      };

      const finalOptions = { ...defaultOptions, ...options };
      
      // Build transformation string
      const transformations = [];
      
      if (finalOptions.width || finalOptions.height) {
        let sizeTransform = '';
        if (finalOptions.width) sizeTransform += `w_${finalOptions.width}`;
        if (finalOptions.height) sizeTransform += `,h_${finalOptions.height}`;
        if (finalOptions.crop) sizeTransform += `,c_${finalOptions.crop}`;
        transformations.push(sizeTransform);
      }
      
      if (finalOptions.quality) {
        transformations.push(`q_${finalOptions.quality}`);
      }
      
      if (finalOptions.format) {
        transformations.push(`f_${finalOptions.format}`);
      }

      // Insert transformations into URL
      if (transformations.length > 0) {
        const transformString = transformations.join(',');
        return url.replace('/upload/', `/upload/${transformString}/`);
      }

      return url;
    } catch (error) {
      console.error('Error optimizing Cloudinary URL:', error);
      return url;
    }
  }

  /**
   * Get responsive image URLs for different screen sizes
   * @param url Original Cloudinary URL
   * @returns Object with different sized URLs
   */
  getResponsiveUrls(url: string) {
    return {
      thumbnail: this.optimizeCloudinaryUrl(url, { width: 300, height: 200 }),
      small: this.optimizeCloudinaryUrl(url, { width: 600, height: 400 }),
      medium: this.optimizeCloudinaryUrl(url, { width: 900, height: 600 }),
      large: this.optimizeCloudinaryUrl(url, { width: 1200, height: 800 }),
      original: this.optimizeCloudinaryUrl(url, { quality: 'auto', format: 'auto' })
    };
  }

  /**
   * Preload image to check if it's accessible
   * @param url Image URL to check
   * @returns Promise that resolves if image loads successfully
   */
  preloadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(true);
      };
      
      img.onerror = () => {
        console.warn('Failed to load image:', url);
        resolve(false);
      };
      
      // Set timeout for slow connections
      setTimeout(() => {
        resolve(false);
      }, 10000); // 10 second timeout
      
      img.src = url;
    });
  }

  /**
   * Get optimized image URL for post content
   * @param url Original image URL
   * @param context Where the image is being used
   * @returns Optimized URL
   */
  getOptimizedPostImage(url: string, context: 'thumbnail' | 'content' | 'hero' = 'content'): string {
    const optimizations = {
      thumbnail: { width: 400, height: 300, quality: '80' },
      content: { width: 1000, quality: 'auto' },
      hero: { width: 1200, height: 600, quality: 'auto' }
    };

    return this.optimizeCloudinaryUrl(url, optimizations[context]);
  }
}
