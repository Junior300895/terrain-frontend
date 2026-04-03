import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Dashboard, Reservation } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl      = `${environment.apiUrl}/admin`;
  private paiementUrl = `${environment.apiUrl}/paiements`;
  private resaUrl     = `${environment.apiUrl}/reservations`;
  private usersUrl    = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<ApiResponse<Dashboard>>(`${this.apiUrl}/dashboard`).pipe(map(r => r.data));
  }

  getReservations(): Observable<Reservation[]> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/reservations`).pipe(map(r => r.data));
  }

  annulerReservation(reservationId: number): Observable<any> {
    return this.http.patch(`${this.resaUrl}/${reservationId}/annuler-admin`, {});
  }

  validerPaiementParReservation(reservationId: number, mode: string = 'SUR_PLACE', montant?: number): Observable<any> {
    let url = `${this.paiementUrl}/valider-reservation/${reservationId}?mode=${mode}`;
    if (montant && montant > 0) url += `&montant=${montant}`;
    return this.http.post(url, {});
  }

  ajouterSolde(reservationId: number, mode: string = 'SUR_PLACE', montant?: number): Observable<any> {
    let url = `${this.paiementUrl}/solde-reservation/${reservationId}?mode=${mode}`;
    if (montant && montant > 0) url += `&montant=${montant}`;
    return this.http.post(url, {});
  }

  getPaiementsReservation(reservationId: number): Observable<any> {
    return this.http.get<any>(`${this.paiementUrl}/reservation/${reservationId}`)
      .pipe(map(r => r.data));
  }

  // Réserver pour un client (admin)
  reserverPourClient(data: {
    terrainId: number;
    debut: string;
    telephone: string;
    nom?: string;
    prenom?: string;
    notes?: string;
  }): Observable<Reservation> {
    return this.http.post<ApiResponse<Reservation>>(`${this.resaUrl}/admin/reserver`, data)
      .pipe(map(r => r.data));
  }

  // Rechercher un client par téléphone
  rechercherClient(telephone: string): Observable<{ id: number; nom: string; prenom: string; telephone: string }[]> {
    return this.http.get<ApiResponse<any>>(`${this.usersUrl}/recherche?telephone=${telephone}`)
      .pipe(map(r => r.data ?? []));
  }
}
