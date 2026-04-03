import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CalendrierService, CalendrierCellule, CalendrierSemaine } from '../../core/services/calendrier.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-up">

      <!-- Hero header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6"
           style="border-bottom:1px solid var(--border);">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--accent);">
            Terrain Principal · Dakar
          </p>
          <h1 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">
            Réservations
          </h1>
          <p class="text-sm mt-1" style="color:var(--text-secondary);">
            Cliquez sur une case verte pour réserver · 40 000 FCFA / heure
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="changerSemaine(-1)" class="btn-secondary w-10 h-10 p-0 flex items-center justify-center">←</button>
          <span class="text-sm font-semibold px-3 py-2 rounded-lg whitespace-nowrap"
                style="background:var(--bg-surface);border:1px solid var(--border);color:var(--text-primary);">
            {{ labelSemaine() }}
          </span>
          <button type="button" (click)="changerSemaine(1)"  class="btn-secondary w-10 h-10 p-0 flex items-center justify-center">→</button>
        </div>
      </div>

      <!-- Légende -->
      <div class="flex flex-wrap gap-4 text-xs">
        <span class="flex items-center gap-2" style="color:var(--text-secondary);">
          <span class="w-3 h-3 rounded" style="background:rgba(0,255,135,0.2);border:1px solid rgba(0,255,135,0.4);"></span>Disponible
        </span>
        <span class="flex items-center gap-2" style="color:var(--text-secondary);">
          <span class="w-3 h-3 rounded" style="background:rgba(255,209,102,0.2);border:1px solid rgba(255,209,102,0.4);"></span>Réservé
        </span>
        <span class="flex items-center gap-2" style="color:var(--text-secondary);">
          <span class="w-3 h-3 rounded" style="background:rgba(255,77,109,0.2);border:1px solid rgba(255,77,109,0.3);"></span>Bloqué
        </span>
        <span class="flex items-center gap-2" style="color:var(--text-secondary);">
          <span class="w-3 h-3 rounded" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);"></span>Passé
        </span>
      </div>

      <!-- Bandeau connexion -->
      @if (!auth.isLoggedIn()) {
        <div class="p-4 rounded-xl flex items-center justify-between gap-4"
             style="background:rgba(0,255,135,0.06);border:1px solid var(--border-accent);">
          <div>
            <p class="font-semibold text-sm" style="color:var(--accent);">Connexion requise</p>
            <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Connectez-vous pour réserver un créneau.</p>
          </div>
          <a routerLink="/connexion" class="btn-primary text-sm whitespace-nowrap">Se connecter</a>
        </div>
      }

      @if (erreur()) {
        <div class="p-4 rounded-xl flex items-center justify-between gap-4"
             style="background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.3);">
          <span class="text-sm" style="color:var(--red);">{{ erreur() }}</span>
          <button type="button" (click)="charger()" class="text-xs underline" style="color:var(--red);">Réessayer</button>
        </div>
      }

      <!-- Grille -->
      @if (loading()) {
        <div class="flex items-center justify-center py-24">
          <div class="text-center">
            <div class="text-5xl mb-4">⚽</div>
            <p style="color:var(--text-secondary);">Chargement du calendrier...</p>
          </div>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden animate-fade-up-2">
          <div class="overflow-x-auto">
            <table style="width:100%;min-width:640px;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="width:52px;padding:0.75rem 0.5rem;background:var(--bg-surface);border-bottom:1px solid var(--border);border-right:1px solid var(--border);font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">h</th>
                  @for (jour of jours(); track jour.date) {
                    <th style="padding:0.75rem 0.5rem;border-bottom:1px solid var(--border);border-right:1px solid var(--border);text-align:center;"
                        [style.background]="jour.estAujourdhui ? 'rgba(0,255,135,0.04)' : 'var(--bg-surface)'">
                      <p style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2px;"
                         [style.color]="jour.estAujourdhui ? 'var(--accent)' : 'var(--text-muted)'">
                        {{ jour.nomJour }}
                      </p>
                      <p class="font-display font-bold text-xl"
                         [style.color]="jour.estAujourdhui ? 'var(--accent)' : 'var(--text-primary)'">
                        {{ jour.numJour }}
                      </p>
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (heure of heures; track heure) {
                  <tr>
                    <td style="padding:3px 6px;border-right:1px solid var(--border);border-bottom:1px solid rgba(255,255,255,0.03);background:var(--bg-surface);text-align:center;font-size:0.72rem;font-weight:600;letter-spacing:0.04em;"
                        [style.color]="'var(--text-muted)'">
                      {{ heure }}h
                    </td>
                    @for (jour of jours(); track jour.date) {
                      <td style="padding:3px;border-right:1px solid rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.03);"
                          [style.background]="jour.estAujourdhui ? 'rgba(0,255,135,0.02)' : 'transparent'">

                        @if (!getCellule(jour.date, heure) || getCellule(jour.date, heure)!.statut === null) {
                          <div class="cal-cell cal-passe rounded-md"></div>

                        } @else if (getCellule(jour.date, heure)!.statut === 'DISPONIBLE') {
                          <div class="cal-cell cal-dispo rounded-md flex flex-col items-center justify-center gap-0.5 relative overflow-hidden"
                               (click)="ouvrirModal(getCellule(jour.date, heure)!, jour.label)">
                            <span style="font-size:0.65rem;font-weight:700;color:var(--accent);letter-spacing:0.03em;">
                              {{ getCellule(jour.date, heure)!.prix | number:'1.0-0' }}
                            </span>
                            <span style="font-size:0.55rem;color:var(--accent);opacity:0.7;">FCFA</span>
                          </div>

                        } @else if (getCellule(jour.date, heure)!.statut === 'RESERVE') {
                          @if (estPasse(getCellule(jour.date, heure)!.debut)) {
                            <!-- Passé confirmé — historique -->
                            <div class="cal-cell rounded-md flex flex-col items-center justify-center"
                                 style="background:rgba(255,200,0,0.06);border:1px solid rgba(255,200,0,0.15);">
                              <span style="font-size:0.58rem;font-weight:600;color:rgba(255,200,0,0.45);">✓ Passé</span>
                              @if (auth.isCaissier() && getCellule(jour.date, heure)!.clientNom) {
                                <span style="font-size:0.52rem;color:rgba(255,200,0,0.35);max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                  {{ getCellule(jour.date, heure)!.clientNom }}
                                </span>
                              }
                            </div>
                          } @else {
                            <!-- Futur réservé — actif -->
                            <div class="cal-cell cal-reserve rounded-md flex flex-col items-center justify-center">
                              <span style="font-size:0.62rem;font-weight:600;color:var(--yellow);">Réservé</span>
                              @if (auth.isCaissier() && getCellule(jour.date, heure)!.clientNom) {
                                <span style="font-size:0.55rem;color:var(--yellow);opacity:0.7;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                  {{ getCellule(jour.date, heure)!.clientNom }}
                                </span>
                              }
                            </div>
                          }

                        } @else {
                          <div class="cal-cell cal-bloque rounded-md flex items-center justify-center">
                            <span style="font-size:0.62rem;color:var(--red);opacity:0.7;">Bloqué</span>
                          </div>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- ===== MODAL ===== -->
    @if (celluleSelectionnee()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
           (click)="fermerModal()">
        <div class="w-full max-w-sm rounded-2xl p-6 animate-fade-up"
             style="background:var(--bg-card);border:1px solid var(--border-accent);box-shadow:0 0 40px rgba(0,255,135,0.1);"
             (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between mb-5">
            <h2 class="font-display font-bold text-2xl uppercase tracking-wide">Confirmation</h2>
            <button type="button" (click)="fermerModal()"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all"
                    style="background:var(--bg-surface);color:var(--text-secondary);"
                    onmouseenter="this.style.color='var(--red)'" onmouseleave="this.style.color='var(--text-secondary)'">&times;</button>
          </div>

          <!-- Récap -->
          <div class="rounded-xl p-4 mb-4 space-y-2.5"
               style="background:var(--bg-surface);border:1px solid var(--border);">
            <div class="flex justify-between text-sm">
              <span style="color:var(--text-secondary);">Date</span>
              <span class="font-semibold" style="color:var(--text-primary);">{{ jourLabel() }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span style="color:var(--text-secondary);">Horaire</span>
              <span class="font-semibold" style="color:var(--text-primary);">
                {{ formatHeure(celluleSelectionnee()!.debut) }} – {{ formatHeure(celluleSelectionnee()!.fin) }}
              </span>
            </div>
            <div class="flex justify-between pt-2" style="border-top:1px solid var(--border);">
              <span class="font-semibold text-sm" style="color:var(--text-secondary);">Total</span>
              <span class="font-display font-bold text-xl" style="color:var(--accent);">
                {{ celluleSelectionnee()!.prix | number:'1.0-0' }} FCFA
              </span>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                   style="color:var(--text-secondary);">Notes (optionnel)</label>
            <textarea [(ngModel)]="notes" rows="2" placeholder="Ex: 5 vs 5, tournoi..."
                      class="input-field resize-none text-sm"></textarea>
          </div>

          <div class="p-3 rounded-lg text-xs mb-4 flex items-center gap-2"
               style="background:rgba(255,209,102,0.07);border:1px solid rgba(255,209,102,0.2);color:var(--yellow);">
            💳 Paiement sur place à votre arrivée au terrain
          </div>

          @if (erreurResa()) {
            <div class="mb-3 p-3 rounded-lg text-sm flex items-center gap-2"
                 style="background:rgba(255,77,109,0.1);border:1px solid rgba(255,77,109,0.3);color:var(--red);">
              ⚠ {{ erreurResa() }}
            </div>
          }
          @if (successResa()) {
            <div class="mb-3 p-3 rounded-lg text-sm"
                 style="background:rgba(0,255,135,0.1);border:1px solid var(--border-accent);color:var(--accent);">
              ✅ {{ successResa() }}
            </div>
          }

          <div class="flex gap-3">
            <button type="button" (click)="fermerModal()" class="btn-secondary flex-1 text-sm">
              {{ successResa() ? 'Fermer' : 'Annuler' }}
            </button>
            @if (!successResa()) {
              <button type="button" (click)="confirmer()" [disabled]="loadingResa()"
                      class="btn-primary flex-1 text-sm">
                {{ loadingResa() ? 'En cours...' : 'Confirmer' }}
              </button>
            } @else {
              <a routerLink="/mes-reservations" class="btn-primary flex-1 text-center py-2 text-sm">
                Voir mes résa.
              </a>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class CalendarComponent implements OnInit {
  heures = Array.from({ length: 24 }, (_, i) => 23 - i);
  grille          = signal<CalendrierSemaine>({});
  loading         = signal(true);
  erreur          = signal('');
  lundi!: Date;
  celluleSelectionnee = signal<CalendrierCellule | null>(null);
  jourLabel       = signal('');
  notes = ''; loadingResa = signal(false); erreurResa = signal(''); successResa = signal('');

  constructor(private calendrierSvc: CalendrierService, public auth: AuthService, private router: Router) {
    this.lundi = this.getLundiSemaine(new Date());
  }
  ngOnInit() { this.charger(); }

  charger() {
    this.loading.set(true); this.erreur.set('');
    this.calendrierSvc.getSemaine(1, this.lundi).subscribe({
      next:  g  => { this.grille.set(g); this.loading.set(false); },
      error: () => { this.erreur.set('Impossible de charger le calendrier.'); this.loading.set(false); }
    });
  }

  changerSemaine(delta: number) {
    const d = new Date(this.lundi); d.setDate(d.getDate() + delta * 7);
    if (delta < 0 && d < this.getLundiSemaine(new Date())) return;
    this.lundi = d; this.charger();
  }

  // Formate une date en YYYY-MM-DD de façon déterministe (sans dépendre de la locale)
  private dateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const j = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${j}`;
  }

  jours() {
    const today = this.dateKey(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.lundi); d.setDate(d.getDate() + i);
      return {
        date: this.dateKey(d),
        nomJour: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        numJour: String(d.getDate()),
        label: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        estAujourdhui: this.dateKey(d) === today
      };
    });
  }

  estPasse(debut: string): boolean {
    return new Date(debut) < new Date();
  }

  getCellule(dateStr: string, heure: number): CalendrierCellule | undefined {
    const cellules = this.grille()[dateStr];
    if (!cellules) return undefined;
    return cellules.find(c => {
      try {
        // Gérer les deux formats : string ISO et tableau Java [year,month,day,h,m]
        const d = Array.isArray(c.debut)
          ? new Date((c.debut as any)[0], (c.debut as any)[1] - 1, (c.debut as any)[2], (c.debut as any)[3] ?? 0)
          : new Date(c.debut);
        return d.getHours() === heure;
      } catch { return false; }
    });
  }

  ouvrirModal(cellule: CalendrierCellule, jourLabel: string) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/connexion']); return; }
    this.celluleSelectionnee.set(cellule); this.jourLabel.set(jourLabel);
    this.notes = ''; this.erreurResa.set(''); this.successResa.set('');
  }

  fermerModal() { this.celluleSelectionnee.set(null); }

  confirmer() {
    const c = this.celluleSelectionnee(); if (!c) return;
    this.loadingResa.set(true); this.erreurResa.set('');
    this.calendrierSvc.reserver(1, new Date(c.debut), this.notes).subscribe({
      next: resa => { this.successResa.set('Réservation confirmée ! Code : ' + resa.codeConfirmation); this.loadingResa.set(false); this.charger(); },
      error: err => { this.erreurResa.set(err.error?.message || 'Erreur lors de la réservation'); this.loadingResa.set(false); }
    });
  }

  labelSemaine(): string {
    const fin = new Date(this.lundi); fin.setDate(fin.getDate() + 6);
    return this.lundi.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
           ' – ' + fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  formatHeure(d: string) { return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
  private getLundiSemaine(d: Date): Date {
    const r = new Date(d); r.setHours(0,0,0,0);
    const day = r.getDay(); r.setDate(r.getDate() - (day === 0 ? 6 : day - 1)); return r;
  }
}
