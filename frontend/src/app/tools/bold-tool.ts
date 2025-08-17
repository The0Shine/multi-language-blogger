export default class BoldTool {
  private api: any;
  private button: HTMLButtonElement | null = null;
  private tag = 'STRONG';

  static get isInline() {
    return true;
  }

  static get sanitize() {
    return {
      strong: {},
      b: {},
    };
  }

  static get shortcut() {
    return 'CMD+B';
  }

  static get title() {
    return 'Bold';
  }

  constructor({ api }: any) {
    this.api = api;
  }

  render(): HTMLButtonElement {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = '<strong>B</strong>';
    this.button.classList.add('ce-inline-tool');
    this.button.title = 'Bold';

    return this.button;
  }

  surround(range: Range): void {
    console.log('Bold tool surround called', range);
    if (!range) return;

    // Check if we're already inside a bold element
    const commonAncestor = range.commonAncestorContainer;
    const boldParent = this.findBoldParent(commonAncestor);

    if (boldParent) {
      // Remove bold formatting
      console.log('Removing bold formatting');
      this.unwrapBold(boldParent, range);
    } else {
      // Add bold formatting
      console.log('Adding bold formatting');
      this.wrapWithBold(range);
    }
  }

  private findBoldParent(node: Node): Element | null {
    let current =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
    while (current && current !== document.body) {
      if (current.tagName === 'STRONG' || current.tagName === 'B') {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  private wrapWithBold(range: Range): void {
    const selectedText = range.extractContents();
    const bold = document.createElement(this.tag);
    bold.appendChild(selectedText);
    range.insertNode(bold);

    // Select the bold element
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(bold);
      selection.addRange(newRange);
    }
  }

  private unwrapBold(boldElement: Element, range: Range): void {
    const parent = boldElement.parentNode;
    if (!parent) return;

    // Move all children out of the bold element
    while (boldElement.firstChild) {
      parent.insertBefore(boldElement.firstChild, boldElement);
    }

    // Remove the empty bold element
    parent.removeChild(boldElement);
  }

  checkState(selection: Selection): boolean {
    const anchorNode = selection.anchorNode;
    if (!anchorNode) return false;

    const element =
      anchorNode.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement
        : (anchorNode as Element);

    return element?.closest('STRONG, B') !== null;
  }
}
