import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private apiUrl = 'http://localhost:3000/languages';

  constructor(private http: HttpClient) {}

  getLanguages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createLanguage(language: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, language);
  }

  updateLanguage(id: number, language: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, language);
  }

  deleteLanguage(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
