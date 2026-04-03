import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Dashboard, Reservation } from '../../core/models';
import { AdminNavComponent } from '../../shared/components/admin-nav/admin-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavComponent],
  template: `
    <div class="space-y-6 animate-fade-up">

      <!-- Page header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6"
           style="border-bottom:1px solid var(--border);">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--accent);">
            Administration
          </p>
          <h1 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">
            Dashboard
          </h1>
          <p class="text-sm mt-1 capitalize" style="color:var(--text-secondary);">{{ aujourdhui }}</p>
        </div>
        <button (click)="charger()" class="btn-secondary text-sm self-start sm:self-end">
          ↻ Actualiser
        </button>
      </div>

      <!-- Admin nav tabs -->
      <app-admin-nav />

      @if (loading()) {
        <div class="flex items-center justify-center py-32">
          <div class="text-center space-y-3">
            <div class="w-12 h-12 rounded-full mx-auto"
                 style="border:2px solid var(--border);border-top-color:var(--accent);animation:spin 1s linear infinite;"></div>
            <p class="text-sm" style="color:var(--text-secondary);">Chargement...</p>
          </div>
        </div>
      } @else if (dashboard()) {

        <!-- KPIs row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up-2">

          <div class="card card-hover relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6"
                 style="background:rgba(0,255,135,0.06);"></div>
            <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--text-secondary);">
              Résa. aujourd'hui
            </p>
            <p class="font-display font-bold text-5xl" style="color:var(--accent);">
              {{ dashboard()!.totalReservationsAujourdhui }}
            </p>
            <p class="text-xs mt-2 flex items-center gap-1" style="color:var(--text-muted);">
              <span style="color:var(--accent);">⚽</span> créneaux joués
            </p>
          </div>

          <div class="card card-hover relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6"
                 style="background:rgba(72,149,239,0.06);"></div>
            <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--text-secondary);">
              Résa. ce mois
            </p>
            <p class="font-display font-bold text-5xl" style="color:var(--blue);">
              {{ dashboard()!.totalReservationsMois }}
            </p>
            <p class="text-xs mt-2" style="color:var(--text-muted);">
              {{ moisCourant }}
            </p>
          </div>

          <div class="card card-hover relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6"
                 style="background:rgba(0,255,135,0.06);"></div>
            <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--text-secondary);">
              Revenu aujourd'hui
            </p>
            <p class="font-display font-bold text-3xl leading-tight" style="color:var(--accent);">
              {{ formatFcfa(dashboard()!.revenuAujourdhui) }}
            </p>
            <p class="text-xs mt-2" style="color:var(--text-muted);">FCFA encaissés</p>
          </div>

          <div class="card card-hover relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6"
                 style="background:rgba(0,255,135,0.06);"></div>
            <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--text-secondary);">
              Revenu ce mois
            </p>
            <p class="font-display font-bold text-3xl leading-tight" style="color:var(--accent);">
              {{ formatFcfa(dashboard()!.revenuMois) }}
            </p>
            <p class="text-xs mt-2" style="color:var(--text-muted);">{{ moisCourant }}</p>
          </div>
        </div>

        <!-- Taux d'occupation + dispo -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up-3">

          <!-- Barre de progression -->
          <div class="card sm:col-span-2">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="font-display font-bold text-xl uppercase tracking-wide">
                  Taux d'occupation
                </h2>
                <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Aujourd'hui</p>
              </div>
              <div class="text-right">
                <span class="font-display font-bold text-4xl" style="color:var(--accent);">
                  {{ dashboard()!.tauxOccupation }}
                </span>
                <span class="text-xl font-display" style="color:var(--accent);">%</span>
              </div>
            </div>
            <div class="w-full rounded-full h-3 overflow-hidden"
                 style="background:var(--bg-surface);border:1px solid var(--border);">
              <div class="h-full rounded-full transition-all duration-1000"
                   style="background:linear-gradient(90deg, var(--accent-dim), var(--accent));box-shadow:0 0 10px var(--accent-glow);"
                   [style.width]="dashboard()!.tauxOccupation + '%'">
              </div>
            </div>
            <div class="flex justify-between mt-3 text-xs" style="color:var(--text-muted);">
              <span>0%</span>
              <span style="color:var(--text-secondary);">
                {{ dashboard()!.creneauxDisponiblesAujourdhui }} créneaux disponibles
              </span>
              <span>100%</span>
            </div>
          </div>

          <!-- Statut terrain -->
          <div class="card flex flex-col items-center justify-center text-center gap-3">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                 style="background:var(--accent-dark);border:1px solid var(--border-accent);">⚽</div>
            <div>
              <p class="font-display font-bold text-lg uppercase tracking-wide">Terrain actif</p>
              <p class="text-xs mt-1" style="color:var(--text-secondary);">40 000 FCFA / heure</p>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style="background:rgba(0,255,135,0.1);border:1px solid var(--border-accent);">
              <span class="w-2 h-2 rounded-full glow-pulse" style="background:var(--accent);"></span>
              <span class="text-xs font-semibold uppercase tracking-wider" style="color:var(--accent);">
                En ligne
              </span>
            </div>
          </div>
        </div>

        <!-- Réservations du jour -->
        <div class="card animate-fade-up-3">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="font-display font-bold text-xl uppercase tracking-wide">
                Réservations du jour
              </h2>
              <p class="text-xs mt-0.5" style="color:var(--text-secondary);">
                {{ dashboard()!.prochainesReservations.length }} créneau(x) trouvé(s)
              </p>
            </div>
            <a routerLink="/admin/reservations"
               class="text-sm font-medium transition-colors hover:opacity-80"
               style="color:var(--accent);">
              Tout voir →
            </a>
          </div>

          @if (dashboard()!.prochainesReservations.length === 0) {
            <div class="text-center py-12 rounded-xl" style="background:var(--bg-surface);border:1px dashed var(--border);">
              <p class="text-4xl mb-3">📭</p>
              <p style="color:var(--text-secondary);" class="text-sm">Aucune réservation aujourd'hui</p>
            </div>
          } @else {
            <div class="space-y-2">
              @for (resa of dashboard()!.prochainesReservations; track resa.id) {
                <div class="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200"
                     style="background:var(--bg-surface);border:1px solid var(--border);"
                     onmouseenter="this.style.borderColor='rgba(0,255,135,0.2)'"
                     onmouseleave="this.style.borderColor='var(--border)'">

                  <!-- Heure badge -->
                  <div class="flex items-center gap-4">
                    <div class="text-center min-w-14">
                      <p class="font-display font-bold text-lg leading-none" style="color:var(--accent);">
                        {{ formatHeure(resa.creneau.debut) }}
                      </p>
                      <p class="text-xs mt-0.5" style="color:var(--text-muted);">
                        → {{ formatHeure(resa.creneau.fin) }}
                      </p>
                    </div>
                    <div class="w-px h-8" style="background:var(--border);"></div>
                    <div>
                      <p class="font-semibold text-sm">
                        {{ resa.utilisateur.prenom }} {{ resa.utilisateur.nom }}
                      </p>
                      <div class="flex items-center gap-2 mt-0.5">
                        <code class="text-xs px-1.5 py-0.5 rounded"
                              style="background:var(--accent-dark);color:var(--accent);border:1px solid var(--border-accent);">
                          {{ resa.codeConfirmation }}
                        </code>
                        <span class="text-xs" style="color:var(--text-muted);">
                          {{ resa.utilisateur.telephone }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Montant + statut -->
                  <div class="text-right flex flex-col items-end gap-1">
                    <span class="font-display font-bold text-lg" style="color:var(--accent);">
                      {{ resa.montantTotal | number:'1.0-0' }}<span class="text-xs ml-1" style="color:var(--text-muted);">F</span>
                    </span>
                    <span [class]="getStatutClass(resa.statut)">{{ getLabelStatut(resa.statut) }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Accès rapides -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up-3">
          <a routerLink="/admin/reservations"
             class="card card-hover flex items-center gap-4 cursor-pointer group no-underline">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200"
                 style="background:rgba(72,149,239,0.1);border:1px solid rgba(72,149,239,0.2);">📋</div>
            <div>
              <p class="font-display font-bold text-lg uppercase tracking-wide">Gérer les réservations</p>
              <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Voir, filtrer, valider les paiements</p>
            </div>
            <span class="ml-auto text-xl transition-transform duration-200 group-hover:translate-x-1"
                  style="color:var(--text-muted);">→</span>
          </a>
          <a routerLink="/admin/creneaux"
             class="card card-hover flex items-center gap-4 cursor-pointer group no-underline">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200"
                 style="background:rgba(0,255,135,0.08);border:1px solid var(--border-accent);">🗓</div>
            <div>
              <p class="font-display font-bold text-lg uppercase tracking-wide">Gérer les créneaux</p>
              <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Bloquer, libérer, créer des slots</p>
            </div>
            <span class="ml-auto text-xl transition-transform duration-200 group-hover:translate-x-1"
                  style="color:var(--text-muted);">→</span>
          </a>
        </div>

      }
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `
})
export class DashboardComponent implements OnInit {
  dashboard = signal<Dashboard | null>(null);
  loading   = signal(true);
  aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  moisCourant = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  constructor(private adminSvc: AdminService) {}
  ngOnInit() { this.charger(); }

  charger() {
    this.loading.set(true);
    this.adminSvc.getDashboard().subscribe({
      next:  d => { this.dashboard.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  formatFcfa(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n || 0) + ' F';
  }
  formatHeure(d: string): string {
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  getStatutClass(s: string): string {
    return ({CONFIRMEE:'badge-confirme',EN_ATTENTE:'badge-attente',ANNULEE:'badge-bloque'} as any)[s] ?? '';
  }
  getLabelStatut(s: string): string {
    return ({CONFIRMEE:'Confirmée',EN_ATTENTE:'En attente',ANNULEE:'Annulée'} as any)[s] ?? s;
  }
}
