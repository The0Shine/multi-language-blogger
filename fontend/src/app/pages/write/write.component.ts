import {
  Component,
  type OnInit,
  type OnDestroy,
  type ElementRef,
  ViewChild,
  type AfterViewInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
import {
  PostService,
  CreatePostRequest,
  UpdatePostRequest,
} from '../../services/post.service';
import { CategoryService, Category } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { EditorStateService } from '../../services/editor-state.service';
import { ToastService } from '../../services/toast.service';
import { UploadService } from '../../services/upload.service';
import { EditorImageManagerService } from '../../services/editor-image-manager.service';
// import { ImageStatusComponent } from '../../components/image-status/image-status.component';
// Import EditorJS and tools
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Delimiter from '@editorjs/delimiter';
import LinkTool from '@editorjs/link';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Paragraph from '@editorjs/paragraph';
// Import inline tools
import CustomQuoteTool from './custom-quote-tool';

@Component({
  selector: 'app-write',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.css'],
})
export class WriteComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  title = '';
  editor: EditorJS | null = null;
  showPublishModal = false;

  isLoading = false;
  isSaving = false;
  lastSaved: Date | null = null;

  // New properties for real API integration
  categories: Category[] = [];
  selectedCategoryIds: number[] = [];
  publishStatus: 'draft' | 'published' = 'draft';
  isEditMode = false;
  editPostId: string | null = null;
  currentUser: any = null;
  private publishSubscription?: Subscription;

  // Category search and filter properties
  categorySearchQuery = '';
  filteredCategories: Category[] = [];
  showCategoryDropdown = false;

  // Custom block menu state
  showBlockMenu = false;
  blockMenuPosition = { x: 0, y: 0 };
  currentBlockIndex: number | null = null;
  activeBlockContent: HTMLElement | null = null;

  // Custom inline toolbar state
  showInlineToolbar = false;
  inlineToolbarPosition = { x: 0, y: 0 };
  selectedRange: Range | null = null;

  // State for selected block (image/quote)
  selectedBlockId: string | null = null;

  // Editor tools configuration
  private getEditorTools() {
    return {
      paragraph: {
        class: Paragraph,
        inlineToolbar: true, // Enable simple inline toolbar
        config: {
          placeholder: 'Tell your story...',
          preserveBlank: false,
        },
      },
      header: {
        class: Header,
        inlineToolbar: true, // Enable simple inline toolbar
        config: {
          placeholder: 'Header',
          levels: [1, 2, 3, 4],
          defaultLevel: 2,
        },
        shortcut: 'CMD+SHIFT+H',
      },
      link: {
        class: LinkTool,
        config: {
          endpoint: 'http://localhost:8008/fetchUrl',
        },
      },
      list: {
        class: List,
        inlineToolbar: false,
        config: {
          defaultStyle: 'unordered',
        },
        shortcut: 'CMD+SHIFT+L',
      },
      quote: {
        class: CustomQuoteTool, // Use the custom quote tool
        inlineToolbar: false,
        config: {
          quotePlaceholder: 'Enter a quote',
          captionPlaceholder: "Quote's author",
        },
      },
      delimiter: {
        class: Delimiter,
        shortcut: 'CMD+SHIFT+D',
      },
      linkTool: {
        class: LinkTool,
        config: {
          endpoint: '/api/fetchUrl',
        },
      },
      image: {
        class: ImageTool,
        config: {
          endpoints: {
            byFile: 'http://localhost:3000/api/upload/image',
            byUrl: 'http://localhost:3000/api/upload/image-by-url',
          },
          field: 'image',
          types: 'image/*',
          captionPlaceholder: 'Enter image caption...',
          withBorder: false,
          withBackground: false,
          stretched: false,
          uploader: {
            uploadByFile: async (file: File) => {
              console.log('Uploading file:', file.name);
              try {
                const response = await firstValueFrom(
                  this.uploadService.uploadImage(file)
                );
                if (response && response.file) {
                  // Add image to manager for tracking
                  this.imageManager.addImage({
                    public_id: response.file.public_id,
                    url: response.file.url,
                    is_temp: response.file.is_temp || true,
                    width: response.file.width,
                    height: response.file.height,
                    format: response.file.format,
                    bytes: response.file.bytes,
                  });

                  return {
                    success: 1,
                    file: {
                      url: response.file.url,
                      public_id: response.file.public_id,
                      width: response.file.width,
                      height: response.file.height,
                      format: response.file.format,
                      bytes: response.file.bytes,
                      is_temp: response.file.is_temp || true,
                    },
                  };
                } else {
                  throw new Error('Invalid response from upload service');
                }
              } catch (error) {
                console.error('Upload error:', error);
                throw error;
              }
            },
            uploadByUrl: async (url: string) => {
              console.log('Fetching image from URL:', url);
              try {
                const response = await firstValueFrom(
                  this.uploadService.uploadImageByUrl(url)
                );
                if (response && response.file) {
                  // Add image to manager for tracking
                  this.imageManager.addImage({
                    public_id: response.file.public_id,
                    url: response.file.url,
                    is_temp: response.file.is_temp || true,
                    width: response.file.width,
                    height: response.file.height,
                    format: response.file.format,
                    bytes: response.file.bytes,
                  });

                  return {
                    success: 1,
                    file: {
                      url: response.file.url,
                      public_id: response.file.public_id,
                      width: response.file.width,
                      height: response.file.height,
                      format: response.file.format,
                      bytes: response.file.bytes,
                      is_temp: response.file.is_temp || true,
                    },
                  };
                } else {
                  throw new Error('Invalid response from upload service');
                }
              } catch (error) {
                console.error('Upload by URL error:', error);
                throw error;
              }
            },
          },
        },
      },
      embed: {
        class: Embed,
        config: {
          services: {
            youtube: true,
            coub: true,
            codepen: true,
          },
        },
      },
    };
  }

  private boundHandleClickOutside = this.handleClickOutside.bind(this);
  private boundHandleTextSelection = this.handleTextSelection.bind(this);
  private boundHandleGlobalKeydown = this.handleGlobalKeydown.bind(this);
  private boundHandleEditorClick = this.handleEditorClick.bind(this);
  private boundHandleWindowScroll = this.handleWindowScroll.bind(this); // New scroll handler

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private postService: PostService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private editorStateService: EditorStateService,
    private toastService: ToastService,
    private uploadService: UploadService,
    private imageManager: EditorImageManagerService
  ) {}

  ngOnInit() {
    // Check authentication
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load categories
    this.loadCategories();

    // Subscribe to publish trigger from header
    this.publishSubscription =
      this.editorStateService.triggerPublish$.subscribe(() => {
        if (this.isEditMode) {
          this.quickSave();
        } else {
          this.openPublishModal();
        }
      });

    // Check if editing existing post
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.editPostId = params['id'];
        // Don't load here, wait for editor to be ready
      }
    });
  }

  ngAfterViewInit() {
    this.initializeEditor();
    window.addEventListener('scroll', this.boundHandleWindowScroll); // Add scroll listener
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }

    // Cleanup deleted images from cloud storage
    this.imageManager.cleanupDeletedImages().subscribe({
      next: (results) => {
        console.log('Cleanup deleted images results:', results);
      },
      error: (error) => {
        console.error('Failed to cleanup deleted images:', error);
      },
    });

    // Clear image manager session
    this.imageManager.clearSession();

    // Unsubscribe from publish trigger
    if (this.publishSubscription) {
      this.publishSubscription.unsubscribe();
    }

    document.removeEventListener(
      'keydown',
      this.boundHandleGlobalKeydown,
      true
    );
    this.editorContainer.nativeElement.removeEventListener(
      'click',
      this.boundHandleEditorClick
    );
    document.removeEventListener('mousedown', this.boundHandleClickOutside);
    document.removeEventListener('mouseup', this.boundHandleTextSelection);
    window.removeEventListener('scroll', this.boundHandleWindowScroll); // Remove scroll listener
    console.log('Editor destroyed and event listeners removed.');
  }

  private initializeEditor() {
    this.editor = new EditorJS({
      holder: this.editorContainer.nativeElement,
      tools: this.getEditorTools() as any,
      onReady: () => {
        console.log('Editor.js is ready to work!');
        console.log('Available tools:', Object.keys(this.getEditorTools()));

        // Check if we need to load content for edit mode
        if (this.isEditMode && this.editPostId) {
          console.log('Loading post for edit mode:', this.editPostId);
          this.loadPostForEdit(this.editPostId);
        }

        document.addEventListener(
          'keydown',
          this.boundHandleGlobalKeydown,
          true
        );
        this.setupTextSelectionHandler();
      },
      placeholder: 'Tell your story...',
      minHeight: 0,
      autofocus: true,
      defaultBlock: 'paragraph',
      inlineToolbar: true,
      sanitizer: {
        b: true,
        i: true,
        u: true,
        s: true,
        strong: true,
        em: true,
        a: {
          href: true,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      },
    });

    this.editorContainer.nativeElement.addEventListener(
      'click',
      this.boundHandleEditorClick
    );
    document.addEventListener('mousedown', this.boundHandleClickOutside);
    document.addEventListener('mouseup', this.boundHandleTextSelection);
  }

  private setupTextSelectionHandler() {
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();
        const editorElement = this.editorContainer.nativeElement;
        const isWithinEditor = editorElement.contains(
          range.commonAncestorContainer
        );

        if (selectedText && isWithinEditor && selectedText.length > 0) {
          this.selectedRange = range.cloneRange();
          this.showCustomInlineToolbar(range);
        } else {
          this.hideInlineToolbar();
        }
      } else {
        this.hideInlineToolbar();
      }
    });
  }

  private showCustomInlineToolbar(range: Range) {
    const rect = range.getBoundingClientRect();
    const toolbarWidth = 200;
    const toolbarHeight = 40;
    this.inlineToolbarPosition = {
      x: Math.max(10, rect.left + rect.width / 2 - toolbarWidth / 2),
      y: rect.top - toolbarHeight - 10,
    };
    this.showInlineToolbar = true;
  }

  private hideInlineToolbar() {
    this.showInlineToolbar = false;
    this.selectedRange = null;
  }

  private handleEditorClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const blockContent = target.closest('.ce-block__content');
    const blockElement = target.closest('.ce-block') as HTMLElement;

    // Handle Custom + button logic
    if (blockContent) {
      const rect = blockContent.getBoundingClientRect();
      const isPlusButtonClicked =
        event.clientX >= rect.left - 50 &&
        event.clientX <= rect.left - 50 + 32 &&
        event.clientY >= rect.top + rect.height / 2 - 16 &&
        event.clientY <= rect.top + rect.height / 2 + 16;

      if (isPlusButtonClicked) {
        event.preventDefault();
        event.stopPropagation();
        if (blockElement && this.editor) {
          const blockId = blockElement.dataset['id'];
          let index = -1;
          const blocksCount = this.editor.blocks.getBlocksCount();
          for (let i = 0; i < blocksCount; i++) {
            const block = this.editor.blocks.getBlockByIndex(i);
            if (block && block.id === blockId) {
              index = i;
              break;
            }
          }
          if (index !== -1) {
            this.currentBlockIndex = index;
            this.blockMenuPosition = {
              x: rect.left,
              y: rect.top - 10,
            };
            if (
              this.showBlockMenu &&
              this.activeBlockContent === blockContent
            ) {
              this.hideBlockMenu();
            } else {
              this.showBlockMenuWithAnimation(blockContent as HTMLElement);
            }
          }
        }
        return;
      }
    }

    // Handle Custom Block Selection
    if (this.selectedBlockId) {
      const prevSelectedBlock = document.querySelector(
        `.ce-block[data-id="${this.selectedBlockId}"]`
      );
      if (prevSelectedBlock) {
        prevSelectedBlock.classList.remove('is-selected-custom');
      }
      this.selectedBlockId = null;
    }

    if (blockElement) {
      const isImageTarget = target.closest(
        '.image-tool--empty, .image-tool--uploading, .image-tool img'
      );

      if (isImageTarget && blockElement) {
        blockElement.classList.add('is-selected-custom');
        this.selectedBlockId = blockElement.dataset['id'] || null;
      }
    }
  }

  private showBlockMenuWithAnimation(blockContent: HTMLElement) {
    this.hideBlockMenu();
    blockContent.classList.add('menu-active');
    this.activeBlockContent = blockContent;
    this.showBlockMenu = true;
  }

  private hideBlockMenu() {
    this.showBlockMenu = false;
    if (this.activeBlockContent) {
      this.activeBlockContent.classList.remove('menu-active');
    }
  }

  private handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.showBlockMenu && !target.closest('.custom-block-menu')) {
      const blockContent = this.activeBlockContent;
      let isClickOnPlusButtonArea = false;
      if (blockContent) {
        const rect = blockContent.getBoundingClientRect();
        isClickOnPlusButtonArea =
          event.clientX >= rect.left - 50 &&
          event.clientX <= rect.left - 50 + 32 &&
          event.clientY >= rect.top + rect.height / 2 - 16 &&
          event.clientY <= rect.top + rect.height / 2 + 16;
      }
      if (!isClickOnPlusButtonArea) {
        this.hideBlockMenu();
      }
    }

    if (this.showInlineToolbar && !target.closest('.custom-inline-toolbar')) {
      this.hideInlineToolbar();
    }

    if (this.selectedBlockId) {
      const selectedBlockElement = document.querySelector(
        `.ce-block[data-id="${this.selectedBlockId}"]`
      );
      if (selectedBlockElement && !selectedBlockElement.contains(target)) {
        selectedBlockElement.classList.remove('is-selected-custom');
        this.selectedBlockId = null;
      }
    }

    // Check if click is outside category dropdown
    if (this.showCategoryDropdown) {
      const categoryContainer = target.closest('.relative');
      const isSearchInput = target.matches(
        'input[placeholder="Search categories..."]'
      );
      const isDropdownItem = target.closest('.absolute.z-10');

      if (!categoryContainer && !isSearchInput && !isDropdownItem) {
        this.showCategoryDropdown = false;
      }
    }
  }

  private handleWindowScroll() {
    if (this.showBlockMenu && this.activeBlockContent) {
      const rect = this.activeBlockContent.getBoundingClientRect();
      this.blockMenuPosition = {
        x: rect.left,
        y: rect.top - 10,
      };
    }
  }

  private handleTextSelection(_event: MouseEvent) {
    // This will be handled by selectionchange event
  }

  toggleFormat(format: 'bold' | 'italic') {
    if (!this.selectedRange) return;
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(this.selectedRange);
      document.execCommand(format, false);
      if (selection.rangeCount > 0) {
        this.selectedRange = selection.getRangeAt(0).cloneRange();
      }
    }
  }

  isFormatActive(format: 'bold' | 'italic'): boolean {
    if (!this.selectedRange) return false;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return document.queryCommandState(format);
    }
    return false;
  }

  async convertToHeader(level: 1 | 2 | 3 | 4) {
    if (!this.editor || !this.selectedRange) return;
    try {
      const currentBlockIndex = this.editor.blocks.getCurrentBlockIndex();
      const currentBlock = await this.editor.blocks.getBlockByIndex(
        currentBlockIndex
      );
      if (currentBlock) {
        const savedData = await currentBlock.save();
        const currentText = savedData?.data?.text ?? '';

        await this.editor.blocks.update(currentBlock.id, {
          text: currentText,
          level: level,
        });

        await this.editor.blocks.convert(currentBlock.id, 'header', {
          text: currentText,
          level: level,
        });
      }
    } catch (error) {
      console.error('Failed to convert to header:', error);
    }
  }

  async convertToQuote() {
    if (!this.editor || !this.selectedRange) return;
    try {
      const currentBlockIndex = this.editor.blocks.getCurrentBlockIndex();
      const currentBlock = await this.editor.blocks.getBlockByIndex(
        currentBlockIndex
      );
      if (currentBlock) {
        const selectedText = this.selectedRange.toString().trim();
        const savedData = await currentBlock.save();
        const currentText = savedData?.data?.text ?? '';

        await this.editor.blocks.convert(currentBlock.id, 'quote', {
          text: selectedText || currentText,
          caption: '',
        });
      }
    } catch (error) {
      console.error('Failed to convert to quote:', error);
    }
    this.hideInlineToolbar();
  }

  createLink() {
    if (!this.selectedRange) return;
    const url = prompt('Enter URL:');
    if (url) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.selectedRange);
        document.execCommand('createLink', false, url);
      }
    }
    this.hideInlineToolbar();
  }

  onTitleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.editor) {
        setTimeout(() => {
          const editorElement =
            this.editorContainer.nativeElement.querySelector(
              '[contenteditable="true"]'
            );
          if (editorElement) {
            editorElement.focus();
          }
        }, 100);
      }
    }
  }

  autoResizeTextarea(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  async addBlock(type: string) {
    if (!this.editor) return;
    this.hideBlockMenu();
    const targetIndex =
      this.currentBlockIndex !== null
        ? this.currentBlockIndex + 1
        : this.editor.blocks.getBlocksCount();

    try {
      switch (type) {
        case 'paragraph':
          await this.editor.blocks.insert('paragraph', {}, {}, targetIndex);
          break;
        case 'header-1':
          await this.editor.blocks.insert(
            'header',
            { text: '', level: 1 },
            {},
            targetIndex
          );
          break;
        case 'header-2':
          await this.editor.blocks.insert(
            'header',
            { text: '', level: 2 },
            {},
            targetIndex
          );
          break;
        case 'header-3':
          await this.editor.blocks.insert(
            'header',
            { text: '', level: 3 },
            {},
            targetIndex
          );
          break;
        case 'header-4':
          await this.editor.blocks.insert(
            'header',
            { text: '', level: 4 },
            {},
            targetIndex
          );
          break;
        case 'image':
          await this.editor.blocks.insert('image', {}, {}, targetIndex);
          const block = this.editor.blocks.getBlockByIndex(targetIndex);
          const blockElement = block?.holder as HTMLElement;
          if (blockElement) {
            const isImageBlock = blockElement.querySelector('.image-tool');
            if (isImageBlock) {
              blockElement.classList.add('is-selected-custom');
              this.selectedBlockId = blockElement.dataset['id'] || null;
            }
          }
          break;
        case 'quote':
          await this.editor.blocks.insert(
            'quote',
            { text: '', caption: '' },
            {},
            targetIndex
          );
          this.editor.caret.setToBlock(targetIndex, 'start');
          break;
        default:
          await this.editor.blocks.insert('paragraph', {}, {}, targetIndex);
          break;
      }
      this.editor.caret.setToBlock(targetIndex);
    } catch (error) {
      console.error('Failed to add block:', error);
    }
  }

  async openPublishModal() {
    if (!this.editor) return;
    try {
      this.showPublishModal = true;
    } catch (error) {
      console.error('Failed to open publish modal:', error);
    }
  }

  closePublishModal() {
    this.showPublishModal = false;
  }

  // Category management methods
  filterCategories() {
    if (!this.categorySearchQuery.trim()) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter((category) =>
        category.name
          .toLowerCase()
          .includes(this.categorySearchQuery.toLowerCase())
      );
    }
  }

  selectCategory(category: Category) {
    const categoryId = +category.categoryid;
    if (
      !this.isCategorySelected(categoryId) &&
      this.selectedCategoryIds.length < 5
    ) {
      this.selectedCategoryIds.push(categoryId);
    }
    this.categorySearchQuery = '';
    this.showCategoryDropdown = false;
    this.filteredCategories = [...this.categories];
  }

  removeCategory(categoryId: number) {
    this.selectedCategoryIds = this.selectedCategoryIds.filter(
      (selectedId) => selectedId !== categoryId
    );
  }

  getSelectedCategories(): Category[] {
    return this.categories.filter((category) =>
      this.selectedCategoryIds.includes(+category.categoryid)
    );
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  // New methods for API integration
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        console.log('Write component - Categories loaded:', categories);
        this.categories = categories.filter((cat) => cat.status === 1); // Only active categories
        this.filteredCategories = [...this.categories]; // Initialize filtered categories
        console.log('Write component - Filtered categories:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  loadPostForEdit(postId: string) {
    this.isLoading = true;
    this.postService.getPost(+postId).subscribe({
      next: (post) => {
        if (post) {
          this.title = post.title;
          this.selectedCategoryIds = post.categories.map(
            (cat) => cat.categoryid
          );

          // Load content into editor after it's initialized
          if (this.editor) {
            this.loadContentIntoEditor(post.content);
          } else {
            // Wait for editor to be initialized
            setTimeout(() => {
              if (this.editor) {
                this.loadContentIntoEditor(post.content);
              }
            }, 1000);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.isLoading = false;
        alert('Failed to load post for editing.');
      },
    });
  }

  async loadContentIntoEditor(content: any) {
    if (!this.editor) {
      console.error('Editor not initialized');
      return;
    }

    try {
      console.log('Loading content into editor:', content);
      let editorData;

      if (typeof content === 'string') {
        try {
          editorData = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse content JSON:', parseError);
          // Fallback to simple paragraph
          editorData = {
            blocks: [
              {
                type: 'paragraph',
                data: {
                  text: content,
                },
              },
            ],
          };
        }
      } else {
        editorData = content;
      }

      console.log('Rendering editor data:', editorData);
      await this.editor.render(editorData);
      console.log('Content loaded successfully');
    } catch (error) {
      console.error('Error loading content into editor:', error);
      // Try to render empty content as fallback
      try {
        await this.editor.render({
          time: Date.now(),
          blocks: [],
          version: '2.31.0',
        });
      } catch (fallbackError) {
        console.error('Fallback render also failed:', fallbackError);
      }
    }
  }

  toggleCategory(categoryId: number) {
    const index = this.selectedCategoryIds.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategoryIds.splice(index, 1);
    } else {
      this.selectedCategoryIds.push(categoryId);
    }
  }

  async publishPost() {
    console.log('publishPost called with status:', this.publishStatus);

    if (!this.editor || !this.title.trim()) {
      alert('Please provide a title for your post.');
      return;
    }

    this.isSaving = true;

    try {
      const editorData = await this.editor.save();
      console.log('Editor data saved:', editorData);
      console.log('Editor data blocks:', editorData.blocks);
      console.log('Editor data JSON:', JSON.stringify(editorData));

      // Validate that we have content
      if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
        alert('Please add some content to your post.');
        this.isSaving = false;
        return;
      }

      const status = this.publishStatus === 'published' ? 1 : 0; // 1 = published, 0 = draft

      // Update image tracking from editor data
      this.imageManager.updateImagesFromEditor(editorData);

      // Move temp images to permanent storage if publishing
      if (this.publishStatus === 'published') {
        const tempImages = this.imageManager.getTempImages();
        if (tempImages.length > 0) {
          console.log(
            `Moving ${tempImages.length} temporary images to permanent storage...`
          );
          try {
            await firstValueFrom(
              this.imageManager.moveAllTempToPermanent('posts')
            );
            console.log('Images moved to permanent storage successfully');
          } catch (error) {
            console.error('Failed to move images to permanent storage:', error);
            this.toastService.warning(
              'Some images may not be saved permanently'
            );
          }
        }
      }

      if (this.isEditMode && this.editPostId) {
        // Update existing post
        const updateData: UpdatePostRequest = {
          title: this.title,
          content: JSON.stringify(editorData),
          categoryids:
            this.selectedCategoryIds.length > 0
              ? this.selectedCategoryIds
              : undefined,
          status: status,
        };

        this.postService.updatePost(+this.editPostId, updateData).subscribe({
          next: (post) => {
            this.isSaving = false;
            this.closePublishModal();
            const message =
              this.publishStatus === 'published'
                ? 'Post published successfully!'
                : 'Post saved as draft!';
            this.toastService.success(message);
            this.router.navigate(['/post', post.postid]);
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Error updating post:', error);
            this.toastService.error('Failed to update post. Please try again.');
          },
        });
      } else {
        // Create new post
        const postData: CreatePostRequest = {
          userid: this.currentUser.userid,
          title: this.title,
          content: JSON.stringify(editorData),
          languageid: 1, // Default to English, you might want to make this configurable
          categoryids:
            this.selectedCategoryIds.length > 0
              ? this.selectedCategoryIds
              : undefined,
          status: status,
        };

        this.postService.createPostForAllLanguages(postData).subscribe({
          next: (post) => {
            this.isSaving = false;
            this.closePublishModal();
            const message =
              this.publishStatus === 'published'
                ? 'Post published successfully!'
                : 'Post saved as draft!';
            this.toastService.success(message);
            this.router.navigate(['/post', post.data.postid]);
          },
          error: (error) => {
            this.isSaving = false;
            console.error('Error creating post:', error);
            const message =
              this.publishStatus === 'published'
                ? 'Failed to publish post. Please try again.'
                : 'Failed to save draft. Please try again.';
            this.toastService.error(message);
          },
        });
      }
    } catch (error) {
      this.isSaving = false;
      console.error('Error saving editor data:', error);
      this.toastService.error('Failed to save post content. Please try again.');
    }
  }

  async quickSave() {
    if (
      !this.editor ||
      !this.title.trim() ||
      !this.isEditMode ||
      !this.editPostId
    ) {
      this.toastService.warning('Nothing to save or not in edit mode.');
      return;
    }
    this.isSaving = true;
    try {
      const editorData = await this.editor.save();
      if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
        this.toastService.warning('Please add some content to your post.');
        this.isSaving = false;
        return;
      }
      const updateData: UpdatePostRequest = {
        title: this.title,
        content: JSON.stringify(editorData),
        categoryids:
          this.selectedCategoryIds.length > 0
            ? this.selectedCategoryIds
            : undefined,
        // Không đổi status khi quick save
      };
      this.postService.updatePost(+this.editPostId, updateData).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.success('Changes saved!');
          this.lastSaved = new Date();
        },
        error: (error) => {
          this.isSaving = false;
          this.toastService.error('Failed to save changes. Please try again.');
          console.error('Quick save error:', error);
        },
      });
    } catch (error) {
      this.isSaving = false;
      this.toastService.error('Failed to save changes. Please try again.');
      console.error('Quick save error:', error);
    }
  }

  private async handleGlobalKeydown(event: KeyboardEvent) {
    if (!this.editor) return;
    //xóa ảnh được chọn nếu click
    if (
      this.selectedBlockId &&
      (event.key === 'Backspace' || event.key === 'Delete')
    ) {
      event.preventDefault();
      await this.deleteSelectedBlock();
      return;
    }
    //chặn xóa block rỗng khi ở ô caption của image
    const activeElement = document.activeElement as HTMLElement;

    if (
      activeElement &&
      activeElement.classList.contains('image-tool__caption') &&
      (activeElement.textContent?.trim() === '' ||
        activeElement.innerText.trim() === '') &&
      (event.key === 'Backspace' || event.key === 'Delete')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    //xóa quote block nếu nhấn backspace hoặc delete
    if (event.key === 'Backspace' || event.key === 'Delete') {
      const currentBlockIndex = this.editor.blocks.getCurrentBlockIndex();
      const currentBlock =
        this.editor.blocks.getBlockByIndex(currentBlockIndex);

      if (currentBlock?.name === 'quote') {
        if (currentBlock.isEmpty) {
          event.preventDefault();
          event.stopPropagation();
          try {
            await this.editor.blocks.delete(currentBlockIndex);
            const newCount = this.editor.blocks.getBlocksCount();
            if (newCount > 0) {
              const moveIndex =
                currentBlockIndex > 0 ? currentBlockIndex - 1 : 0;
              this.editor.caret.setToBlock(moveIndex, 'end');
            } else {
              await this.editor.blocks.insert('paragraph', {}, {}, 0);
              this.editor.caret.setToBlock(0, 'start');
            }
          } catch (error) {
            console.error('Error deleting quote block:', error);
          }
          return;
        }
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      this.toggleFormat('bold');
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      this.toggleFormat('italic');
      return;
    }
  }

  private async deleteSelectedBlock() {
    if (!this.selectedBlockId || !this.editor) return;

    try {
      const blockIdToDelete = this.selectedBlockId;
      const blocksCount = this.editor.blocks.getBlocksCount();
      let actualIndex = -1;

      for (let i = 0; i < blocksCount; i++) {
        const block = this.editor.blocks.getBlockByIndex(i);
        if (block && (block as any).id === blockIdToDelete) {
          actualIndex = i;
          break;
        }
      }

      if (actualIndex !== -1) {
        await this.editor.blocks.delete(actualIndex);
        this.selectedBlockId = null;

        const newCount = this.editor.blocks.getBlocksCount();
        if (newCount > 0) {
          const moveIndex = actualIndex > 0 ? actualIndex - 1 : 0;
          this.editor.caret.setToBlock(moveIndex, 'end');
        } else {
          await this.editor.blocks.insert('paragraph', {}, {}, 0);
          this.editor.caret.setToBlock(0, 'start');
        }
      }
    } catch (error) {
      console.error('Error deleting selected block:', error);
    }
  }
}
