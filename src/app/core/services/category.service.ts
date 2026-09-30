import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  private apiUrl = `${environment.apiUrl}/category/get-all`;

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<{ data: Category[], message: string, success: boolean }> {
    return this.http.get<{ data: Category[], message: string, success: boolean; }>(
      `${environment.apiUrl}/category/get-all`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

}
