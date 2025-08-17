import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Modal Backdrop -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 bg-black/60  flex items-center justify-center z-50 p-4"
      (click)="onBackdropClick($event)"
    >
      <!-- Modal Container -->
      <div
        class="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <!-- Step 1: Initial Warning -->
        <div *ngIf="step === 1" class="p-6">
          <!-- Header -->
          <div class="flex items-center mb-6">
            <div
              class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4"
            >
              <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Delete Account</h2>
              <p class="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>

          <!-- Warning Content -->
          <div class="mb-6">
            <p class="text-gray-700 mb-4">
              Are you absolutely sure you want to delete your account? This will
              permanently:
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button
              type="button"
              (click)="onCancel()"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Keep My Account
            </button>
            <button
              type="button"
              (click)="nextStep()"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Continue
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Step 2: Final Confirmation -->
        <div *ngIf="step === 2" class="p-6">
          <!-- Header -->
          <div class="flex items-center mb-6">
            <div
              class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4"
            >
              <i class="fas fa-skull-crossbones text-red-600 text-xl"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-red-900">Final Warning</h2>
              <p class="text-sm text-red-600">
                Last chance to change your mind
              </p>
            </div>
          </div>

          <!-- Final Warning -->
          <div class="mb-6">
            <div class="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-4">
              <p class="text-red-900 font-semibold text-center text-lg mb-2">
                🚨 POINT OF NO RETURN 🚨
              </p>
              <p class="text-red-800 text-center">
                This will permanently delete your account and all your content.
                This action <strong>CANNOT</strong> be undone.
              </p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Type <strong>"DELETE MY ACCOUNT"</strong> to confirm:
              </label>
              <input
                type="text"
                [(ngModel)]="confirmationText"
                placeholder="Type exactly: DELETE MY ACCOUNT"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                [class.border-red-500]="
                  confirmationText && !isConfirmationValid
                "
                [class.border-green-500]="isConfirmationValid"
              />
              <p
                *ngIf="confirmationText && !isConfirmationValid"
                class="text-red-600 text-sm mt-1"
              >
                Please type exactly "DELETE MY ACCOUNT"
              </p>
              <p
                *ngIf="isConfirmationValid"
                class="text-green-600 text-sm mt-1"
              >
                ✓ Confirmation text is correct
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button
              type="button"
              (click)="previousStep()"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Go Back
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              [disabled]="!isConfirmationValid || isDeleting"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <i *ngIf="isDeleting" class="fas fa-spinner fa-spin mr-2"></i>
              <i *ngIf="!isDeleting" class="fas fa-trash mr-2"></i>
              {{ isDeleting ? 'Deleting...' : 'Delete Forever' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Modal animation */
      .fixed {
        animation: fadeIn 0.2s ease-out;
      }

      .bg-white {
        animation: slideIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Smooth transitions */
      button {
        transition: all 0.2s ease;
      }

      input {
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
    `,
  ],
})
export class DeleteAccountModalComponent {
  @Input() isOpen = false;
  @Input() isDeleting = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  step = 1;
  confirmationText = '';

  get isConfirmationValid(): boolean {
    return this.confirmationText === 'DELETE MY ACCOUNT';
  }

  nextStep() {
    this.step = 2;
  }

  previousStep() {
    this.step = 1;
    this.confirmationText = '';
  }

  onConfirm() {
    if (this.isConfirmationValid && !this.isDeleting) {
      this.confirm.emit();
    }
  }

  onCancel() {
    this.step = 1;
    this.confirmationText = '';
    this.cancel.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
