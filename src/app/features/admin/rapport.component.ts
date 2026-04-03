import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RapportService, RapportData } from '../../core/services/rapport.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminNavComponent } from '../../shared/components/admin-nav/admin-nav.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rapport',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  template: `
    <div class="space-y-6 animate-fade-up">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6"
           style="border-bottom:1px solid var(--border);">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--accent);">Administration</p>
          <h1 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">Rapports</h1>
          <p class="text-sm mt-1" style="color:var(--text-secondary);">Générer des rapports sur une période libre</p>
        </div>
      </div>

      <app-admin-nav />

      <!-- Sélecteur de période -->
      <div class="card animate-fade-up-2">
        <h2 class="font-display font-bold text-lg uppercase tracking-wide mb-4">Période</h2>
        <div class="flex flex-wrap gap-3 items-end">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                   style="color:var(--text-secondary);">Date début</label>
            <input type="date" [(ngModel)]="dateDebut" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                   style="color:var(--text-secondary);">Date fin</label>
            <input type="date" [(ngModel)]="dateFin" class="input-field" />
          </div>
          <!-- Raccourcis -->
          <div class="flex gap-2 flex-wrap">
            <button (click)="setPeriode('auj')" class="btn-secondary text-xs px-3 py-2">Aujourd'hui</button>
            <button (click)="setPeriode('semaine')"     class="btn-secondary text-xs px-3 py-2">Cette semaine</button>
            <button (click)="setPeriode('mois')"        class="btn-secondary text-xs px-3 py-2">Ce mois</button>
          </div>
          <button (click)="generer()"
                  [disabled]="loading() || !dateDebut || !dateFin"
                  class="btn-primary">
            {{ loading() ? 'Chargement...' : '📊 Générer' }}
          </button>
        </div>
      </div>

      @if (rapport()) {
        <!-- Exports -->
        <div class="flex gap-3 animate-fade-up-2">
          <button (click)="exportExcel()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all"
                  style="background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.3);"
                  onmouseenter="this.style.background='rgba(34,197,94,0.2)'"
                  onmouseleave="this.style.background='rgba(34,197,94,0.1)'">
            📊 Export Excel
          </button>
          <button (click)="exportCSV()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all"
                  style="background:rgba(0,255,135,0.08);color:var(--accent);border:1px solid var(--border-accent);"
                  onmouseenter="this.style.background='rgba(0,255,135,0.15)'"
                  onmouseleave="this.style.background='rgba(0,255,135,0.08)'">
            📥 Export CSV
          </button>
          <button (click)="exportPDF()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all"
                  style="background:rgba(72,149,239,0.08);color:#4895ef;border:1px solid rgba(72,149,239,0.3);"
                  onmouseenter="this.style.background='rgba(72,149,239,0.15)'"
                  onmouseleave="this.style.background='rgba(72,149,239,0.08)'">
            📄 Export PDF
          </button>
        </div>

        <!-- KPIs revenus -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up-2">
          <div class="card text-center">
            <p class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-secondary);">Total encaissé</p>
            <p class="font-display font-bold text-2xl" style="color:var(--accent);">
              {{ fmt(rapport()!.revenus.confirme) }} F
            </p>
          </div>
          <div class="card text-center">
            <p class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-secondary);">En attente</p>
            <p class="font-display font-bold text-2xl" style="color:rgba(255,200,0,0.9);">
              {{ fmt(rapport()!.revenus.enAttente) }} F
            </p>
          </div>
          <div class="card text-center">
            <p class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-secondary);">Taux occupation</p>
            <p class="font-display font-bold text-2xl" style="color:var(--accent);">
              {{ rapport()!.occupation.tauxOccupation }} %
            </p>
          </div>
          <div class="card text-center">
            <p class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-secondary);">Remboursé</p>
            <p class="font-display font-bold text-2xl" style="color:var(--red);">
              {{ fmt(rapport()!.revenus.rembourse) }} F
            </p>
          </div>
        </div>

        <!-- Revenus par jour (barre) -->
        <div class="card animate-fade-up-2">
          <h2 class="font-display font-bold text-lg uppercase tracking-wide mb-4">Revenus par jour</h2>
          @if (rapport()!.revenus.parJour.length === 0) {
            <p class="text-sm py-4 text-center" style="color:var(--text-muted);">Aucun revenu confirmé sur cette période</p>
          } @else {
            <div class="space-y-2">
              @for (j of rapport()!.revenus.parJour; track j.date) {
                <div class="flex items-center gap-3">
                  <span class="text-xs w-24 shrink-0" style="color:var(--text-secondary);">{{ formatDate(j.date) }}</span>
                  <div class="flex-1 h-6 rounded-full overflow-hidden" style="background:var(--bg-surface);">
                    <div class="h-full rounded-full transition-all duration-500 flex items-center px-2"
                         [style.width]="barWidth(j.montant, rapport()!.revenus.parJour) + '%'"
                         style="background:rgba(0,255,135,0.4);min-width:2%;">
                    </div>
                  </div>
                  <span class="text-xs font-bold w-28 text-right shrink-0" style="color:var(--accent);">{{ fmt(j.montant) }} F</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Occupation par jour -->
        <div class="card animate-fade-up-3">
          <h2 class="font-display font-bold text-lg uppercase tracking-wide mb-4">Occupation par jour</h2>
          @if (rapport()!.occupation.parJour.length === 0) {
            <p class="text-sm py-4 text-center" style="color:var(--text-muted);">Aucune donnée sur cette période</p>
          } @else {
            <div class="space-y-2">
              @for (j of rapport()!.occupation.parJour; track j.date) {
                <div class="flex items-center gap-3">
                  <span class="text-xs w-24 shrink-0" style="color:var(--text-secondary);">{{ formatDate(j.date) }}</span>
                  <div class="flex-1 h-6 rounded-full overflow-hidden" style="background:var(--bg-surface);">
                    <div class="h-full rounded-full flex items-center px-2"
                         [style.width]="j.taux + '%'"
                         [style.background]="j.taux > 70 ? 'rgba(0,255,135,0.5)' : j.taux > 40 ? 'rgba(255,200,0,0.4)' : 'rgba(255,77,109,0.4)'"
                         style="min-width:2%;transition:width 0.5s;">
                    </div>
                  </div>
                  <span class="text-xs font-bold w-20 text-right shrink-0"
                        [style.color]="j.taux > 70 ? 'var(--accent)' : j.taux > 40 ? 'rgba(255,200,0,0.9)' : 'var(--red)'">
                    {{ j.taux }} %
                  </span>
                  <span class="text-xs w-16 shrink-0" style="color:var(--text-muted);">{{ j.reserves }}/24</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Tableau réservations -->
        <div class="card animate-fade-up-3 overflow-x-auto" style="padding:0;">
          <div class="px-6 py-4" style="border-bottom:1px solid var(--border);">
            <h2 class="font-display font-bold text-lg uppercase tracking-wide">
              Réservations
              <span class="text-sm font-normal ml-2" style="color:var(--text-muted);">
                ({{ rapport()!.reservations.length }})
              </span>
            </h2>
          </div>
          @if (rapport()!.reservations.length === 0) {
            <p class="text-sm py-8 text-center" style="color:var(--text-muted);">Aucune réservation sur cette période</p>
          } @else {
            <table class="w-full text-xs" style="min-width:700px;">
              <thead>
                <tr style="border-bottom:1px solid var(--border);">
                  @for (col of ['Code','Date','Heure','Client','Téléphone','Statut','Montant','Paiement']; track col) {
                    <th class="px-4 py-3 text-left font-semibold uppercase tracking-widest"
                        style="color:var(--text-secondary);">{{ col }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (r of rapport()!.reservations; track r.id; let i = $index) {
                  <tr [style.background]="i % 2 === 0 ? 'transparent' : 'var(--bg-surface)'"
                      style="border-bottom:1px solid rgba(255,255,255,0.03);">
                    <td class="px-4 py-2.5 font-mono" style="color:var(--accent);">{{ r.code }}</td>
                    <td class="px-4 py-2.5" style="color:var(--text-primary);">{{ formatDate(r.date) }}</td>
                    <td class="px-4 py-2.5" style="color:var(--text-secondary);">{{ r.heure }}</td>
                    <td class="px-4 py-2.5 font-semibold" style="color:var(--text-primary);">{{ r.client }}</td>
                    <td class="px-4 py-2.5" style="color:var(--text-secondary);">{{ r.telephone }}</td>
                    <td class="px-4 py-2.5"><span [class]="badgeStatut(r.statut)">{{ r.statut }}</span></td>
                    <td class="px-4 py-2.5">
                      <span class="font-bold font-display" style="color:var(--accent);">{{ fmt(r.montant) }} F</span>
                      @if (r.montant < r.montantDu) {
                        <p class="text-xs" style="color:rgba(255,200,0,0.8);">/ {{ fmt(r.montantDu) }} F dû</p>
                      }
                    </td>
                    <td class="px-4 py-2.5" style="color:var(--text-muted);">{{ r.modePaiement }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr style="border-top:2px solid var(--border);">
                  <td colspan="6" class="px-4 py-3 text-right font-semibold text-xs uppercase"
                      style="color:var(--text-secondary);">Total encaissé :</td>
                  <td class="px-4 py-3 font-bold font-display" style="color:var(--accent);">
                    {{ fmt(rapport()!.revenus.confirme) }} F
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          }
        </div>

        <!-- Top clients -->
        <div class="card animate-fade-up-3">
          <h2 class="font-display font-bold text-lg uppercase tracking-wide mb-4">
            Clients
            <span class="text-sm font-normal ml-2" style="color:var(--text-muted);">({{ rapport()!.clients.length }})</span>
          </h2>
          @if (rapport()!.clients.length === 0) {
            <p class="text-sm py-4 text-center" style="color:var(--text-muted);">Aucun client sur cette période</p>
          } @else {
            <div class="space-y-2">
              @for (c of rapport()!.clients; track c.id; let i = $index) {
                <div class="flex items-center justify-between px-4 py-3 rounded-xl"
                     style="background:var(--bg-surface);border:1px solid var(--border);">
                  <div class="flex items-center gap-3">
                    <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style="background:rgba(0,255,135,0.15);color:var(--accent);">
                      {{ i + 1 }}
                    </span>
                    <div>
                      <p class="font-semibold text-sm" style="color:var(--text-primary);">{{ c.prenom }} {{ c.nom }}</p>
                      <p class="text-xs" style="color:var(--text-muted);">{{ c.telephone }} · Dernière visite : {{ c.derniereVisite }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-bold font-display text-sm" style="color:var(--accent);">{{ fmt(c.montantTotal) }} F</p>
                    <p class="text-xs" style="color:var(--text-muted);">{{ c.nbConfirmees }} / {{ c.nbReservations }} rés.</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class RapportComponent implements OnInit {
  rapport  = signal<RapportData | null>(null);
  loading  = signal(false);
  dateDebut = '';
  dateFin   = '';

  constructor(
    private rapportSvc: RapportService,
    private auth: AuthService,
    private http: HttpClient,
  ) {}

  ngOnInit() { this.setPeriode('mois'); }

  setPeriode(p: string) {
    const now   = new Date();
    const pad   = (n: number) => String(n).padStart(2, '0');
    const fmt   = (d: Date)   => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
    if (p === 'auj') {
      this.dateDebut = this.dateFin = fmt(now);
    } else if (p === 'semaine') {
      const lundi = new Date(now);
      lundi.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
      this.dateDebut = fmt(lundi);
      this.dateFin   = fmt(now);
    } else if (p === 'mois') {
      this.dateDebut = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-01';
      this.dateFin   = fmt(now);
    }
  }

  generer() {
    if (!this.dateDebut || !this.dateFin) return;
    this.loading.set(true);
    this.rapportSvc.generer(this.dateDebut, this.dateFin).subscribe({
      next:  data => { this.rapport.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  exportExcel() {
    const token = this.auth.getToken();
    const url   = this.rapportSvc.getUrlExcel(this.dateDebut, this.dateFin);
    fetch(url, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'rapport-' + this.dateDebut + '-' + this.dateFin + '.xlsx';
        a.click();
      });
  }

  exportCSV() {
    const token = this.auth.getToken();
    const url   = this.rapportSvc.getUrlCSV(this.dateDebut, this.dateFin);
    // Télécharger via fetch pour inclure le token JWT
    fetch(url, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'rapport-' + this.dateDebut + '-' + this.dateFin + '.csv';
        a.click();
      });
  }

  exportPDF() {
    window.print();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(n || 0);
  }

  formatDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  }

  barWidth(val: number, list: { montant: number }[]): number {
    const max = Math.max(...list.map(j => j.montant), 1);
    return Math.max(2, Math.round((val / max) * 100));
  }

  badgeStatut(s: string): string {
    return ({
      CONFIRMEE:  'badge-confirme',
      EN_ATTENTE: 'badge-attente',
      ANNULEE:    'badge-bloque',
      EXPIREE:    'badge-bloque',
    } as any)[s] ?? '';
  }
}
