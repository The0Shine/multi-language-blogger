import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TranslationProgress {
  isTranslating: boolean;
  currentLanguage: string;
  currentLanguageIndex: number;
  totalLanguages: number;
  completedLanguages: string[];
  failedLanguages: string[];
  progressPercentage: number;
  currentStep: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationProgressService {
  private progressSubject = new BehaviorSubject<TranslationProgress>({
    isTranslating: false,
    currentLanguage: '',
    currentLanguageIndex: 0,
    totalLanguages: 0,
    completedLanguages: [],
    failedLanguages: [],
    progressPercentage: 0,
    currentStep: ''
  });

  public progress$ = this.progressSubject.asObservable();

  constructor() { }

  startTranslation(totalLanguages: number) {
    this.progressSubject.next({
      isTranslating: true,
      currentLanguage: '',
      currentLanguageIndex: 0,
      totalLanguages,
      completedLanguages: [],
      failedLanguages: [],
      progressPercentage: 0,
      currentStep: 'Preparing translation...'
    });
  }

  updateProgress(
    currentLanguage: string, 
    currentIndex: number, 
    step: string = 'Translating...'
  ) {
    const current = this.progressSubject.value;
    const progressPercentage = Math.round((currentIndex / current.totalLanguages) * 100);
    
    this.progressSubject.next({
      ...current,
      currentLanguage,
      currentLanguageIndex: currentIndex,
      progressPercentage,
      currentStep: step
    });
  }

  completeLanguage(language: string) {
    const current = this.progressSubject.value;
    const completedLanguages = [...current.completedLanguages, language];
    const progressPercentage = Math.round((completedLanguages.length / current.totalLanguages) * 100);
    
    this.progressSubject.next({
      ...current,
      completedLanguages,
      progressPercentage,
      currentStep: `Completed ${language}`
    });
  }

  failLanguage(language: string, error?: string) {
    const current = this.progressSubject.value;
    const failedLanguages = [...current.failedLanguages, language];
    
    this.progressSubject.next({
      ...current,
      failedLanguages,
      currentStep: `Failed to translate ${language}${error ? ': ' + error : ''}`
    });
  }

  finishTranslation(success: boolean = true) {
    const current = this.progressSubject.value;
    
    this.progressSubject.next({
      ...current,
      isTranslating: false,
      progressPercentage: 100,
      currentStep: success ? 'Translation completed!' : 'Translation finished with errors'
    });

    // Reset after 2 seconds
    setTimeout(() => {
      this.resetProgress();
    }, 2000);
  }

  resetProgress() {
    this.progressSubject.next({
      isTranslating: false,
      currentLanguage: '',
      currentLanguageIndex: 0,
      totalLanguages: 0,
      completedLanguages: [],
      failedLanguages: [],
      progressPercentage: 0,
      currentStep: ''
    });
  }

  getCurrentProgress(): TranslationProgress {
    return this.progressSubject.value;
  }
}
