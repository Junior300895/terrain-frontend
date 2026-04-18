import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Depense {
  id: number;
  categorie: string;
  montant: number;
  description: string;
  dateDepense: string;
  referenceFacture?: string;
  fichierUrl?: string;
  fichierNom?: string;
  statut: string;
  notes?: string;
  createdAt: string;
}

export const CATEGORIES = [
  { value: 'ELECTRICITE', label: '⚡ Électricité (Woyofal)', color: '#f59e0b' },
  { value: 'EAU',         label: '💧 Eau',                   color: '#3b82f6' },
  { value: 'SALAIRE',     label: '👤 Salaire',               color: '#8b5cf6' },
  { value: 'ENTRETIEN',   label: '🔧 Entretien terrain',     color: '#06b6d4' },
  { value: 'MATERIEL',    label: '🛒 Matériel',              color: '#ec4899' },
  { value: 'AUTRE',       label: '📦 Autre',                 color: '#6b7280' },
];

@Injectable({ providedIn: 'root' })
export class DepenseService {
  private url = `${environment.apiUrl}/depenses`;

  constructor(private http: HttpClient) {}

  getAll(debut?: string, fin?: string, categorie?: string): Observable<Depense[]> {
    let params = '';
    if (debut)     params += `debut=${debut}&`;
    if (fin)       params += `fin=${fin}&`;
    if (categorie) params += `categorie=${categorie}`;
    return this.http.get<any>(`${this.url}?${params}`).pipe(
      map(r => {
        const data = r.data ?? r;
        // Le backend retourne { depenses: [], totalDepenses: 0 }
        return Array.isArray(data) ? data : (data?.depenses ?? []);
      })
    );
  }

  creer(data: FormData): Observable<Depense> {
    return this.http.post<any>(this.url, data).pipe(map(r => r.data ?? r));
  }

  modifier(id: number, data: FormData): Observable<Depense> {
    return this.http.patch<any>(`${this.url}/${id}`, data).pipe(map(r => r.data ?? r));
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  getUrlSignee(id: number): Observable<string> {
    return this.http.get<any>(`${this.url}/${id}/url-signee`)
      .pipe(map(r => (r.data ?? r)?.url ?? null));
  }

  getFichierUrl(id: number): string {
    return `${this.url}/${id}/fichier`;
  }

  getCategorieLabel(val: string): string {
    return CATEGORIES.find(c => c.value === val)?.label ?? val;
  }

  getCategorieColor(val: string): string {
    return CATEGORIES.find(c => c.value === val)?.color ?? '#6b7280';
  }
}
