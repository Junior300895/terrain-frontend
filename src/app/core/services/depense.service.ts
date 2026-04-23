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

export const CATEGORIES: { value: string; label: string; icon: string; groupe: string }[] = [
  // Matériel
  { value: 'BALLON',               label: 'Achat de ballons',                        icon: '⚽', groupe: 'Matériel' },
  { value: 'DOSSARDS',             label: 'Achat de dossards',                       icon: '🦺', groupe: 'Matériel' },
  { value: 'PRODUITS_ENTRETIEN',   label: 'Produits entretien dossard et toilette',  icon: '🧴', groupe: 'Matériel' },
  // Entretien
  { value: 'CURAGE_BASSIN',        label: 'Curage du bassin',                        icon: '🏊', groupe: 'Entretien' },
  { value: 'ENTRETIEN_BASSIN',     label: 'Entretien et nettoyage autour du bassin', icon: '🧹', groupe: 'Entretien' },
  // Factures
  { value: 'ELECTRICITE',          label: 'Facture Woyofal (Électricité)',            icon: '⚡', groupe: 'Factures' },
  { value: 'EAU',                  label: 'Facture SDE (Eau)',                        icon: '💧', groupe: 'Factures' },
  // Honoraires
  { value: 'FEMME_MENAGE',         label: 'Honoraire Femme de ménage',               icon: '🧽', groupe: 'Honoraires' },
  { value: 'GARDIENNAGE',          label: 'Honoraire Gardiennage',                   icon: '🔐', groupe: 'Honoraires' },
  { value: 'CHEF_EXPLOITATION',    label: "Honoraire Chef d'exploitation comptable", icon: '📋', groupe: 'Honoraires' },
  { value: 'GESTIONNAIRE_PELOUSE', label: 'Honoraire Gestionnaire Pelouse',          icon: '🌿', groupe: 'Honoraires' },
  { value: 'ADJOINT_CHEF',         label: "Adjoint Chef d'exploitation",             icon: '👔', groupe: 'Honoraires' },
  { value: 'TRESORIER',            label: 'Trésorier',                               icon: '💼', groupe: 'Honoraires' },
  { value: 'SUPERVISEUR',          label: 'Superviseur (Président)',                 icon: '👑', groupe: 'Honoraires' },
  // Autre
  { value: 'AUTRE',                label: 'Autre',                                   icon: '📦', groupe: 'Autre' },
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
        return Array.isArray(data) ? data : (data?.depenses ?? []);
      })
    );
  }

  creer(data: FormData): Observable<Depense> {
    return this.http.post<any>(this.url, data).pipe(map(r => r.data ?? r));
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  getUrlSignee(id: number): Observable<string> {
    return this.http.get<any>(`${this.url}/${id}/url-signee`)
      .pipe(map(r => (r.data ?? r)?.url ?? null));
  }

  getCat(val: string) {
    return CATEGORIES.find(c => c.value === val);
  }

  getCategorieColor(val: string): string {
    const colors: Record<string, string> = {
      BALLON: '#10b981', DOSSARDS: '#f59e0b', PRODUITS_ENTRETIEN: '#06b6d4',
      CURAGE_BASSIN: '#3b82f6', ENTRETIEN_BASSIN: '#8b5cf6',
      ELECTRICITE: '#f59e0b', EAU: '#3b82f6',
      FEMME_MENAGE: '#ec4899', GARDIENNAGE: '#ef4444',
      CHEF_EXPLOITATION: '#6366f1', GESTIONNAIRE_PELOUSE: '#22c55e',
      ADJOINT_CHEF: '#a855f7', TRESORIER: '#14b8a6', SUPERVISEUR: '#f97316',
      AUTRE: '#6b7280',
    };
    return colors[val] ?? '#6b7280';
  }

  getCategorieLabel(val: string): string {
    const cat = CATEGORIES.find(c => c.value === val);
    return cat ? cat.icon + ' ' + cat.label : val;
  }

  modifier(id: number, data: FormData): Observable<Depense> {
    return this.http.patch<any>(`${this.url}/${id}`, data).pipe(map(r => r.data ?? r));
  }
}
