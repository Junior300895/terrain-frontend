import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Reservation } from '../models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/reservations`;
  constructor(private http: HttpClient) {}

  creer(data: { creneauId: number; notes?: string }): Observable<Reservation> {
    return this.http.post<ApiResponse<Reservation>>(this.apiUrl, data).pipe(map(r => r.data));
  }
  mesReservations(): Observable<Reservation[]> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/mes-reservations`).pipe(map(r => r.data));
  }
  parCode(code: string): Observable<Reservation> {
    return this.http.get<ApiResponse<Reservation>>(`${this.apiUrl}/code/${code}`).pipe(map(r => r.data));
  }
  annuler(id: number): Observable<Reservation> {
    return this.http.patch<ApiResponse<Reservation>>(`${this.apiUrl}/${id}/annuler`, {}).pipe(map(r => r.data));
  }
}
