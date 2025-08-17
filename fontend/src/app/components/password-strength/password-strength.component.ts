import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PasswordCriteria {
  id: string;
  label: string;
  met: boolean;
  required: boolean;
}

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-3" *ngIf="password">
      <!-- Strength Bar -->
      <div class="flex items-center space-x-3 mb-2">
        <span class="text-sm text-gray-600 min-w-0 flex-shrink-0">Độ mạnh:</span>
        <div class="flex-1 bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-300"
            [style.width.%]="strengthPercentage"
            [style.background-color]="strengthColor"
          ></div>
        </div>
        <span class="text-xs font-medium min-w-0 flex-shrink-0" [style.color]="strengthColor">
          {{ strengthLabel }}
        </span>
      </div>

      <!-- Compact Requirements -->
      <div class="flex flex-wrap gap-2 text-xs">
        <span
          *ngFor="let criteria of criteriaList"
          class="inline-flex items-center px-2 py-1 rounded-full transition-colors duration-200"
          [class.bg-green-100]="criteria.met"
          [class.text-green-700]="criteria.met"
          [class.bg-red-100]="criteria.required && !criteria.met"
          [class.text-red-700]="criteria.required && !criteria.met"
          [class.bg-gray-100]="!criteria.required && !criteria.met"
          [class.text-gray-600]="!criteria.required && !criteria.met"
        >
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              *ngIf="criteria.met"
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
            <path
              *ngIf="!criteria.met"
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          {{ criteria.label }}
          <span *ngIf="criteria.required" class="ml-1 text-red-500">*</span>
        </span>
      </div>
    </div>
  `,
  styles: []
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() password: string = '';

  criteriaList: PasswordCriteria[] = [
    {
      id: 'length',
      label: '6+ ký tự',
      met: false,
      required: true
    },
    {
      id: 'uppercase',
      label: 'Chữ hoa',
      met: false,
      required: false
    },
    {
      id: 'lowercase',
      label: 'Chữ thường',
      met: false,
      required: false
    },
    {
      id: 'number',
      label: 'Số',
      met: false,
      required: false
    },
    {
      id: 'special',
      label: 'Ký tự đặc biệt',
      met: false,
      required: false
    }
  ];

  strengthPercentage = 0;
  strengthLabel = 'Yếu';
  strengthColor = '#ef4444';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.checkPasswordCriteria();
      this.calculateStrength();
    }
  }

  private checkPasswordCriteria(): void {
    const password = this.password || '';

    this.criteriaList.forEach(criteria => {
      switch (criteria.id) {
        case 'length':
          criteria.met = password.length >= 6;
          break;
        case 'uppercase':
          criteria.met = /[A-Z]/.test(password);
          break;
        case 'lowercase':
          criteria.met = /[a-z]/.test(password);
          break;
        case 'number':
          criteria.met = /[0-9]/.test(password);
          break;
        case 'special':
          criteria.met = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
          break;
      }
    });
  }

  private calculateStrength(): void {
    const metCriteria = this.criteriaList.filter(c => c.met).length;
    const totalCriteria = this.criteriaList.length;
    const requiredMet = this.criteriaList.filter(c => c.required && c.met).length;
    const totalRequired = this.criteriaList.filter(c => c.required).length;

    // Calculate percentage based on met criteria
    this.strengthPercentage = Math.max((metCriteria / totalCriteria) * 100, 10);

    // Determine strength level
    if (requiredMet < totalRequired) {
      this.strengthLabel = 'Quá ngắn';
      this.strengthColor = '#ef4444';
    } else if (metCriteria === 1) {
      this.strengthLabel = 'Yếu';
      this.strengthColor = '#f97316';
    } else if (metCriteria === 2) {
      this.strengthLabel = 'Trung bình';
      this.strengthColor = '#eab308';
    } else if (metCriteria === 3) {
      this.strengthLabel = 'Tốt';
      this.strengthColor = '#84cc16';
    } else if (metCriteria === 4) {
      this.strengthLabel = 'Mạnh';
      this.strengthColor = '#22c55e';
    } else if (metCriteria === 5) {
      this.strengthLabel = 'Rất mạnh';
      this.strengthColor = '#16a34a';
    }
  }

  // Public method to check if password meets minimum requirements
  public isPasswordValid(): boolean {
    return this.criteriaList.filter(c => c.required).every(c => c.met);
  }

  // Public method to get strength score (0-5)
  public getStrengthScore(): number {
    return this.criteriaList.filter(c => c.met).length;
  }
}
