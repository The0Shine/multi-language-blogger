import type {
  API,
  BlockTool,
  BlockToolConstructorOptions,
} from '@editorjs/editorjs';

interface QuoteData {
  text: string;
  caption: string;
}

interface QuoteConfig {
  quotePlaceholder?: string;
  captionPlaceholder?: string;
}

export default class CustomQuoteTool implements BlockTool {
  private api: API;
  private data: QuoteData;
  private config: QuoteConfig;
  private wrapper: HTMLDivElement;
  private quoteEl!: HTMLDivElement;
  private captionEl!: HTMLDivElement;

  static get isContentable() {
    return true;
  }

  static get toolbox() {
    return {
      icon: '<svg width="15" height="14" viewBox="0 0 15 14" xmlns="http://www.w3.org/2000/svg"><path d="M13.53 6.185H11.01V4.628a1.123 1.123 0 0 0-1.222-1.122h-2.45A1.123 1.123 0 0 0 6.01 4.628v3.463c0 .635.457 1.122 1.122 1.122h.967v2.104a.5.5 0 0 0 .86.353l2.08-2.08c.22-.22.353-.52.353-.86v-3.463zm-6 0H5.01V4.628a1.123 1.123 0 0 0-1.222-1.122h-2.45A1.123 1.123 0 0 0 .01 4.628v3.463c0 .635.457 1.122 1.122 1.122h.967v2.104a.5.5 0 0 0 .86.353l2.08-2.08c.22-.22.353-.52.353-.86v-3.463z"/></svg>',
      title: 'Quote',
    };
  }

  constructor({
    data,
    api,
    config,
  }: BlockToolConstructorOptions<QuoteData, QuoteConfig>) {
    this.api = api;
    this.data = {
      text: data.text || '',
      caption: data.caption || '',
    };
    const safeConfig = config || {};
    this.config = {
      quotePlaceholder: safeConfig.quotePlaceholder || 'Enter a quote',
      captionPlaceholder: safeConfig.captionPlaceholder || "Quote's author",
    };

    this.wrapper = this.drawView();
  }

  drawView(): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('ce-quote');

    this.quoteEl = document.createElement('div');
    this.quoteEl.classList.add('ce-quote__text');
    this.quoteEl.contentEditable = 'true';
    this.quoteEl.dataset['placeholder'] = this.config.quotePlaceholder;
    this.quoteEl.innerHTML = this.data.text;

    this.captionEl = document.createElement('div');
    this.captionEl.classList.add('ce-quote__caption');
    this.captionEl.contentEditable = 'true';
    this.captionEl.dataset['placeholder'] = this.config.captionPlaceholder;
    this.captionEl.innerHTML = this.data.caption;

    wrapper.appendChild(this.quoteEl);
    wrapper.appendChild(this.captionEl);

    return wrapper;
  }

  render(): HTMLDivElement {
    return this.wrapper;
  }

  save(blockContent: HTMLDivElement): QuoteData {
    return {
      text: this.quoteEl.innerHTML,
      caption: this.captionEl.innerHTML,
    };
  }

  validate(savedData: QuoteData): boolean {
    return savedData.text.trim() !== '';
  }

  onPaste(event: CustomEvent) {
    const { data } = event.detail;
    this.data = {
      text: data.text || '',
      caption: data.caption || '',
    };
  }

  get isEmpty(): boolean {
    return (
      this.quoteEl.textContent?.trim() === '' &&
      this.captionEl.textContent?.trim() === ''
    );
  }
}
