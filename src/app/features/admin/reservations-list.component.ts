import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Reservation } from '../../core/models';
import { AdminNavComponent } from '../../shared/components/admin-nav/admin-nav.component';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminNavComponent],
  template: `
    <div class="space-y-6 animate-fade-up">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6"
           style="border-bottom:1px solid var(--border);">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--accent);">Administration</p>
          <h1 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">Réservations</h1>
          <p class="text-sm mt-1" style="color:var(--text-secondary);">
            <span style="color:var(--accent);font-weight:700;">{{ reservationsFiltrees().length }}</span>
            réservation(s) affichée(s)
          </p>
        </div>
        <button (click)="charger()" class="btn-secondary text-sm self-start sm:self-end">↻ Actualiser</button>
      </div>

      <app-admin-nav />

      <!-- Filtres -->
      <div class="card animate-fade-up-2">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style="color:var(--text-muted);">🔍</span>
            <input type="text" [ngModel]="recherche()" (ngModelChange)="recherche.set($event)"
                   placeholder="Nom, téléphone, code confirmation..."
                   class="input-field pl-9" />
          </div>
          <select [ngModel]="filtreStatut()" (ngModelChange)="filtreStatut.set($event)" class="input-field sm:w-48"
                  style="background:var(--bg-surface);color:var(--text-primary);">
            <option value="" style="background:var(--bg-surface);">Tous les statuts</option>
            <option value="EN_ATTENTE" style="background:var(--bg-surface);">En attente</option>
            <option value="CONFIRMEE"  style="background:var(--bg-surface);">Confirmée</option>
            <option value="ANNULEE"    style="background:var(--bg-surface);">Annulée</option>
            <option value="EXPIREE"    style="background:var(--bg-surface);">Expirée</option>
          </select>
          @if (recherche() || filtreStatut()) {
            <button (click)="resetFiltres()"
                    class="btn-secondary text-sm px-3 py-2 shrink-0"
                    title="Réinitialiser les filtres">✕ Reset</button>
          }
        </div>
        @if (recherche() || filtreStatut()) {
          <p class="text-xs mt-2" style="color:var(--text-muted);">
            {{ reservationsFiltrees().length }} résultat(s) sur {{ reservations().length }}
          </p>
        }
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-32">
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full mx-auto"
                 style="border:2px solid var(--border);border-top-color:var(--accent);animation:spin 1s linear infinite;"></div>
            <p class="text-sm" style="color:var(--text-secondary);">Chargement...</p>
          </div>
        </div>
      } @else if (reservationsFiltrees().length === 0) {
        <div class="card text-center py-16">
          <p class="text-4xl mb-3">📭</p>
          <p style="color:var(--text-secondary);">Aucune réservation trouvée</p>
        </div>
      } @else {

        <!-- Table -->
        <div class="card p-0 overflow-hidden animate-fade-up-3">
          <div class="overflow-x-auto">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:var(--bg-surface);border-bottom:1px solid var(--border);">
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style="color:var(--text-secondary);">Code</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style="color:var(--text-secondary);">Client</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest hidden sm:table-cell" style="color:var(--text-secondary);">Créneau</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style="color:var(--text-secondary);">Montant</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style="color:var(--text-secondary);">Statut</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style="color:var(--text-secondary);">Paiement</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style="color:var(--text-secondary);">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (resa of reservationsFiltrees(); track resa.id) {
                  <tr style="border-bottom:1px solid var(--border);"
                      onmouseenter="this.style.background='var(--bg-hover)'"
                      onmouseleave="this.style.background='transparent'">

                    <!-- Code -->
                    <td class="px-4 py-3">
                      <code class="text-xs px-2 py-1 rounded font-mono"
                            style="background:var(--accent-dark);color:var(--accent);border:1px solid var(--border-accent);">
                        {{ resa.codeConfirmation }}
                      </code>
                    </td>

                    <!-- Client -->
                    <td class="px-4 py-3">
                      <p class="text-sm font-semibold" style="color:var(--text-primary);">
                        {{ resa.utilisateur.prenom }} {{ resa.utilisateur.nom }}
                      </p>
                      <p class="text-xs mt-0.5" style="color:var(--text-muted);">
                        {{ resa.utilisateur.telephone }}
                      </p>
                    </td>

                    <!-- Créneau -->
                    <td class="px-4 py-3 hidden sm:table-cell">
                      <p class="text-sm font-medium" style="color:var(--text-primary);">
                        {{ formatDate(resa.creneau.debut) }}
                      </p>
                      <p class="text-xs mt-0.5" style="color:var(--text-secondary);">
                        {{ formatHeure(resa.creneau.debut) }} – {{ formatHeure(resa.creneau.fin) }}
                      </p>
                    </td>

                    <!-- Montant -->
                    <td class="px-4 py-3">
                      <span class="font-display font-bold text-base" style="color:var(--accent);">
                        {{ resa.montantTotal | number:'1.0-0' }}<span class="text-xs ml-1" style="color:var(--text-muted);">F</span>
                      </span>
                    </td>

                    <!-- Statut -->
                    <td class="px-4 py-3">
                      <span [class]="getStatutClass(resa.statut)">{{ getLabelStatut(resa.statut) }}</span>
                    </td>

                    <!-- Paiement -->
                    <td class="px-4 py-3">
                      @if (resa.statut === 'CONFIRMEE' && resa.paiement?.statut === 'VALIDE') {
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold" style="color:var(--accent);">
                              ✓ {{ getResume(resa).totalPaye | number:'1.0-0' }} F
                            </span>
                            @if (getResume(resa).resteAPayer > 0) {
                              <span class="text-xs px-1.5 py-0.5 rounded" style="background:rgba(255,200,0,0.15);color:rgba(255,200,0,0.9);">
                                Acompte
                              </span>
                            }
                          </div>
                          @if (getResume(resa).resteAPayer > 0) {
                            <p class="text-xs" style="color:rgba(255,200,0,0.8);">
                              Reste: {{ getResume(resa).resteAPayer | number:'1.0-0' }} F
                            </p>
                            <!-- Bouton solde -->
                            <div class="space-y-1 mt-1">
                              <select #modeSelectSolde class="input-field text-xs py-1 px-2"
                                      style="background:var(--bg-surface);color:var(--text-primary);font-size:0.72rem;">
                                <option value="SUR_PLACE">Sur place</option>
                                <option value="WAVE">Wave</option>
                                <option value="ORANGE_MONEY">Orange Money</option>
                                <option value="FREE_MONEY">Free Money</option>
                              </select>
                              <input type="number" #montantSoldeInput
                                     [placeholder]="'Solde: ' + (getResume(resa).resteAPayer | number:'1.0-0') + ' F'"
                                     min="0" [max]="getResume(resa).resteAPayer"
                                     class="input-field text-xs py-1 px-2 w-full"
                                     style="font-size:0.72rem;" />
                              <button type="button"
                                      (click)="ajouterSolde(resa, modeSelectSolde.value, montantSoldeInput.value)"
                                      [disabled]="soldeEnCours() === resa.id"
                                      class="w-full text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200"
                                      style="background:rgba(255,200,0,0.1);color:rgba(255,200,0,0.9);border:1px solid rgba(255,200,0,0.3);">
                                {{ soldeEnCours() === resa.id ? '...' : '+ Solde' }}
                              </button>
                            </div>
                          } @else {
                            <p class="text-xs" style="color:var(--accent);">✓ Soldée</p>
                          }
                          @if (resa.paiement?.mode) {
                            <p class="text-xs" style="color:var(--text-muted);">{{ getLabelMode(resa.paiement!.mode) }}</p>
                          }
                        </div>
                      } @else if (resa.statut === 'EN_ATTENTE' || resa.statut === 'CONFIRMEE') {
                        <div class="space-y-1.5" style="min-width:160px;">
                          <select #modeSelect class="input-field text-xs py-1 px-2"
                                  style="background:var(--bg-surface);color:var(--text-primary);font-size:0.72rem;">
                            <option value="SUR_PLACE">Sur place</option>
                            <option value="WAVE">Wave</option>
                            <option value="ORANGE_MONEY">Orange Money</option>
                            <option value="FREE_MONEY">Free Money</option>
                          </select>
                          <div class="relative">
                            <input type="number" #montantInput
                                   [placeholder]="'Total: ' + (resa.montantTotal | number:'1.0-0') + ' F'"
                                   min="0" [max]="resa.montantTotal"
                                   class="input-field text-xs py-1 px-2 w-full"
                                   style="font-size:0.72rem;" />
                            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                                  style="color:var(--text-muted);">F</span>
                          </div>
                          <p class="text-xs" style="color:var(--text-muted);">
                            Laisser vide = montant total
                          </p>
                          <button type="button"
                                  (click)="validerPaiement(resa, modeSelect.value, montantInput.value)"
                                  [disabled]="validationEnCours() === resa.id"
                                  class="w-full text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-40"
                                  style="background:rgba(0,255,135,0.1);color:var(--accent);border:1px solid var(--border-accent);"
                                  onmouseenter="if(!this.disabled)this.style.background='rgba(0,255,135,0.2)'"
                                  onmouseleave="this.style.background='rgba(0,255,135,0.1)'">
                            {{ validationEnCours() === resa.id ? '...' : '✓ Valider' }}
                          </button>
                        </div>
                      } @else {
                        <span class="text-xs" style="color:var(--text-muted);">—</span>
                      }
                    </td>

                    <!-- Action admin : annulation -->
                    <td class="px-4 py-3">
                      @if (resa.statut === 'EN_ATTENTE' || resa.statut === 'CONFIRMEE') {
                        <button type="button"
                                (click)="annulerReservation(resa)"
                                [disabled]="annulationEnCours() === resa.id"
                                class="text-xs px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 disabled:opacity-40"
                                style="color:var(--red);border:1px solid rgba(255,77,109,0.3);"
                                onmouseenter="if(!this.disabled)this.style.background='rgba(255,77,109,0.1)'"
                                onmouseleave="this.style.background='transparent'">
                          {{ annulationEnCours() === resa.id ? '...' : '✕ Annuler' }}
                        </button>
                      } @else {
                        <span class="text-xs" style="color:var(--text-muted);">—</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `
})
export class ReservationsListComponent implements OnInit {
  reservations      = signal<Reservation[]>([]);
  loading           = signal(true);
  recherche         = signal('');
  filtreStatut      = signal('');
  validationEnCours  = signal<number | null>(null);
  annulationEnCours  = signal<number | null>(null);
  soldeEnCours       = signal<number | null>(null);
  resumesPaiements   = signal<Map<number, { totalPaye: number; resteAPayer: number }>>(new Map());

  reservationsFiltrees = computed(() => {
    const statut = this.filtreStatut();
    const q      = this.recherche().toLowerCase().trim();
    return this.reservations().filter(r => {
      const matchStatut    = !statut || r.statut === statut;
      const nom            = ((r.utilisateur?.prenom ?? '') + ' ' + (r.utilisateur?.nom ?? '')).toLowerCase();
      const tel            = (r.utilisateur?.telephone ?? '');
      const code           = (r.codeConfirmation ?? '').toLowerCase();
      const matchRecherche = !q || nom.includes(q) || tel.includes(q) || code.includes(q);
      return matchStatut && matchRecherche;
    });
  });

  constructor(private adminSvc: AdminService) {}

  getResume(resa: any): { totalPaye: number; resteAPayer: number } {
    // Utiliser les données chargées depuis le backend si disponibles
    const cached = this.resumesPaiements().get(resa.id);
    if (cached) return cached;
    // Fallback sur le premier paiement chargé
    const montantTotal = Number(resa.montantTotal);
    const totalPaye    = Number(resa.paiement?.montant ?? 0);
    return { totalPaye, resteAPayer: Math.max(0, montantTotal - totalPaye) };
  }

  ajouterSolde(resa: any, mode: string, montantStr: string) {
    const montant = montantStr && montantStr.trim() !== '' ? parseFloat(montantStr) : undefined;
    this.soldeEnCours.set(resa.id);
    this.adminSvc.ajouterSolde(resa.id, mode, montant).subscribe({
      next:  () => { this.soldeEnCours.set(null); this.charger(); },
      error: (err: any) => {
        const msg = err.error?.data?.message || err.error?.message || 'Erreur solde';
        alert(msg);
        this.soldeEnCours.set(null);
      },
    });
  }
  ngOnInit() { this.charger(); }

  resetFiltres() {
    this.recherche.set('');
    this.filtreStatut.set('');
  }

  charger() {
    this.loading.set(true);
    this.adminSvc.getReservations().subscribe({
      next: (data: any[]) => {
        this.reservations.set(data);
        this.loading.set(false);
        this.chargerResumes(data);
      },
      error: () => this.loading.set(false)
    });
  }

  chargerResumes(resas: any[]) {
    const confirmees = resas.filter(r => r.statut === 'CONFIRMEE');
    confirmees.forEach(resa => {
      this.adminSvc.getPaiementsReservation(resa.id).subscribe({
        next: (res: any) => {
          const map = new Map(this.resumesPaiements());
          map.set(resa.id, {
            totalPaye:   res.totalPaye,
            resteAPayer: res.resteAPayer,
          });
          this.resumesPaiements.set(map);
        },
        error: () => {},
      });
    });
  }

  annulerReservation(resa: Reservation) {
    if (!confirm('Annuler cette réservation ? Le créneau sera libéré.')) return;
    this.annulationEnCours.set(resa.id);
    this.adminSvc.annulerReservation(resa.id).subscribe({
      next:  () => { this.annulationEnCours.set(null); this.charger(); },
      error: (err: any) => { alert(err.error?.message || 'Erreur annulation'); this.annulationEnCours.set(null); }
    });
  }

  validerPaiement(resa: Reservation, mode: string, montantStr?: string) {
    this.validationEnCours.set(resa.id);
    const montant = montantStr && montantStr.trim() !== '' ? parseFloat(montantStr) : undefined;
    this.adminSvc.validerPaiementParReservation(resa.id, mode, montant).subscribe({
      next:  () => { this.validationEnCours.set(null); this.charger(); },
      error: (err: any) => { alert(err.error?.message || 'Erreur validation'); this.validationEnCours.set(null); }
    });
  }

  formatDate(d: string)  { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
  formatHeure(d: string) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
  getStatutClass(s: string) { return ({CONFIRMEE:'badge-confirme',EN_ATTENTE:'badge-attente',ANNULEE:'badge-bloque',EXPIREE:'badge-bloque'} as any)[s] ?? ''; }
  getLabelStatut(s: string) { return ({CONFIRMEE:'Confirmée',EN_ATTENTE:'En attente',ANNULEE:'Annulée',EXPIREE:'Expirée'} as any)[s] ?? s; }
  getLabelMode(m: string)   { return ({SUR_PLACE:'Sur place',WAVE:'Wave',ORANGE_MONEY:'Orange Money',FREE_MONEY:'Free Money'} as any)[m] ?? m; }
}
