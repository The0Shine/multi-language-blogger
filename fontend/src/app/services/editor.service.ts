// import { Injectable } from '@angular/core';

// export interface ImageUploadResponse {
//   success: number;
//   file: {
//     url: string;
//   };
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class EditorService {
//   // Mock image upload - in real app, this would upload to your server/cloud storage
//   async uploadImage(file: File): Promise<ImageUploadResponse> {
//     return new Promise((resolve) => {
//       // Simulate upload delay
//       setTimeout(() => {
//         // Create a mock URL - in real app, this would be the actual uploaded image URL
//         const mockUrl = URL.createObjectURL(file);
//         resolve({
//           success: 1,
//           file: {
//             url: mockUrl,
//           },
//         });
//       }, 1000);
//     });
//   }

//   // Upload image by URL
//   async uploadImageByUrl(url: string): Promise<ImageUploadResponse> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve({
//           success: 1,
//           file: {
//             url: url,
//           },
//         });
//       }, 500);
//     });
//   }

//   // Fetch link data for link tool
//   async fetchLinkData(url: string): Promise<any> {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         // Mock link data - in real app, this would fetch actual meta data
//         resolve({
//           success: 1,
//           meta: {
//             title: 'Sample Link Title',
//             description: 'This is a sample description for the link',
//             image: {
//               url: 'https://via.placeholder.com/300x200',
//             },
//           },
//         });
//       }, 1000);
//     });
//   }
// }
