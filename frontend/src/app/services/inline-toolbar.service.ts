import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToolbarPosition {
  x: number;
  y: number;
}

export interface FormatState {
  bold: boolean;
  italic: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class InlineToolbarService {
  private showToolbar$ = new BehaviorSubject<boolean>(false);
  private toolbarPosition$ = new BehaviorSubject<ToolbarPosition>({
    x: 0,
    y: 0,
  });
  private formatStateSubject$ = new BehaviorSubject<FormatState>({
    bold: false,
    italic: false,
  });
  private currentRange: Range | null = null;

  // Public observables
  public readonly isVisible$ = this.showToolbar$.asObservable();
  public readonly position$ = this.toolbarPosition$.asObservable();
  public readonly formatState$ = this.formatStateSubject$.asObservable();

  constructor() {
    // Listen for selection changes globally with debounce
    document.addEventListener('selectionchange', () => {
      // Debounce to prevent flickering
      setTimeout(() => {
        this.handleSelectionChange();
      }, 100);
    });

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardShortcuts(event);
    });
  }

  private handleKeyboardShortcuts(event: KeyboardEvent) {
    // Only handle shortcuts when we have a current range
    if (!this.currentRange) return;

    // Bold: Ctrl+B or Cmd+B
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      this.toggleFormat('bold');
      return;
    }

    // Italic: Ctrl+I or Cmd+I
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      this.toggleFormat('italic');
      return;
    }
  }

  private handleSelectionChange() {
    try {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        this.hideToolbar();
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();

      console.log('🔍 Selection changed:', {
        selectedText,
        length: selectedText.length,
        isWithinEditor: this.isWithinEditor(range),
      });

      // Only show toolbar if text is selected and within editor
      if (
        selectedText &&
        selectedText.length > 0 &&
        this.isWithinEditor(range)
      ) {
        // Avoid showing toolbar for single character selections or clicks
        if (selectedText.length < 2) {
          this.hideToolbar();
          return;
        }

        console.log('✅ Showing toolbar for selection:', selectedText);
        this.currentRange = range.cloneRange();
        this.showToolbarAtSelection(range);
        this.updateFormatState(range);
      } else {
        this.hideToolbar();
      }
    } catch (error) {
      console.error('❌ Error in handleSelectionChange:', error);
    }
  }

  private isWithinEditor(range: Range): boolean {
    // Check if selection is within EditorJS container
    const container = range.commonAncestorContainer;
    const element =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as Element);

    return element?.closest('.codex-editor') !== null;
  }

  private showToolbarAtSelection(range: Range) {
    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    // Position toolbar above selection (like Medium)
    const position: ToolbarPosition = {
      x: rect.left + scrollLeft + rect.width / 2 - 100, // Center toolbar
      y: rect.top + scrollTop - 50, // Position above selection
    };

    // Ensure toolbar stays within viewport
    const viewportWidth = window.innerWidth;
    if (position.x < 10) position.x = 10;
    if (position.x > viewportWidth - 200) position.x = viewportWidth - 200;
    if (position.y < 10) position.y = rect.bottom + scrollTop + 10; // Show below if no space above

    this.toolbarPosition$.next(position);
    this.showToolbar$.next(true);
  }

  private updateFormatState(range: Range) {
    const container = range.commonAncestorContainer;
    const element =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as Element);

    const formatState: FormatState = {
      bold: element?.closest('strong, b') !== null,
      italic: element?.closest('em, i') !== null,
    };

    this.formatStateSubject$.next(formatState);
  }

  public hideToolbar() {
    this.showToolbar$.next(false);
    this.currentRange = null;
  }

  public toggleFormat(format: 'bold' | 'italic'): boolean {
    console.log(`🎨 Toggling ${format} format`);

    if (!this.currentRange) {
      console.warn('⚠️ No current range available');
      return false;
    }

    try {
      // Restore selection
      const selection = window.getSelection();
      if (!selection) {
        console.warn('⚠️ No selection available');
        return false;
      }

      selection.removeAllRanges();
      selection.addRange(this.currentRange);

      // Apply formatting
      const success = this.applyFormatting(format, this.currentRange);
      console.log(
        `${success ? '✅' : '❌'} Formatting ${format} ${
          success ? 'applied' : 'failed'
        }`
      );

      // Update current range and format state
      if (selection.rangeCount > 0) {
        this.currentRange = selection.getRangeAt(0).cloneRange();
        this.updateFormatState(this.currentRange);
      }

      return success;
    } catch (error) {
      console.error('❌ Failed to apply formatting:', error);
      return false;
    }
  }

  private applyFormatting(format: 'bold' | 'italic', range: Range): boolean {
    const tag = format === 'bold' ? 'STRONG' : 'EM';
    const container = range.commonAncestorContainer;
    const element =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as Element);

    // Check if already formatted
    const existingElement = element?.closest(tag.toLowerCase());

    if (existingElement) {
      // Remove formatting
      return this.removeFormatting(existingElement);
    } else {
      // Add formatting
      return this.addFormatting(tag, range);
    }
  }

  private removeFormatting(element: Element): boolean {
    try {
      const parent = element.parentNode;
      if (!parent) return false;

      // Move all children out of the formatted element
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }

      // Remove the empty formatted element
      parent.removeChild(element);
      return true;
    } catch (error) {
      console.error('Failed to remove formatting:', error);
      return false;
    }
  }

  private addFormatting(tag: string, range: Range): boolean {
    try {
      // Extract selected content
      const selectedContent = range.extractContents();

      // Create wrapper element
      const wrapper = document.createElement(tag);
      wrapper.appendChild(selectedContent);

      // Insert formatted content
      range.insertNode(wrapper);

      // Select the formatted content
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        selection.addRange(newRange);
      }

      return true;
    } catch (error) {
      console.error('Failed to add formatting:', error);
      return false;
    }
  }

  public getCurrentRange(): Range | null {
    return this.currentRange;
  }

  public isFormatActive(format: 'bold' | 'italic'): boolean {
    const currentState = this.formatStateSubject$.value;
    return currentState[format];
  }
}
