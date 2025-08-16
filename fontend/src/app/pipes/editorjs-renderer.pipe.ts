import { Pipe, type PipeTransform, inject } from '@angular/core';
import { ImageService } from '../services/image.service';

@Pipe({
  name: 'editorjsRenderer',
  standalone: true,
})
export class EditorjsRendererPipe implements PipeTransform {
  private imageService = inject(ImageService);
  // Clean RTF formatting codes from text
  private cleanRTFCodes(text: string): string {
    if (!text || typeof text !== 'string') return text;

    // Remove RTF formatting codes like {\fn华文楷体\fs16\1che0e0e0}
    return text
      .replace(/\{\\[^}]*\}/g, '') // Remove RTF control codes
      .replace(/\{[^}]*\}/g, '') // Remove any remaining braces content
      .replace(/\\[a-zA-Z]+\d*/g, '') // Remove RTF commands like \fs16
      .replace(/\\\\/g, '\\') // Fix escaped backslashes
      .trim();
  }

  // Decode HTML entities (fix &nbsp;, &amp;, etc.)
  private decodeHtmlEntities(text: string): string {
    if (!text || typeof text !== 'string') return text;

    const htmlEntities: { [key: string]: string } = {
      '&nbsp;': ' ', // Non-breaking space
      '&amp;': '&', // Ampersand
      '&lt;': '<', // Less than
      '&gt;': '>', // Greater than
      '&quot;': '"', // Double quote
      '&#39;': "'", // Single quote
      '&apos;': "'", // Apostrophe
      '&cent;': '¢', // Cent
      '&pound;': '£', // Pound
      '&yen;': '¥', // Yen
      '&euro;': '€', // Euro
      '&copy;': '©', // Copyright
      '&reg;': '®', // Registered
      '&trade;': '™', // Trademark
      '&hellip;': '…', // Ellipsis
      '&mdash;': '—', // Em dash
      '&ndash;': '–', // En dash
      '&lsquo;': "'", // Left single quote
      '&rsquo;': "'", // Right single quote
      '&ldquo;': '"', // Left double quote
      '&rdquo;': '"', // Right double quote
    };

    let decodedText = text;

    // Replace named entities
    for (const [entity, char] of Object.entries(htmlEntities)) {
      decodedText = decodedText.replace(new RegExp(entity, 'g'), char);
    }

    // Replace numeric entities like &#160; (non-breaking space)
    decodedText = decodedText.replace(/&#(\d+);/g, (_, num) => {
      return String.fromCharCode(parseInt(num, 10));
    });

    // Replace hex entities like &#x00A0;
    decodedText = decodedText.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    return decodedText;
  }

  // Clean text with both RTF and HTML entity cleaning, but preserve formatting tags
  private cleanText(text: string): string {
    if (!text) return text;
    let cleaned = this.cleanRTFCodes(text);
    cleaned = this.decodeHtmlEntities(cleaned);
    // Preserve HTML formatting tags (bold, italic, etc.)
    cleaned = this.preserveFormattingTags(cleaned);
    return cleaned;
  }

  // Preserve and normalize HTML formatting tags
  private preserveFormattingTags(text: string): string {
    if (!text || typeof text !== 'string') return text;

    return (
      text
        // Normalize bold tags: <b> and <strong> → <strong>
        .replace(/<b\b[^>]*>/gi, '<strong>')
        .replace(/<\/b>/gi, '</strong>')

        // Normalize italic tags: <i> and <em> → <em>
        .replace(/<i\b[^>]*>/gi, '<em>')
        .replace(/<\/i>/gi, '</em>')

        // Keep underline tags
        .replace(/<u\b[^>]*>/gi, '<u>')
        .replace(/<\/u>/gi, '</u>')

        // Keep links but sanitize
        .replace(
          /<a\s+href="([^"]*)"[^>]*>/gi,
          '<a href="$1" target="_blank" rel="noopener noreferrer">'
        )
        .replace(/<\/a>/gi, '</a>')

        // Remove any other HTML tags except formatting ones
        .replace(/<(?!\/?(?:strong|em|u|a|br)\b)[^>]+>/gi, '')

        // Clean up multiple spaces
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  transform(value: string | any): string {
    if (!value) return '';

    try {
      let editorData;
      if (typeof value === 'string') {
        editorData = JSON.parse(value);
      } else {
        editorData = value;
      }

      if (!editorData.blocks || !Array.isArray(editorData.blocks)) {
        return '';
      }

      return editorData.blocks
        .map((block: any) => this.renderBlock(block))
        .join('');
    } catch (error) {
      console.error('Error parsing EditorJS content:', error);
      return '';
    }
  }

  private renderBlock(block: any): string {
    switch (block.type) {
      case 'paragraph':
        const cleanParagraphText = this.cleanText(block.data.text || '');
        return `<p class="mb-4 text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">${cleanParagraphText}</p>`;

      case 'header':
        const level = block.data.level || 1;
        const headerClasses = {
          1: 'text-3xl font-bold mb-6 mt-8 text-gray-900 break-words overflow-wrap-anywhere',
          2: 'text-2xl font-bold mb-4 mt-6 text-gray-900 break-words overflow-wrap-anywhere',
          3: 'text-xl font-bold mb-3 mt-5 text-gray-900 break-words overflow-wrap-anywhere',
          4: 'text-lg font-bold mb-2 mt-4 text-gray-900 break-words overflow-wrap-anywhere',
          5: 'text-base font-bold mb-2 mt-3 text-gray-900 break-words overflow-wrap-anywhere',
          6: 'text-sm font-bold mb-2 mt-2 text-gray-900 break-words overflow-wrap-anywhere',
        };
        const cleanHeaderText = this.cleanText(block.data.text || '');
        return `<h${level} class="${
          headerClasses[level as keyof typeof headerClasses] || headerClasses[1]
        }">${cleanHeaderText}</h${level}>`;

      case 'list':
        const listItems = (block.data.items || [])
          .map(
            (item: string) => `<li class="mb-1">${this.cleanText(item)}</li>`
          )
          .join('');
        const listClass = 'mb-4 pl-6 text-gray-700';
        return block.data.style === 'ordered'
          ? `<ol class="${listClass} list-decimal">${listItems}</ol>`
          : `<ul class="${listClass} list-disc">${listItems}</ul>`;

      case 'quote':
        const cleanQuoteText = this.cleanText(block.data.text || '');
        const cleanQuoteCaption = this.cleanText(block.data.caption || '');
        return `<blockquote class="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic text-gray-600 bg-gray-50">
          <p class="mb-2">${cleanQuoteText}</p>
          ${
            cleanQuoteCaption
              ? `<cite class="text-sm text-gray-500">— ${cleanQuoteCaption}</cite>`
              : ''
          }
        </blockquote>`;

      case 'code':
        return `<pre class="bg-gray-100 rounded p-4 mb-4 overflow-x-auto"><code class="text-sm text-gray-800">${
          block.data.code || ''
        }</code></pre>`;

      case 'delimiter':
        return `<div class="text-center my-8"><span class="text-2xl text-gray-400">* * *</span></div>`;

      case 'image':
        const originalImageUrl = block.data.file?.url || '';
        const imageCaption = block.data.caption || '';
        const caption = imageCaption
          ? `<figcaption class="text-sm text-gray-500 text-center mt-2">${imageCaption}</figcaption>`
          : '';

        // Optimize image URL for better loading
        const optimizedImageUrl = this.imageService.getOptimizedPostImage(
          originalImageUrl,
          'content'
        );

        // Add error handling and loading optimization for images
        return `<figure class="mb-6">
          <img
            src="${optimizedImageUrl}"
            alt="${imageCaption}"
            class="w-full rounded-lg shadow-sm transition-opacity duration-300"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            onload="this.nextElementSibling.style.display='none'; this.style.opacity='1';"
            style="opacity: 0;"
          >
          <div class="hidden bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div class="text-gray-500">
              <i class="fas fa-image text-2xl mb-2"></i>
              <p class="text-sm">Image failed to load</p>
              <p class="text-xs text-gray-400 mt-1 break-all">${originalImageUrl}</p>
              <button
                onclick="window.open('${originalImageUrl}', '_blank')"
                class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Open in new tab
              </button>
            </div>
          </div>
          ${caption}
        </figure>`;

      case 'table':
        if (!block.data.content || !Array.isArray(block.data.content))
          return '';
        const rows = block.data.content
          .map((row: string[], index: number) => {
            const cells = row
              .map((cell) =>
                index === 0 && block.data.withHeadings
                  ? `<th class="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold">${cell}</th>`
                  : `<td class="border border-gray-300 px-4 py-2">${cell}</td>`
              )
              .join('');
            return `<tr>${cells}</tr>`;
          })
          .join('');
        return `<div class="mb-6 overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300 text-sm">
            ${rows}
          </table>
        </div>`;

      default:
        return `<div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Unsupported block type: ${block.type}
        </div>`;
    }
  }
}
