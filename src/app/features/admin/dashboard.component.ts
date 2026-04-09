import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminNavComponent } from '../../shared/components/admin-nav/admin-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavComponent],
  template: `
    <div class="space-y-6 animate-fade-up">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6"
           style="border-bottom:1px solid var(--border);">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--accent);">Administration</p>
          <h1 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">Dashboard</h1>
          <p class="text-sm mt-1 capitalize" style="color:var(--text-secondary);">{{ aujourdhui }}</p>
        </div>
        <div class="flex gap-2 self-start sm:self-end">

          <button (click)="charger()" class="btn-secondary text-sm">↻ Actualiser</button>
        </div>
      </div>

      <app-admin-nav />

      @if (loading()) {
        <div class="flex items-center justify-center py-32">
          <div class="w-12 h-12 rounded-full"
               style="border:2px solid var(--border);border-top-color:var(--accent);animation:spin 1s linear infinite;"></div>
        </div>
      } @else if (dashboard()) {

        <!-- KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up-2">

          <div class="card card-hover relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8" style="background:rgba(0,255,135,0.05);"></div>
            <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--text-secondary);">Résa. aujourd'hui</p>
            <p class="font-display font-bold text-5xl" style="color:var(--accent);">{{ dashboard()!.totalReservationsAujourdhui }}</p>
            <p class="text-xs mt-2" style="color:var(--text-muted);">⚽ créneaux confirmés</p>
          </div>

          <div class="card card-hover relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8" style="background:rgba(72,149,239,0.05);"></div>
            <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--text-secondary);">Résa. ce mois</p>
            <p class="font-display font-bold text-5xl" style="color:var(--blue);">{{ dashboard()!.totalReservationsMois }}</p>
            <p class="text-xs mt-2" style="color:var(--text-muted);">{{ moisCourant }}</p>
          </div>

          <div class="card card-hover relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8" style="background:rgba(0,255,135,0.05);"></div>
            <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--text-secondary);">Encaissé aujourd'hui</p>
            <p class="font-display font-bold text-3xl leading-tight" style="color:var(--accent);">{{ fmt(dashboard()!.revenuAujourdhui) }}</p>
            <p class="text-xs mt-2" style="color:var(--text-muted);">FCFA</p>
          </div>

          <div class="card card-hover relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8" style="background:rgba(0,255,135,0.05);"></div>
            <p class="text-xs uppercase tracking-widest font-semibold mb-3" style="color:var(--text-secondary);">Encaissé ce mois</p>
            <p class="font-display font-bold text-3xl leading-tight" style="color:var(--accent);">{{ fmt(dashboard()!.revenuMois) }}</p>
            <p class="text-xs mt-2" style="color:var(--text-muted);">{{ moisCourant }}</p>
          </div>
        </div>

        <!-- Graphique 7 jours + Occupation -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up-3">

          <!-- Graphique revenus 7 jours -->
          <div class="card lg:col-span-2">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="font-display font-bold text-xl uppercase tracking-wide">Revenus — 7 derniers jours</h2>
                <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Encaissements par jour</p>
              </div>
              <span class="text-xs px-3 py-1 rounded-full font-semibold"
                    style="background:rgba(0,255,135,0.1);color:var(--accent);border:1px solid var(--border-accent);">
                Total : {{ fmt(totalSemaine()) }} F
              </span>
            </div>

            <!-- Graphique barres SVG -->
            @if (dashboard()!.semaine && dashboard()!.semaine.length > 0) {
              <div class="relative" style="height:180px;">
                <svg width="100%" height="180" style="overflow:visible;">
                  @for (j of dashboard()!.semaine; track j.jour; let i = $index) {
                    <!-- Barre -->
                    <rect
                      [attr.x]="barX(i)"
                      [attr.y]="barY(j.revenu)"
                      [attr.width]="barW()"
                      [attr.height]="barH(j.revenu)"
                      rx="4"
                      [attr.fill]="j.revenu > 0 ? 'url(#barGrad)' : 'rgba(255,255,255,0.04)'"
                    />
                    <!-- Valeur au dessus -->
                    @if (j.revenu > 0) {
                      <text
                        [attr.x]="barX(i) + barW() / 2"
                        [attr.y]="barY(j.revenu) - 6"
                        text-anchor="middle"
                        style="font-size:9px;fill:rgba(0,255,135,0.8);font-family:monospace;">
                        {{ fmtK(j.revenu) }}
                      </text>
                    }
                    <!-- Label jour -->
                    <text
                      [attr.x]="barX(i) + barW() / 2"
                      y="175"
                      text-anchor="middle"
                      style="font-size:10px;fill:rgba(255,255,255,0.4);font-family:Arial;">
                      {{ j.label }}
                    </text>
                    <!-- Nb résa -->
                    @if (j.nbResa > 0) {
                      <text
                        [attr.x]="barX(i) + barW() / 2"
                        [attr.y]="barY(j.revenu) + barH(j.revenu) / 2 + 4"
                        text-anchor="middle"
                        style="font-size:9px;fill:rgba(0,0,0,0.6);font-weight:bold;font-family:Arial;">
                        {{ j.nbResa }}
                      </text>
                    }
                  }
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="rgba(0,255,135,0.8)"/>
                      <stop offset="100%" stop-color="rgba(0,255,135,0.3)"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <!-- Légende jours avec nbResa -->
              <div class="flex justify-between mt-2">
                @for (j of dashboard()!.semaine; track j.jour) {
                  <div class="text-center" style="flex:1;">
                    <div class="text-xs font-bold" [style.color]="j.nbResa > 0 ? 'var(--accent)' : 'var(--text-muted)'">
                      {{ j.nbResa > 0 ? j.nbResa + ' résa' : '—' }}
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="flex items-center justify-center h-40 text-sm" style="color:var(--text-muted);">
                Aucune donnée cette semaine
              </div>
            }
          </div>

          <!-- Taux occupation + stats rapides -->
          <div class="space-y-4">
            <!-- Occupation -->
            <div class="card h-fit">
              <h2 class="font-display font-bold text-lg uppercase tracking-wide mb-4">Occupation</h2>
              <div class="flex items-center justify-center mb-4">
                <!-- Jauge circulaire SVG -->
                <div class="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
                    <circle cx="60" cy="60" r="50" fill="none"
                            stroke="url(#gaugeGrad)"
                            stroke-width="10"
                            stroke-linecap="round"
                            [attr.stroke-dasharray]="314"
                            [attr.stroke-dashoffset]="314 - (314 * dashboard()!.tauxOccupation / 100)"
                            transform="rotate(-90 60 60)"
                            style="transition:stroke-dashoffset 1s ease;"/>
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="rgba(0,255,135,0.6)"/>
                        <stop offset="100%" stop-color="rgba(0,255,135,1)"/>
                      </linearGradient>
                    </defs>
                    <text x="60" y="55" text-anchor="middle"
                          style="font-size:22px;font-weight:bold;fill:rgba(0,255,135,1);font-family:Arial;">
                      {{ dashboard()!.tauxOccupation }}%
                    </text>
                    <text x="60" y="72" text-anchor="middle"
                          style="font-size:9px;fill:rgba(255,255,255,0.4);font-family:Arial;">
                      aujourd'hui
                    </text>
                  </svg>
                </div>
              </div>
              <div class="flex justify-between text-xs px-2">
                <div class="text-center">
                  <p class="font-bold text-lg" style="color:var(--accent);">{{ dashboard()!.totalReservationsAujourdhui }}</p>
                  <p style="color:var(--text-muted);">Réservés</p>
                </div>
                <div class="text-center">
                  <p class="font-bold text-lg" style="color:var(--text-secondary);">{{ dashboard()!.creneauxDisponiblesAujourdhui }}</p>
                  <p style="color:var(--text-muted);">Disponibles</p>
                </div>
              </div>
            </div>

            <!-- Raccourcis -->
            <div class="card">
              <h3 class="text-xs font-semibold uppercase tracking-widest mb-3" style="color:var(--text-secondary);">Accès rapide</h3>
              <div class="space-y-2">
                <a routerLink="/admin/creneaux"
                   class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                   style="background:var(--bg-surface);border:1px solid var(--border);"
                   onmouseenter="this.style.borderColor='var(--border-accent)'"
                   onmouseleave="this.style.borderColor='var(--border)'">
                  <span>🗓</span>
                  <span class="text-sm font-medium" style="color:var(--text-primary);">Gérer les créneaux</span>
                  <span class="ml-auto" style="color:var(--text-muted);">→</span>
                </a>
                <a routerLink="/admin/reservations"
                   class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                   style="background:var(--bg-surface);border:1px solid var(--border);"
                   onmouseenter="this.style.borderColor='var(--border-accent)'"
                   onmouseleave="this.style.borderColor='var(--border)'">
                  <span>📋</span>
                  <span class="text-sm font-medium" style="color:var(--text-primary);">Voir les réservations</span>
                  <span class="ml-auto" style="color:var(--text-muted);">→</span>
                </a>
                <a routerLink="/admin/rapports"
                   class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                   style="background:var(--bg-surface);border:1px solid var(--border);"
                   onmouseenter="this.style.borderColor='var(--border-accent)'"
                   onmouseleave="this.style.borderColor='var(--border)'">
                  <span>📈</span>
                  <span class="text-sm font-medium" style="color:var(--text-primary);">Générer un rapport</span>
                  <span class="ml-auto" style="color:var(--text-muted);">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Réservations du jour -->
        <div class="card animate-fade-up-3" style="padding:0;">
          <div class="px-6 py-4 flex items-center justify-between" style="border-bottom:1px solid var(--border);">
            <div>
              <h2 class="font-display font-bold text-lg uppercase tracking-wide">Réservations du jour</h2>
              <p class="text-xs mt-0.5" style="color:var(--text-secondary);">Créneaux planifiés aujourd'hui</p>
            </div>
            <div class="flex gap-2 items-center">
              <button (click)="envoyerWhatsapp()"
                      [disabled]="waEnCours()"
                      class="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl font-semibold uppercase tracking-wider transition-all disabled:opacity-40"
                      style="background:rgba(37,211,102,0.1);color:#25d366;border:1px solid rgba(37,211,102,0.3);">
                {{ waEnCours() ? '...' : '📲 WhatsApp' }}
              </button>
              <a routerLink="/admin/reservations" class="btn-secondary text-xs px-3 py-1.5">Tout voir →</a>
            </div>
          </div>

          @if (!dashboard()!.prochainesReservations?.length) {
            <div class="py-12 text-center">
              <p class="text-3xl mb-2">⚽</p>
              <p class="text-sm" style="color:var(--text-muted);">Aucune réservation aujourd'hui</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm" style="min-width:600px;">
                <thead>
                  <tr style="border-bottom:1px solid var(--border);">
                    @for (h of ['Heure','Client','Code','Statut','Montant']; track h) {
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                          style="color:var(--text-secondary);">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (r of dashboard()!.prochainesReservations; track r.id; let i = $index) {
                    <tr [style.background]="i % 2 === 0 ? 'transparent' : 'var(--bg-surface)'"
                        style="border-bottom:1px solid rgba(255,255,255,0.03);">
                      <td class="px-5 py-3 font-display font-bold" style="color:var(--accent);">
                        {{ r.creneau?.debut | date:'HH:mm' }}
                      </td>
                      <td class="px-5 py-3 font-semibold" style="color:var(--text-primary);">
                        {{ r.utilisateur?.prenom }} {{ r.utilisateur?.nom }}
                        <p class="text-xs font-normal" style="color:var(--text-muted);">{{ r.utilisateur?.telephone }}</p>
                      </td>
                      <td class="px-5 py-3 font-mono text-xs" style="color:var(--text-muted);">{{ r.codeConfirmation }}</td>
                      <td class="px-5 py-3"><span [class]="badgeStatut(r.statut)">{{ labelStatut(r.statut) }}</span></td>
                      <td class="px-5 py-3 font-display font-bold" style="color:var(--accent);">
                        {{ fmt(r.montantTotal) }} F
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>

    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `
})
export class DashboardComponent implements OnInit {
  dashboard  = signal<any>(null);
  loading    = signal(true);
  aujourdhui = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  moisCourant = new Date().toLocaleDateString('fr-FR', { month:'long', year:'numeric' });

  totalSemaine = computed(() => {
    const s = this.dashboard()?.semaine ?? [];
    return s.reduce((acc: number, j: any) => acc + j.revenu, 0);
  });

  // ── Dimensions graphique ─────────────────────────────────────────────────
  private readonly CHART_W = 600;
  private readonly CHART_H = 155;
  private readonly GAP     = 8;

  barW()  { return (this.CHART_W / 7) - this.GAP; }
  barX(i: number) {
    return i * (this.CHART_W / 7) + this.GAP / 2;
  }
  barH(revenu: number) {
    const max = Math.max(...(this.dashboard()?.semaine ?? []).map((j: any) => j.revenu), 1);
    return Math.max(4, (revenu / max) * this.CHART_H);
  }
  barY(revenu: number) {
    return this.CHART_H - this.barH(revenu);
  }

  constructor(
    private adminSvc: AdminService,
    private auth: AuthService,
    private http: HttpClient,
  ) {}
  ngOnInit() { this.charger(); }


  waEnCours = signal(false);

  async envoyerWhatsapp() {
    if (this.waEnCours()) return;
    this.waEnCours.set(true);
    const today = new Date().toISOString().slice(0, 10);
    const url   = `${environment.apiUrl}/rapports/apercu-journalier?date=${today}`;
    const token = this.auth.getToken();
    try {
      const res  = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      const json = await res.json();
      const data = json.data ?? json;

      const dateLabel = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });

      const lignes: string[] = [];
      lignes.push('⚽ *TERRAIN DAKAR*');
      lignes.push('📅 ' + dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1));
      lignes.push('');
      lignes.push('📊 *Résumé*');
      lignes.push('• Réservations : ' + data.nbReservations);
      lignes.push('• Encaissé : ' + this.fmt(data.totalEncaisse) + ' FCFA');
      if (data.totalReste > 0) {
        lignes.push('• Reste à payer : ' + this.fmt(data.totalReste) + ' FCFA');
      } else {
        lignes.push('• Tout est soldé ✅');
      }
      lignes.push('');
      lignes.push('📋 *Planning du jour*');
      for (const r of data.reservations ?? []) {
        const statut = r.statut === 'CONFIRMEE' ? '✅' : '⏳';
        const reste  = r.reste > 0 ? ' — Reste ' + this.fmt(r.reste) + ' F' : '';
        lignes.push(statut + ' *' + r.heure + '* — ' + r.client + ' (' + r.telephone + ')' + reste);
      }
      lignes.push('');
      lignes.push('_Envoyé depuis Terrain Dakar_');

      const message = encodeURIComponent(lignes.join('%0A'));
      window.open('https://wa.me/?text=' + message, '_blank');
    } catch (e) {
      console.error(e);
    } finally {
      this.waEnCours.set(false);
    }
  }

    fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n || 0);
  }

  charger() {
    this.loading.set(true);
    this.adminSvc.getDashboard().subscribe({
      next:  d => { this.dashboard.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  fmtK(n: number): string {
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return String(n);
  }

  badgeStatut(s: string): string {
    return ({ CONFIRMEE:'badge-confirme', EN_ATTENTE:'badge-attente',
              ANNULEE:'badge-bloque', EXPIREE:'badge-bloque' } as any)[s] ?? '';
  }

  labelStatut(s: string): string {
    return ({ CONFIRMEE:'Confirmée', EN_ATTENTE:'En attente',
              ANNULEE:'Annulée', EXPIREE:'Expirée' } as any)[s] ?? s;
  }
}
