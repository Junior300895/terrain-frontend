import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface RapportData {
  periode: { debut: string; fin: string };
  reservations: any[];
  revenus: {
    total: number; confirme: number; enAttente: number;
    annule: number; rembourse: number;
    parJour: { date: string; montant: number }[];
  };
  occupation: {
    totalCreneaux: number; reserves: number; confirmes: number;
    annules: number; tauxOccupation: number;
    parJour: { date: string; reserves: number; disponibles: number; taux: number }[];
  };
  clients: any[];
}

@Injectable({ providedIn: 'root' })
export class RapportService {
  private url = `${environment.apiUrl}/rapports`;
  constructor(private http: HttpClient) {}

  generer(debut: string, fin: string): Observable<RapportData> {
    return this.http.get<any>(`${this.url}?debut=${debut}&fin=${fin}`)
      .pipe(map(r => r.data));
  }

  getUrlCSV(debut: string, fin: string): string {
    return `${this.url}/csv?debut=${debut}&fin=${fin}`;
  }

  getUrlExcel(debut: string, fin: string): string {
    return `${this.url}/excel?debut=${debut}&fin=${fin}`;
  }
}
