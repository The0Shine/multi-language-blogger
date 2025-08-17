import { Injectable } from '@angular/core';
import EditorJS from '@editorjs/editorjs';

@Injectable({
  providedIn: 'root',
})
export class EditorOperationsService {
  constructor() {}

  // Text selection and formatting operations
  async convertToHeader(
    editor: EditorJS,
    level: 1 | 2 | 3 | 4,
    selectedRange: Range | null
  ) {
    if (!editor || !selectedRange) return;
    try {
      const currentBlockIndex = editor.blocks.getCurrentBlockIndex();
      const currentBlock = await editor.blocks.getBlockByIndex(
        currentBlockIndex
      );
      if (currentBlock) {
        const savedData = await currentBlock.save();
        const currentText = savedData?.data?.text ?? '';

        await editor.blocks.update(currentBlock.id, {
          text: currentText,
          level: level,
        });

        await editor.blocks.convert(currentBlock.id, 'header', {
          text: currentText,
          level: level,
        });
      }
    } catch (error) {
      console.error('Failed to convert to header:', error);
    }
  }

  async convertToQuote(editor: EditorJS, selectedRange: Range | null) {
    if (!editor || !selectedRange) return;
    try {
      const currentBlockIndex = editor.blocks.getCurrentBlockIndex();
      const currentBlock = await editor.blocks.getBlockByIndex(
        currentBlockIndex
      );
      if (currentBlock) {
        const selectedText = selectedRange.toString().trim();
        const savedData = await currentBlock.save();
        const currentText = savedData?.data?.text ?? '';

        const quoteText = selectedText || currentText;

        await editor.blocks.convert(currentBlock.id, 'quote', {
          text: quoteText,
          caption: '',
          alignment: 'left',
        });
      }
    } catch (error) {
      console.error('Failed to convert to quote:', error);
    }
  }

  createLink(selectedRange: Range | null) {
    if (!selectedRange) return;
    const url = prompt('Enter URL:');
    if (url) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectedRange);

        // Use modern approach instead of deprecated execCommand
        const selectedContent = selectedRange.extractContents();
        const link = document.createElement('a');
        link.href = url;
        link.appendChild(selectedContent);
        selectedRange.insertNode(link);

        // Update selection to include the link
        selectedRange.selectNode(link);
        selection.removeAllRanges();
        selection.addRange(selectedRange);
      }
    }
  }

  // Format operations
  toggleFormat(format: string, selectedRange: Range | null): Range | null {
    if (!selectedRange) return null;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(selectedRange);
      // Use modern approach instead of deprecated execCommand
      if (format === 'bold') {
        this.wrapSelection('strong');
      } else if (format === 'italic') {
        this.wrapSelection('em');
      }
      if (selection.rangeCount > 0) {
        return selection.getRangeAt(0).cloneRange();
      }
    }
    return selectedRange;
  }

  private wrapSelection(tagName: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedContent = range.extractContents();
    const wrapper = document.createElement(tagName);
    wrapper.appendChild(selectedContent);
    range.insertNode(wrapper);

    // Update selection to include the wrapper
    range.selectNode(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  isFormatActive(format: string, selectedRange: Range | null): boolean {
    if (!selectedRange) return false;

    // Check if selection contains the format tag
    const container = selectedRange.commonAncestorContainer;
    const element =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : (container as Element);

    if (format === 'bold') {
      return element?.closest('strong, b') !== null;
    } else if (format === 'italic') {
      return element?.closest('em, i') !== null;
    }

    return false;
  }

  // Block operations
  deleteBlock(editor: EditorJS, blockIndex: number) {
    try {
      editor.blocks.delete(blockIndex);
      const newCount = editor.blocks.getBlocksCount();
      if (newCount > 0) {
        const moveIndex = blockIndex > 0 ? blockIndex - 1 : 0;
        editor.caret.setToBlock(moveIndex, 'end');
      } else {
        editor.blocks.insert('paragraph', {}, {}, 0);
        editor.caret.setToBlock(0, 'start');
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  }

  insertBlock(
    editor: EditorJS,
    type: string,
    data: any = {},
    config: any = {},
    index?: number
  ) {
    try {
      editor.blocks.insert(type, data, config, index);
    } catch (error) {
      console.error('Failed to insert block:', error);
    }
  }

  // Toolbar position calculation
  calculateToolbarPosition(selection: Selection): { x: number; y: number } {
    if (!selection.rangeCount) return { x: 0, y: 0 };

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    return {
      x: rect.left + scrollLeft + rect.width / 2 - 100, // Center toolbar above selection
      y: rect.top + scrollTop - 50, // Position above selection
    };
  }

  // Text area auto-resize
  resizeTextarea(textarea: HTMLTextAreaElement) {
    // Store current scroll position
    const scrollTop = window.pageYOffset;

    // Reset height to calculate new height
    textarea.style.height = 'auto';

    // Calculate new height based on scroll height
    const newHeight = Math.max(textarea.scrollHeight, 60);
    textarea.style.height = newHeight + 'px';

    // Restore scroll position
    window.scrollTo(0, scrollTop);

    console.log('Title textarea resized to:', newHeight + 'px');
  }
}
