import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective implements OnInit {
  @Input() appImageFallback: string = '';
  @Input() retryCount: number = 3;
  @Input() retryDelay: number = 1000;

  private currentRetries = 0;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setupImageHandlers();
  }

  private setupImageHandlers() {
    const img = this.el.nativeElement;
    
    // Add loading class
    this.renderer.addClass(img, 'loading');
    
    // Handle successful load
    this.renderer.listen(img, 'load', () => {
      this.renderer.removeClass(img, 'loading');
      this.renderer.addClass(img, 'loaded');
    });

    // Handle error with retry logic
    this.renderer.listen(img, 'error', () => {
      this.handleImageError();
    });

    // Add timeout for slow loading
    setTimeout(() => {
      if (!img.complete && !img.naturalWidth) {
        this.handleImageError();
      }
    }, 10000); // 10 second timeout
  }

  private handleImageError() {
    const img = this.el.nativeElement;
    
    if (this.currentRetries < this.retryCount) {
      // Retry loading
      this.currentRetries++;
      console.log(`Retrying image load (${this.currentRetries}/${this.retryCount}):`, img.src);
      
      setTimeout(() => {
        // Force reload by adding timestamp
        const originalSrc = img.src;
        img.src = '';
        img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 't=' + Date.now();
      }, this.retryDelay);
      
    } else {
      // Show fallback
      this.showFallback();
    }
  }

  private showFallback() {
    const img = this.el.nativeElement;
    this.renderer.removeClass(img, 'loading');
    this.renderer.addClass(img, 'error');
    
    if (this.appImageFallback) {
      img.src = this.appImageFallback;
    } else {
      // Hide image and show error message
      this.renderer.setStyle(img, 'display', 'none');
      this.createErrorPlaceholder();
    }
  }

  private createErrorPlaceholder() {
    const img = this.el.nativeElement;
    const parent = img.parentElement;
    
    if (parent) {
      const errorDiv = this.renderer.createElement('div');
      this.renderer.addClass(errorDiv, 'image-error-placeholder');
      this.renderer.setStyle(errorDiv, 'background-color', '#f3f4f6');
      this.renderer.setStyle(errorDiv, 'border', '2px dashed #d1d5db');
      this.renderer.setStyle(errorDiv, 'border-radius', '0.5rem');
      this.renderer.setStyle(errorDiv, 'padding', '2rem');
      this.renderer.setStyle(errorDiv, 'text-align', 'center');
      this.renderer.setStyle(errorDiv, 'color', '#6b7280');
      
      const icon = this.renderer.createElement('i');
      this.renderer.addClass(icon, 'fas');
      this.renderer.addClass(icon, 'fa-image');
      this.renderer.setStyle(icon, 'font-size', '2rem');
      this.renderer.setStyle(icon, 'margin-bottom', '0.5rem');
      this.renderer.setStyle(icon, 'display', 'block');
      
      const text = this.renderer.createText('Image failed to load');
      const textP = this.renderer.createElement('p');
      this.renderer.setStyle(textP, 'margin', '0');
      this.renderer.setStyle(textP, 'font-size', '0.875rem');
      this.renderer.appendChild(textP, text);
      
      const urlP = this.renderer.createElement('p');
      this.renderer.setStyle(urlP, 'margin', '0.25rem 0 0 0');
      this.renderer.setStyle(urlP, 'font-size', '0.75rem');
      this.renderer.setStyle(urlP, 'color', '#9ca3af');
      this.renderer.setStyle(urlP, 'word-break', 'break-all');
      const urlText = this.renderer.createText(img.src);
      this.renderer.appendChild(urlP, urlText);
      
      this.renderer.appendChild(errorDiv, icon);
      this.renderer.appendChild(errorDiv, textP);
      this.renderer.appendChild(errorDiv, urlP);
      
      this.renderer.insertBefore(parent, errorDiv, img);
    }
  }
}
