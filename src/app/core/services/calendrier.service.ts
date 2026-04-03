import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

export interface CalendrierCellule {
  creneauId: number | null;
  debut: string;
  fin: string;
  statut: 'DISPONIBLE' | 'RESERVE' | 'BLOQUE' | null; // null = passé
  prix: number;
  clientNom?: string;
  codeConfirmation?: string;
}

export type CalendrierSemaine = Record<string, CalendrierCellule[]>;

@Injectable({ providedIn: 'root' })
export class CalendrierService {
  private url = `${environment.apiUrl}/calendrier`;
  constructor(private http: HttpClient) {}

  getSemaine(terrainId: number, lundi: Date): Observable<CalendrierSemaine> {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${lundi.getFullYear()}-${pad(lundi.getMonth()+1)}-${pad(lundi.getDate())}`;
    return this.http.get<ApiResponse<CalendrierSemaine>>(`${this.url}/semaine/${terrainId}?lundi=${dateStr}`)
      .pipe(map(r => r.data));
  }

  reserver(terrainId: number, debut: Date, notes: string): Observable<any> {
    const pad = (n: number) => String(n).padStart(2, '0');
    const debutStr = `${debut.getFullYear()}-${pad(debut.getMonth()+1)}-${pad(debut.getDate())}` +
                     `T${pad(debut.getHours())}:00:00`;
    return this.http.post<ApiResponse<any>>(`${this.url}/reserver`, {
      terrainId, debut: debutStr, notes
    }).pipe(map(r => r.data));
  }
}
