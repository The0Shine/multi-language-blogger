import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  InlineToolbarService,
  ToolbarPosition,
  FormatState,
} from '../../services/inline-toolbar.service';

@Component({
  selector: 'app-inline-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [style.display]="isVisible ? 'block' : 'none'"
      class="inline-toolbar"
      [style.left.px]="position.x"
      [style.top.px]="position.y"
      (mousedown)="$event.preventDefault()"
    >
      <div class="toolbar-content">
        <button
          class="toolbar-btn"
          [class.active]="formatState.bold"
          (click)="toggleFormat('bold')"
          title="Bold (Ctrl+B)"
          type="button"
        >
          <i class="fas fa-bold"></i>
        </button>

        <button
          class="toolbar-btn"
          [class.active]="formatState.italic"
          (click)="toggleFormat('italic')"
          title="Italic (Ctrl+I)"
          type="button"
        >
          <i class="fas fa-italic"></i>
        </button>

        <div class="toolbar-separator"></div>

        <button
          class="toolbar-btn"
          (click)="createLink()"
          title="Add Link"
          type="button"
        >
          <i class="fas fa-link"></i>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .inline-toolbar {
        position: fixed;
        z-index: 1000;
        background: #1a1a1a;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        padding: 4px;
        transform: translateX(-50%);
        animation: fadeInUp 0.2s ease-out;
        user-select: none;
      }

      .toolbar-content {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        color: #ffffff;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 14px;
      }

      .toolbar-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.05);
      }

      .toolbar-btn.active {
        background: #007bff;
        color: white;
      }

      .toolbar-btn:active {
        transform: scale(0.95);
      }

      .toolbar-separator {
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        margin: 0 4px;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      /* Dark theme like Medium */
      .inline-toolbar::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #1a1a1a;
      }
    `,
  ],
})
export class InlineToolbarComponent implements OnInit, OnDestroy {
  isVisible = false;
  position: ToolbarPosition = { x: 0, y: 0 };
  formatState: FormatState = { bold: false, italic: false };

  private subscriptions: Subscription[] = [];

  constructor(private toolbarService: InlineToolbarService) {}

  ngOnInit() {
    try {
      // Subscribe to toolbar visibility
      this.subscriptions.push(
        this.toolbarService.isVisible$.subscribe((visible) => {
          this.isVisible = visible;
        })
      );

      // Subscribe to toolbar position
      this.subscriptions.push(
        this.toolbarService.position$.subscribe((position) => {
          this.position = position;
        })
      );

      // Subscribe to format state
      this.subscriptions.push(
        this.toolbarService.formatState$.subscribe((state) => {
          this.formatState = state;
        })
      );
    } catch (error) {
      console.error('Error initializing inline toolbar:', error);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  toggleFormat(format: 'bold' | 'italic') {
    try {
      const success = this.toolbarService.toggleFormat(format);
      if (success) {
        console.log(`✅ Applied ${format} formatting`);
      } else {
        console.warn(`⚠️ Failed to apply ${format} formatting`);
      }
    } catch (error) {
      console.error(`❌ Error applying ${format} formatting:`, error);
    }
  }

  createLink() {
    const url = prompt('Enter URL:');
    if (url && this.toolbarService.getCurrentRange()) {
      // Implement link creation logic here
      console.log('Creating link:', url);
    }
  }
}
