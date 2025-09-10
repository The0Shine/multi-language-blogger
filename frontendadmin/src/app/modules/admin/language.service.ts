import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Language {
  languageid: number;
  language_name: string;
  locale_code: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface LanguageListResponse {
  success: boolean;
  data: {
    message?: string;
    data: Language[];
  };
}

interface LanguageDetailResponse {
  success: boolean;
  data: {
    message?: string;
    data: Language;
  };
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private apiUrl =
    'https://multi-language-blogger.onrender.com/api/languages/admin/languages';

  constructor(private http: HttpClient) {}

  getLanguages(onlyActive?: boolean): Observable<LanguageListResponse> {
    const params: any = {};
    if (onlyActive) params.onlyActive = 1;
    return this.http.get<LanguageListResponse>(this.apiUrl, { params });
  }

  getLanguageById(languageid: number): Observable<LanguageDetailResponse> {
    return this.http.get<LanguageDetailResponse>(
      `${this.apiUrl}/${languageid}`
    );
  }

  createLanguage(
    language: Partial<Language>
  ): Observable<LanguageDetailResponse> {
    return this.http.post<LanguageDetailResponse>(this.apiUrl, language);
  }

  updateLanguage(
    languageid: number,
    language: Partial<Language>
  ): Observable<LanguageDetailResponse> {
    return this.http.put<LanguageDetailResponse>(
      `${this.apiUrl}/${languageid}`,
      language
    );
  }

  deleteLanguage(
    languageid: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${languageid}`
    );
  }

  permanentDeleteLanguage(
    languageid: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${languageid}/hard`
    );
  }

  restoreLanguage(
    languageid: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/${languageid}/restore`,
      {}
    );
  }
}
