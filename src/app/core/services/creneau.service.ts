import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Creneau } from '../models';

@Injectable({ providedIn: 'root' })
export class CreneauService {
  private apiUrl = `${environment.apiUrl}/creneaux`;
  constructor(private http: HttpClient) {}

  getDisponibles(terrainId: number): Observable<Creneau[]> {
    return this.http.get<ApiResponse<Creneau[]>>(`${this.apiUrl}/disponibles/${terrainId}`).pipe(map(r => r.data));
  }

  getSemaine(terrainId: number, debut: Date): Observable<Creneau[]> {
    const pad = (n: number) => String(n).padStart(2, '0');
    const local = `${debut.getFullYear()}-${pad(debut.getMonth()+1)}-${pad(debut.getDate())}` +
                  `T${pad(debut.getHours())}:${pad(debut.getMinutes())}:00`;
    return this.http.get<ApiResponse<Creneau[]>>(`${this.apiUrl}/semaine/${terrainId}?debut=${local}`)
      .pipe(map(r => r.data));
  }

  creer(data: any): Observable<Creneau> {
    return this.http.post<ApiResponse<Creneau>>(this.apiUrl, data).pipe(map(r => r.data));
  }

  bloquerHeure(terrainId: number, date: string, heure: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/bloquer-heure`, { terrainId, date, heure })
      .pipe(map(r => r.data));
  }

  bloquer(id: number): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/bloquer`, {}).pipe(map(r => r.data));
  }

  liberer(id: number): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/liberer`, {}).pipe(map(r => r.data));
  }
}
