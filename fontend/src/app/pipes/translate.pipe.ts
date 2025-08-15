import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make it impure so it updates when language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription = new Subscription();
  private lastKey: string = '';
  private lastTranslation: string = '';

  constructor(private languageService: LanguageService) {
    // Subscribe to translation changes
    this.subscription = this.languageService.translations$.subscribe(() => {
      // Force pipe to re-evaluate when translations change
      this.lastKey = '';
    });
  }

  transform(key: string, params?: { [key: string]: string }): string {
    if (!key) return '';

    // Cache optimization - only translate if key changed
    if (key === this.lastKey && !params) {
      return this.lastTranslation;
    }

    this.lastKey = key;
    this.lastTranslation = this.languageService.translate(key, params);
    
    return this.lastTranslation;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
