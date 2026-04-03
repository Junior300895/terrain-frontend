import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { Reservation } from '../../core/models';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-up">
      <div class="pb-6" style="border-bottom:1px solid var(--border);">
        <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--accent);">Mon espace</p>
        <h1 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">Mes réservations</h1>
        <p class="text-sm mt-1" style="color:var(--text-secondary);">Historique complet de vos créneaux</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-24">
          <div class="text-center"><div class="text-5xl mb-4">⏳</div>
            <p style="color:var(--text-secondary);">Chargement...</p></div>
        </div>
      } @else if (reservations().length === 0) {
        <div class="card text-center py-20">
          <div class="text-6xl mb-4">📋</div>
          <h3 class="font-display font-bold text-2xl uppercase mb-2">Aucune réservation</h3>
          <p class="text-sm mb-6" style="color:var(--text-secondary);">Vous n'avez pas encore réservé de créneau</p>
          <a routerLink="/reservations" class="btn-primary">Réserver maintenant</a>
        </div>
      } @else {
        <div class="space-y-3 animate-fade-up-2">
          @for (resa of reservations(); track resa.id) {
            <div class="card card-hover" style="border-left:3px solid {{ getAccentColor(resa.statut) }};">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-3 flex-wrap">
                    <code class="text-xs px-2 py-0.5 rounded font-mono"
                          style="background:var(--bg-surface);color:var(--accent);border:1px solid var(--border-accent);">
                      {{ resa.codeConfirmation }}
                    </code>
                    <span [class]="getStatutClass(resa.statut)">{{ getLabelStatut(resa.statut) }}</span>
                  </div>
                  <p class="font-display font-semibold text-lg uppercase tracking-wide">{{ resa.creneau.terrainNom }}</p>
                  <p class="text-sm" style="color:var(--text-secondary);">
                    {{ formatDate(resa.creneau.debut) }} &nbsp;·&nbsp;
                    {{ formatHeure(resa.creneau.debut) }} – {{ formatHeure(resa.creneau.fin) }}
                  </p>
                  @if (resa.paiement) {
                    <p class="text-xs" style="color:var(--text-muted);">
                      {{ getLabelPaiement(resa.paiement.statut) }} · {{ getLabelMode(resa.paiement.mode) }}
                    </p>
                  }
                </div>
                <div class="flex flex-col sm:items-end gap-3">
                  <span class="font-display font-bold text-2xl" style="color:var(--accent);">
                    {{ resa.montantTotal | number:'1.0-0' }} <span class="text-sm font-normal">FCFA</span>
                  </span>
                  @if (peutAnnuler(resa)) {
                    <button (click)="annuler(resa)" [disabled]="annulationEnCours() === resa.id"
                            class="btn-danger text-sm px-4 py-2">
                      {{ annulationEnCours() === resa.id ? 'Annulation...' : 'Annuler' }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MyReservationsComponent implements OnInit {
  reservations = signal<Reservation[]>([]); loading = signal(true); annulationEnCours = signal<number | null>(null);
  constructor(private reservationSvc: ReservationService) {}
  ngOnInit() { this.reservationSvc.mesReservations().subscribe({ next: d => { this.reservations.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  annuler(resa: Reservation) {
    if (!confirm('Confirmer l\'annulation ?')) return;
    this.annulationEnCours.set(resa.id);
    this.reservationSvc.annuler(resa.id).subscribe({ next: u => { this.reservations.update(l => l.map(r => r.id === resa.id ? u : r)); this.annulationEnCours.set(null); }, error: () => this.annulationEnCours.set(null) });
  }
  peutAnnuler(r: Reservation): boolean {
    // Seules les réservations EN_ATTENTE (non payées) peuvent être annulées par le client
    // Une réservation CONFIRMEE (paiement validé) ne peut pas être annulée
    if (r.statut !== 'EN_ATTENTE') return false;
    // Vérifier le délai de 2h
    return new Date(r.creneau.debut).getTime() > Date.now() + 2 * 3600 * 1000;
  }
  formatDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }); }
  formatHeure(d: string) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
  getAccentColor(s: string) { return ({CONFIRMEE:'var(--blue)',EN_ATTENTE:'var(--yellow)',ANNULEE:'var(--red)',EXPIREE:'var(--text-muted)'} as any)[s] ?? 'var(--border)'; }
  getStatutClass(s: string) { return ({CONFIRMEE:'badge-confirme',EN_ATTENTE:'badge-attente',ANNULEE:'badge-bloque',EXPIREE:'badge-bloque'} as any)[s] ?? ''; }
  getLabelStatut(s: string) { return ({CONFIRMEE:'Confirmée',EN_ATTENTE:'En attente',ANNULEE:'Annulée',EXPIREE:'Expirée'} as any)[s] ?? s; }
  getLabelPaiement(s: string) { return ({EN_ATTENTE:'Non payé',VALIDE:'Payé ✓',ECHOUE:'Échoué',REMBOURSE:'Remboursé'} as any)[s] ?? s; }
  getLabelMode(m: string) { return ({SUR_PLACE:'Sur place',WAVE:'Wave',ORANGE_MONEY:'Orange Money',FREE_MONEY:'Free Money'} as any)[m] ?? m; }
}
