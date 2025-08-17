export default class ItalicTool {
  private api: any;
  private button: HTMLButtonElement | null = null;
  private tag = 'EM';

  static get isInline() {
    return true;
  }

  static get sanitize() {
    return {
      em: {},
      i: {},
    };
  }

  static get shortcut() {
    return 'CMD+I';
  }

  static get title() {
    return 'Italic';
  }

  constructor({ api }: any) {
    this.api = api;
  }

  render(): HTMLButtonElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = '<em>I</em>';
    this.button.classList.add('ce-inline-tool');
    this.button.title = 'Italic';

    return this.button;
  }

  surround(range: Range): void {
    console.log('Italic tool surround called', range);
    if (!range) return;

    // Check if we're already inside an italic element
    const commonAncestor = range.commonAncestorContainer;
    const italicParent = this.findItalicParent(commonAncestor);

    if (italicParent) {
      // Remove italic formatting
      console.log('Removing italic formatting');
      this.unwrapItalic(italicParent, range);
    } else {
      // Add italic formatting
      console.log('Adding italic formatting');
      this.wrapWithItalic(range);
    }
  }

  private findItalicParent(node: Node): Element | null {
    let current =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
    while (current && current !== document.body) {
      if (current.tagName === 'EM' || current.tagName === 'I') {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  private wrapWithItalic(range: Range): void {
    const selectedText = range.extractContents();
    const italic = document.createElement(this.tag);
    italic.appendChild(selectedText);
    range.insertNode(italic);

    // Select the italic element
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(italic);
      selection.addRange(newRange);
    }
  }

  private unwrapItalic(italicElement: Element, range: Range): void {
    const parent = italicElement.parentNode;
    if (!parent) return;

    // Move all children out of the italic element
    while (italicElement.firstChild) {
      parent.insertBefore(italicElement.firstChild, italicElement);
    }

    // Remove the empty italic element
    parent.removeChild(italicElement);
  }

  checkState(selection: Selection): boolean {
    const anchorNode = selection.anchorNode;
    if (!anchorNode) return false;

    const element =
      anchorNode.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement
        : (anchorNode as Element);

    return element?.closest('EM, I') !== null;
  }
}
