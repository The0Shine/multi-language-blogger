import { UploadService } from '../services/upload.service';

export class CloudinaryImageTool {
  private uploadService: UploadService;
  private wrapper: HTMLElement | null = null;
  private data: any = {};

  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, config, api, readOnly }: any) {
    this.uploadService = config.uploadService;
    this.data = data;
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('cdx-block');

    if (this.data && this.data.file && this.data.file.url) {
      this._createImage(this.data.file.url, this.data.caption);
      return this.wrapper;
    }

    this._createUploader();
    return this.wrapper;
  }

  private _createUploader() {
    if (!this.wrapper) return;

    const uploader = document.createElement('div');
    uploader.classList.add('image-tool__uploader');
    uploader.innerHTML = `
      <div class="image-tool__upload-button">
        <input type="file" accept="image/*" style="display: none;">
        <div class="image-tool__upload-content">
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17h14v-5h-2v3H5v-3H3v5zM10 1L6 5h3v6h2V5h3L10 1z"/>
          </svg>
          <div class="image-tool__upload-text">Select an image</div>
        </div>
      </div>
      <div class="image-tool__url-input" style="margin-top: 10px;">
        <input type="url" placeholder="Paste image URL" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <button style="margin-top: 5px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Upload by URL</button>
      </div>
    `;

    const fileInput = uploader.querySelector('input[type="file"]') as HTMLInputElement;
    const uploadButton = uploader.querySelector('.image-tool__upload-button') as HTMLElement;
    const urlInput = uploader.querySelector('input[type="url"]') as HTMLInputElement;
    const urlButton = uploader.querySelector('button') as HTMLButtonElement;

    uploadButton.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this._uploadFile(file);
      }
    });

    urlButton.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (url) {
        this._uploadByUrl(url);
      }
    });

    this.wrapper.appendChild(uploader);
  }

  private _uploadFile(file: File) {
    this._showLoader();

    this.uploadService.uploadImage(file).subscribe({
      next: (response) => {
        this.data = {
          file: response.file,
          caption: ''
        };
        this._createImage(response.file.url, '');
      },
      error: (error) => {
        this._showError('Upload failed: ' + (error.error?.message || error.message));
      }
    });
  }

  private _uploadByUrl(url: string) {
    this._showLoader();

    this.uploadService.uploadImageByUrl(url).subscribe({
      next: (response) => {
        this.data = {
          file: response.file,
          caption: ''
        };
        this._createImage(response.file.url, '');
      },
      error: (error) => {
        this._showError('Upload failed: ' + (error.error?.message || error.message));
      }
    });
  }

  private _showLoader() {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = `
      <div class="image-tool__loader" style="text-align: center; padding: 20px;">
        <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div style="margin-top: 10px;">Uploading...</div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  private _showError(message: string) {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = `
      <div class="image-tool__error" style="color: red; text-align: center; padding: 20px;">
        ${message}
      </div>
    `;

    // Show uploader again after 3 seconds
    setTimeout(() => {
      this._createUploader();
    }, 3000);
  }

  private _createImage(url: string, caption: string) {
    if (!this.wrapper) return;

    this.wrapper.innerHTML = `
      <div class="image-tool__image">
        <img src="${url}" alt="${caption}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
        <input 
          type="text" 
          placeholder="Caption (optional)" 
          value="${caption}"
          style="width: 100%; margin-top: 10px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; text-align: center;"
        >
      </div>
    `;

    const captionInput = this.wrapper.querySelector('input[type="text"]') as HTMLInputElement;
    captionInput.addEventListener('input', (event) => {
      this.data.caption = (event.target as HTMLInputElement).value;
    });
  }

  save() {
    return this.data;
  }

  validate(savedData: any) {
    if (!savedData.file || !savedData.file.url) {
      return false;
    }
    return true;
  }

  static get sanitize() {
    return {
      url: {},
      caption: {
        br: true,
      },
    };
  }
}
