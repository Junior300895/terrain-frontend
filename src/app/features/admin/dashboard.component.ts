import { Component, OnInit, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminNavComponent } from '../../shared/components/admin-nav/admin-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminNavComponent, HttpClientModule],
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
          <button (click)="ouvrirApercu()"
                  [disabled]="apercuEnCours()"
                  class="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-semibold uppercase tracking-wider transition-all disabled:opacity-40"
                  style="background:rgba(220,38,38,0.1);color:#ef4444;border:1px solid rgba(220,38,38,0.3);"
                  onmouseenter="this.style.background='rgba(220,38,38,0.2)'"
                  onmouseleave="this.style.background='rgba(220,38,38,0.1)'">
            {{ apercuEnCours() ? '...' : '📄 Récap du jour' }}
          </button>
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
            <a routerLink="/admin/reservations" class="btn-secondary text-xs px-3 py-1.5">Tout voir →</a>
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

    <!-- ── MODAL APERÇU PDF ─────────────────────────────────────────── -->
    @if (apercuOuvert()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.8);" (click)="apercuOuvert.set(false)">
        <div class="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden animate-fade-up"
             style="background:#fff;" (click)="$event.stopPropagation()">

          <!-- Contenu capturé pour l'image -->
          <div #apercuContent>
          <!-- Barre verte header -->
          <div class="px-6 py-4 flex items-center justify-between shrink-0"
               style="background:#1A7A4E;">
            <div>
              <p class="font-bold text-white text-lg">Récapitulatif du jour</p>
              <p class="text-xs" style="color:rgba(255,255,255,0.7);">
                {{ apercuData()?.date }}  ·  {{ apercuData()?.nbReservations }} réservation(s)
              </p>
            </div>
            <button (click)="apercuOuvert.set(false)"
                    class="text-white text-2xl leading-none opacity-70 hover:opacity-100">×</button>
          </div>

          <!-- KPIs -->
          <div class="grid grid-cols-3 gap-px shrink-0" style="background:#e5e7eb;">
            <div class="bg-white px-4 py-3 text-center">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Réservations</p>
              <p class="font-bold text-2xl" style="color:#1A7A4E;">{{ apercuData()?.nbReservations }}</p>
            </div>
            <div class="bg-white px-4 py-3 text-center">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Encaissé</p>
              <p class="font-bold text-xl" style="color:#1A7A4E;">{{ fmtNum(apercuData()?.totalEncaisse) }} F</p>
            </div>
            <div class="bg-white px-4 py-3 text-center">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Reste</p>
              <p class="font-bold text-xl" [style.color]="apercuData()?.totalReste > 0 ? '#CC0000' : '#1A7A4E'">
                {{ apercuData()?.totalReste > 0 ? fmtNum(apercuData()?.totalReste) + ' F' : '✓ Soldé' }}
              </p>
            </div>
          </div>

          <!-- Tableau scrollable -->
          <div class="overflow-y-auto flex-1" style="background:#fff;">
            @if (!apercuData()?.reservations?.length) {
              <div class="py-12 text-center text-gray-400">
                <p class="text-3xl mb-2">⚽</p>
                <p>Aucune réservation aujourd'hui</p>
              </div>
            } @else {
              <table class="w-full text-sm border-collapse">
                <thead class="sticky top-0" style="background:#f9fafb;">
                  <tr>
                    @for (h of ['Heure','Client','Tél.','Statut','Encaissé','Reste']; track h) {
                      <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                          style="border-bottom:2px solid #e5e7eb;">{{ h }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (r of apercuData()?.reservations; track r.code; let i = $index) {
                    <tr [style.background]="i % 2 === 0 ? '#fff' : '#f9fafb'">
                      <td class="px-3 py-2.5 font-bold text-sm" style="color:#1A7A4E;border-bottom:1px solid #f3f4f6;">
                        {{ r.heure }}
                      </td>
                      <td class="px-3 py-2.5" style="border-bottom:1px solid #f3f4f6;">
                        <p class="font-semibold text-gray-800">{{ r.client }}</p>
                        <p class="text-xs text-gray-400">{{ r.code }}</p>
                      </td>
                      <td class="px-3 py-2.5 text-xs text-gray-600" style="border-bottom:1px solid #f3f4f6;">{{ r.telephone }}</td>
                      <td class="px-3 py-2.5" style="border-bottom:1px solid #f3f4f6;">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                              [style.background]="r.statut === 'CONFIRMEE' ? '#d6f0e4' : '#fef3cd'"
                              [style.color]="r.statut === 'CONFIRMEE' ? '#1A7A4E' : '#92400e'">
                          {{ r.statut === 'CONFIRMEE' ? 'Confirmée' : 'En attente' }}
                        </span>
                      </td>
                      <td class="px-3 py-2.5 font-semibold text-right" style="color:#1A7A4E;border-bottom:1px solid #f3f4f6;">
                        {{ fmtNum(r.encaisse) }} F
                      </td>
                      <td class="px-3 py-2.5 font-semibold text-right" style="border-bottom:1px solid #f3f4f6;"
                          [style.color]="r.reste > 0 ? '#CC0000' : '#9ca3af'">
                        {{ r.reste > 0 ? fmtNum(r.reste) + ' F' : '—' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>

          </div><!-- fin apercuContent -->

          <!-- Actions -->
          <div class="flex gap-3 px-6 py-4 shrink-0" style="border-top:1px solid #e5e7eb;background:#fff;">
            <button (click)="apercuOuvert.set(false)" class="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600"
                    style="border:1px solid #e5e7eb;">Fermer</button>
            <button (click)="partagerImageWhatsapp()"
                    [disabled]="imageEnCours"
                    class="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-40"
                    style="background:rgba(37,211,102,0.1);color:#25d366;border:1px solid rgba(37,211,102,0.3);">
              📲 {{ imageEnCours ? '...' : 'WhatsApp' }}
            </button>
            <button (click)="telechargerPDF(false)"
                    [disabled]="pdfEnCours"
                    class="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-40"
                    style="background:rgba(220,38,38,0.1);color:#ef4444;border:1px solid rgba(220,38,38,0.3);">
              📄 {{ pdfEnCours ? '...' : 'PDF' }}
            </button>

          </div>
        </div>
      </div>
    }

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

  pdfEnCours     = false;
  imageEnCours   = false;
  @ViewChild('apercuContent') apercuContent!: ElementRef;
  apercuOuvert   = signal(false);
  apercuData     = signal<any>(null);
  apercuEnCours  = signal(false);

  async ouvrirApercu() {
    this.apercuEnCours.set(true);
    const today = new Date().toISOString().slice(0, 10);
    const url   = environment.apiUrl + '/rapports/apercu-journalier?date=' + today;
    const token = this.auth.getToken();
    try {
      const res  = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      const data = await res.json();
      this.apercuData.set(data.data ?? data);
      this.apercuOuvert.set(true);
    } catch (e) {
      console.error(e);
    } finally {
      this.apercuEnCours.set(false);
    }
  }

  async telechargerPDF(partager = false) {
    if (this.pdfEnCours) return;
    this.pdfEnCours = true;

    const today = new Date().toISOString().slice(0, 10);
    const url   = environment.apiUrl + '/rapports/pdf-journalier?date=' + today;
    const token = this.auth.getToken();

    try {
      const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      const blob     = await response.blob();
      const fname    = 'recap-reservations-' + today + '.pdf';
      const file     = new File([blob], fname, { type: 'application/pdf' });

      // Web Share API — partage natif (WhatsApp, Telegram, email...)
      if (partager && navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title:  'Récap réservations — ' + today,
          text:   'Récapitulatif des réservations Terrain Dakar du ' + today,
          files:  [file],
        });
      } else {
        // Fallback : téléchargement direct
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fname;
        a.click();
        URL.revokeObjectURL(a.href);

        // Si partager était demandé mais Web Share non dispo → ouvrir WhatsApp Web
        if (partager) {
          const msg = encodeURIComponent('Récapitulatif réservations Terrain Dakar du ' + today + ' — voir fichier joint.');
          window.open('https://wa.me/?text=' + msg, '_blank');
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        // Partage annulé par l'utilisateur — ignorer
        console.error('Erreur PDF :', err);
      }
    } finally {
      this.pdfEnCours = false;
    }
  }

  charger() {
    this.loading.set(true);
    this.adminSvc.getDashboard().subscribe({
      next:  d => { this.dashboard.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n || 0);
  }

  async partagerImageWhatsapp() {
    if (!this.apercuContent) return;
    this.imageEnCours = true;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(this.apercuContent.nativeElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const today = new Date().toISOString().slice(0, 10);
      const fname = 'recap-reservations-' + today + '.png';

      // Convertir canvas en Blob
      const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/png'));
      const file = new File([blob], fname, { type: 'image/png' });

      // Web Share API — partage natif (WhatsApp, Telegram...)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Récap réservations — ' + today,
          text:  'Récapitulatif Terrain Dakar du ' + today,
          files: [file],
        });
      } else {
        // Fallback desktop : télécharger l'image + ouvrir WhatsApp Web
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = fname;
        a.click();
        URL.revokeObjectURL(a.href);
        const msg = encodeURIComponent('Récapitulatif réservations Terrain Dakar du ' + today + ' (voir image jointe)');
        window.open('https://wa.me/?text=' + msg, '_blank');
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error('Erreur partage :', e);
    } finally {
      this.imageEnCours = false;
    }
  }

  fmtNum(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));
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
