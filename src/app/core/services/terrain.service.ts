import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Terrain } from '../models';

@Injectable({ providedIn: 'root' })
export class TerrainService {
  private apiUrl = `${environment.apiUrl}/terrains`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Terrain[]> {
    return this.http.get<ApiResponse<Terrain[]>>(this.apiUrl).pipe(map(r => r.data));
  }
  getById(id: number): Observable<Terrain> {
    return this.http.get<ApiResponse<Terrain>>(`${this.apiUrl}/${id}`).pipe(map(r => r.data));
  }
}
