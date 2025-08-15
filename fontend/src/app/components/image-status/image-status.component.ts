// import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Subscription } from 'rxjs';
// import { EditorImageManagerService, EditorImage } from '../../services/editor-image-manager.service';

// @Component({
//   selector: 'app-image-status',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="image-status-panel" *ngIf="showPanel">
//       <div class="panel-header">
//         <h3>Images in Editor</h3>
//         <button class="close-btn" (click)="togglePanel()">×</button>
//       </div>

//       <div class="panel-content">
//         <div class="summary">
//           <div class="stat">
//             <span class="label">Total:</span>
//             <span class="value">{{ summary.total }}</span>
//           </div>
//           <div class="stat temp">
//             <span class="label">Temporary:</span>
//             <span class="value">{{ summary.temp }}</span>
//           </div>
//           <div class="stat permanent">
//             <span class="label">Permanent:</span>
//             <span class="value">{{ summary.permanent }}</span>
//           </div>
//           <div class="stat deleted" *ngIf="summary.deleted > 0">
//             <span class="label">Deleted:</span>
//             <span class="value">{{ summary.deleted }}</span>
//           </div>
//         </div>

//         <div class="images-list" *ngIf="currentImages.length > 0">
//           <h4>Current Images</h4>
//           <div class="image-item" *ngFor="let image of currentImages">
//             <img [src]="image.url" [alt]="'Image ' + image.public_id" class="thumbnail">
//             <div class="image-info">
//               <div class="public-id">{{ image.public_id }}</div>
//               <div class="details">
//                 <span class="size" *ngIf="image.width && image.height">
//                   {{ image.width }}×{{ image.height }}
//                 </span>
//                 <span class="format" *ngIf="image.format">{{ image.format }}</span>
//                 <span class="file-size" *ngIf="image.bytes">
//                   {{ formatBytes(image.bytes) }}
//                 </span>
//               </div>
//               <div class="status" [class.temp]="image.is_temp" [class.permanent]="!image.is_temp">
//                 {{ image.is_temp ? 'Temporary' : 'Permanent' }}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div class="actions" *ngIf="summary.temp > 0">
//           <button class="btn btn-primary" (click)="moveAllToPermanent()">
//             Move All to Permanent
//           </button>
//         </div>

//         <div class="actions" *ngIf="summary.deleted > 0">
//           <button class="btn btn-danger" (click)="cleanupDeleted()">
//             Cleanup Deleted Images
//           </button>
//         </div>
//       </div>
//     </div>

//     <button class="toggle-btn" (click)="togglePanel()" [class.active]="showPanel">
//       <span class="icon">🖼️</span>
//       <span class="count" *ngIf="summary.total > 0">{{ summary.total }}</span>
//     </button>
//   `,
//   styles: [`
//     .image-status-panel {
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       width: 350px;
//       max-height: 80vh;
//       background: white;
//       border: 1px solid #e1e5e9;
//       border-radius: 8px;
//       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//       z-index: 1000;
//       overflow: hidden;
//     }

//     .panel-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding: 16px;
//       border-bottom: 1px solid #e1e5e9;
//       background: #f8f9fa;
//     }

//     .panel-header h3 {
//       margin: 0;
//       font-size: 16px;
//       font-weight: 600;
//     }

//     .close-btn {
//       background: none;
//       border: none;
//       font-size: 20px;
//       cursor: pointer;
//       padding: 0;
//       width: 24px;
//       height: 24px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     }

//     .panel-content {
//       padding: 16px;
//       max-height: calc(80vh - 60px);
//       overflow-y: auto;
//     }

//     .summary {
//       display: grid;
//       grid-template-columns: 1fr 1fr;
//       gap: 12px;
//       margin-bottom: 20px;
//     }

//     .stat {
//       display: flex;
//       justify-content: space-between;
//       padding: 8px 12px;
//       background: #f8f9fa;
//       border-radius: 4px;
//     }

//     .stat.temp {
//       background: #fff3cd;
//       border: 1px solid #ffeaa7;
//     }

//     .stat.permanent {
//       background: #d1ecf1;
//       border: 1px solid #bee5eb;
//     }

//     .stat.deleted {
//       background: #f8d7da;
//       border: 1px solid #f5c6cb;
//     }

//     .label {
//       font-weight: 500;
//     }

//     .value {
//       font-weight: 600;
//     }

//     .images-list h4 {
//       margin: 0 0 12px 0;
//       font-size: 14px;
//       font-weight: 600;
//     }

//     .image-item {
//       display: flex;
//       gap: 12px;
//       padding: 12px;
//       border: 1px solid #e1e5e9;
//       border-radius: 6px;
//       margin-bottom: 8px;
//     }

//     .thumbnail {
//       width: 60px;
//       height: 60px;
//       object-fit: cover;
//       border-radius: 4px;
//     }

//     .image-info {
//       flex: 1;
//       min-width: 0;
//     }

//     .public-id {
//       font-size: 12px;
//       font-weight: 500;
//       color: #666;
//       margin-bottom: 4px;
//       word-break: break-all;
//     }

//     .details {
//       font-size: 11px;
//       color: #888;
//       margin-bottom: 4px;
//     }

//     .details span {
//       margin-right: 8px;
//     }

//     .status {
//       font-size: 11px;
//       padding: 2px 6px;
//       border-radius: 3px;
//       display: inline-block;
//     }

//     .status.temp {
//       background: #fff3cd;
//       color: #856404;
//     }

//     .status.permanent {
//       background: #d1ecf1;
//       color: #0c5460;
//     }

//     .actions {
//       margin-top: 16px;
//     }

//     .btn {
//       width: 100%;
//       padding: 8px 16px;
//       border: none;
//       border-radius: 4px;
//       cursor: pointer;
//       font-size: 14px;
//       font-weight: 500;
//       margin-bottom: 8px;
//     }

//     .btn-primary {
//       background: #007bff;
//       color: white;
//     }

//     .btn-danger {
//       background: #dc3545;
//       color: white;
//     }

//     .toggle-btn {
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       width: 48px;
//       height: 48px;
//       border-radius: 50%;
//       background: white;
//       border: 1px solid #e1e5e9;
//       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//       cursor: pointer;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       z-index: 999;
//       position: relative;
//     }

//     .toggle-btn.active {
//       display: none;
//     }

//     .toggle-btn .icon {
//       font-size: 20px;
//     }

//     .toggle-btn .count {
//       position: absolute;
//       top: -4px;
//       right: -4px;
//       background: #dc3545;
//       color: white;
//       border-radius: 50%;
//       width: 20px;
//       height: 20px;
//       font-size: 11px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-weight: 600;
//     }
//   `]
// })
// export class ImageStatusComponent implements OnInit, OnDestroy {
//   private imageManager = inject(EditorImageManagerService);

//   showPanel = false;
//   currentImages: EditorImage[] = [];
//   summary = {
//     total: 0,
//     temp: 0,
//     permanent: 0,
//     deleted: 0
//   };

//   private subscriptions: Subscription[] = [];

//   ngOnInit() {
//     // Subscribe to image changes
//     this.subscriptions.push(
//       this.imageManager.currentImages$.subscribe(images => {
//         this.currentImages = images;
//         this.updateSummary();
//       })
//     );

//     // Subscribe to deleted images changes
//     this.subscriptions.push(
//       this.imageManager.deletedImages$.subscribe(() => {
//         this.updateSummary();
//       })
//     );
//   }

//   ngOnDestroy() {
//     this.subscriptions.forEach(sub => sub.unsubscribe());
//   }

//   togglePanel() {
//     this.showPanel = !this.showPanel;
//   }

//   updateSummary() {
//     this.summary = this.imageManager.getSessionSummary();
//   }

//   moveAllToPermanent() {
//     this.imageManager.moveAllTempToPermanent('posts').subscribe({
//       next: (result) => {
//         console.log('Moved images to permanent:', result);
//         // Update will happen automatically via subscription
//       },
//       error: (error) => {
//         console.error('Failed to move images:', error);
//       }
//     });
//   }

//   cleanupDeleted() {
//     this.imageManager.cleanupDeletedImages().subscribe({
//       next: (results) => {
//         console.log('Cleanup results:', results);
//         // Update will happen automatically via subscription
//       },
//       error: (error) => {
//         console.error('Failed to cleanup:', error);
//       }
//     });
//   }

//   formatBytes(bytes: number): string {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   }
// }
