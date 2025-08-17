import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpService } from './http.service';

// Backend response interface
interface BackendCategory {
  categoryid: number;
  category_name: string;
  description?: string;
  created_at: string;
}

export interface Category {
  categoryid: number;
  name: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  post_count?: number; // Number of posts in this category
}

export interface CreateCategoryRequest {
  category_name: string;
}

export interface UpdateCategoryRequest {
  category_name?: string;
  status?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private httpService: HttpService) {}

  getCategories(): Observable<Category[]> {
    return this.httpService.get<any>('/categories').pipe(
      map((response: any) => {
        console.log('Categories API response:', response);
        // Handle nested data structure: response.data.data contains the array
        const categories: BackendCategory[] =
          response.data.data || response.data.items || response.data || [];
        return categories.map((category: BackendCategory) =>
          this.mapCategoryToFrontend(category)
        );
      })
    );
  }

  getCategory(id: number): Observable<Category> {
    return this.httpService.get<any>(`/categories/${id}`).pipe(
      map((response: any) => {
        const categoryData: BackendCategory =
          response.data.category || response.data;
        return this.mapCategoryToFrontend(categoryData);
      })
    );
  }

  createCategory(categoryData: CreateCategoryRequest): Observable<Category> {
    return this.httpService.post<any>('/categories', categoryData).pipe(
      map((response: any) => {
        const category: BackendCategory =
          response.data.category || response.data;
        return this.mapCategoryToFrontend(category);
      })
    );
  }

  updateCategory(
    id: number,
    categoryData: UpdateCategoryRequest
  ): Observable<Category> {
    return this.httpService.put<any>(`/categories/${id}`, categoryData).pipe(
      map((response: any) => {
        const category: BackendCategory =
          response.data.category || response.data;
        return this.mapCategoryToFrontend(category);
      })
    );
  }

  deleteCategory(id: number): Observable<any> {
    return this.httpService
      .delete<any>(`/categories/${id}`)
      .pipe(map((response: any) => response.data));
  }

  private mapCategoryToFrontend(category: any): Category {
    if (!category) {
      console.error('Category data is null or undefined');
    }

    return {
      categoryid: category.categoryid,
      name: category.category_name,
      status: category.status,
      created_at: new Date(category.created_at),
      updated_at: new Date(category.updated_at),
      post_count: category.post_count || 0,
    };
  }
}
