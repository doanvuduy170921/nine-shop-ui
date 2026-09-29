import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Brand} from "../models/brand.model";

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  private apiUrl = '${API_BASE_URL}/brand/get-all';

  constructor(private http: HttpClient) { }

  getAllBrand(): Observable<{ data: Brand[], message: string, success: boolean }> {
    return this.http.get<{ data: Brand[], message: string, success: boolean }>(
      this.apiUrl,
      {
        headers: this.getAuthHeaders()
      }
    );
  }
}
