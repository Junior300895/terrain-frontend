import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendrierService, CalendrierCellule } from '../../core/services/calendrier.service';
import { CreneauService } from '../../core/services/creneau.service';
import { AdminService } from '../../core/services/admin.service';
import { AdminNavComponent } from '../../shared/components/admin-nav/admin-nav.component';

interface CaseSelectionnee {
  dateStr: string;
  heure: number;
  label: string;   // ex: "Lundi 30 mars — 10h"
}

interface ClientTrouve {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
}

@Component({
  selector: 'app-creneaux-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  template: `
    <div class="space-y-6 animate-fade-up">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6"
           style="border-bottom:1px solid var(--border);">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--accent);">Administration</p>
          <h1 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">Créneaux</h1>
          <p class="text-sm mt-1" style="color:var(--text-secondary);">Gérer la disponibilité · Réserver pour un client</p>
        </div>
        <div class="flex gap-2 items-center">
          <button (click)="semainePrecedente()" class="btn-secondary px-3 py-2">←</button>
          <span class="text-sm font-semibold px-3" style="color:var(--text-primary);">{{ labelSemaine() }}</span>
          <button (click)="semaineSuivante()" class="btn-secondary px-3 py-2">→</button>
        </div>
      </div>

      <app-admin-nav />

      <!-- Légende -->
      <div class="flex flex-wrap gap-4 text-xs" style="color:var(--text-secondary);">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm inline-block" style="background:rgba(0,255,135,0.3);"></span> Disponible — clic pour réserver ou bloquer
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm inline-block" style="background:rgba(255,200,0,0.4);"></span> Réservé
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm inline-block" style="background:rgba(255,77,109,0.4);"></span> Bloqué — clic pour libérer
        </span>
      </div>

      <!-- Calendrier -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 rounded-full" style="border:2px solid var(--border);border-top-color:var(--accent);animation:spin 1s linear infinite;"></div>
        </div>
      } @else {
        <div class="card overflow-x-auto" style="padding:0;">
          <table class="w-full text-xs" style="border-collapse:collapse;min-width:700px;">
            <thead>
              <tr>
                <th class="py-3 px-2 text-left w-12" style="color:var(--text-muted);border-bottom:1px solid var(--border);">H</th>
                @for (jour of jours(); track jour.date) {
                  <th class="py-3 px-1 text-center font-semibold"
                      [style.color]="jour.estAujourdhui ? 'var(--accent)' : 'var(--text-secondary)'"
                      style="border-bottom:1px solid var(--border);">
                    <div>{{ jour.nomJour }}</div>
                    <div class="text-base font-bold" [style.color]="jour.estAujourdhui ? 'var(--accent)' : 'var(--text-primary)'">{{ jour.numJour }}</div>
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (heure of heures; track heure) {
                <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                  <td class="py-1 px-2 font-mono text-right" style="color:var(--text-muted);">{{ heure }}h</td>
                  @for (jour of jours(); track jour.date) {
                    <td class="p-0.5">
                      @if (!getCellule(jour.date, heure) || getCellule(jour.date, heure)!.statut === null) {
                        <div class="h-10 rounded" style="background:var(--bg-surface);opacity:0.3;"></div>
                      } @else if (getCellule(jour.date, heure)!.statut === 'RESERVE') {
                        <div class="h-10 rounded flex flex-col items-center justify-center text-center px-1"
                             style="background:rgba(255,200,0,0.15);border:1px solid rgba(255,200,0,0.3);">
                          <span style="color:rgba(255,200,0,0.9);" class="font-semibold">Réservé</span>
                          @if (getCellule(jour.date, heure)!.clientNom) {
                            <span style="color:var(--text-muted);" class="truncate w-full text-center">{{ getCellule(jour.date, heure)!.clientNom }}</span>
                          }
                        </div>
                      } @else if (getCellule(jour.date, heure)!.statut === 'BLOQUE') {
                        <button (click)="liberer(jour.date, heure)"
                                [disabled]="enCours() === key(jour.date, heure)"
                                class="h-10 w-full rounded flex items-center justify-center text-xs transition-all"
                                style="background:rgba(255,77,109,0.2);border:1px solid rgba(255,77,109,0.4);color:var(--red);">
                          {{ enCours() === key(jour.date, heure) ? '...' : '🔒 Libérer' }}
                        </button>
                      } @else {
                        <!-- Disponible — ouvre le modal -->
                        <button (click)="ouvrirModal(jour.date, heure, jour.label)"
                                [disabled]="enCours() === key(jour.date, heure)"
                                class="h-10 w-full rounded flex items-center justify-center text-xs transition-all"
                                style="background:rgba(0,255,135,0.08);border:1px solid rgba(0,255,135,0.15);color:var(--accent);"
                                onmouseenter="this.style.background='rgba(0,255,135,0.18)'"
                                onmouseleave="this.style.background='rgba(0,255,135,0.08)'">
                          {{ enCours() === key(jour.date, heure) ? '...' : '＋' }}
                        </button>
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- ─── MODAL ────────────────────────────────────────────────────────── -->
    @if (modalOuvert()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.7);" (click)="fermerModal()">
        <div class="w-full max-w-md rounded-2xl p-6 space-y-5 animate-fade-up"
             style="background:var(--bg-card);border:1px solid var(--border-accent);"
             (click)="$event.stopPropagation()">

          <!-- Titre -->
          <div>
            <h2 class="font-display font-bold text-xl uppercase tracking-wide" style="color:var(--text-primary);">
              {{ caseSelectionnee()?.label }}
            </h2>
            <p class="text-xs mt-1" style="color:var(--text-muted);">Terrain Principal · 40 000 FCFA</p>
          </div>

          <!-- Onglets -->
          <div class="flex gap-2">
            <button (click)="modeModal = 'reserver'"
                    class="flex-1 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all"
                    [style.background]="modeModal === 'reserver' ? 'rgba(0,255,135,0.15)' : 'transparent'"
                    [style.color]="modeModal === 'reserver' ? 'var(--accent)' : 'var(--text-muted)'"
                    [style.border]="modeModal === 'reserver' ? '1px solid var(--border-accent)' : '1px solid var(--border)'">
              ⚽ Réserver
            </button>
            <button (click)="modeModal = 'bloquer'"
                    class="flex-1 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all"
                    [style.background]="modeModal === 'bloquer' ? 'rgba(255,77,109,0.1)' : 'transparent'"
                    [style.color]="modeModal === 'bloquer' ? 'var(--red)' : 'var(--text-muted)'"
                    [style.border]="modeModal === 'bloquer' ? '1px solid rgba(255,77,109,0.3)' : '1px solid var(--border)'">
              🔒 Bloquer
            </button>
          </div>

          <!-- Mode Réserver -->
          @if (modeModal === 'reserver') {
            <div class="space-y-4">

              <!-- Recherche client — temps réel -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                       style="color:var(--text-secondary);">Numéro de téléphone</label>
                <div class="relative">
                  <input type="tel" [(ngModel)]="formTel" placeholder="77 XXX XX XX"
                         class="input-field w-full"
                         (ngModelChange)="onTelChange($event)" />
                  @if (rechercheEnCours()) {
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                          style="color:var(--text-muted);">...</span>
                  }
                </div>
              </div>

              <!-- Suggestions (plusieurs résultats) -->
              @if (suggestions().length >= 1) {
                <div class="rounded-xl overflow-hidden" style="border:1px solid var(--border);">
                  @for (s of suggestions(); track s.id) {
                    <button type="button" (click)="selectionnerClient(s)"
                            class="w-full flex items-center gap-3 p-3 text-left transition-all"
                            style="background:var(--bg-surface);"
                            onmouseenter="this.style.background='rgba(0,255,135,0.06)'"
                            onmouseleave="this.style.background='var(--bg-surface)'">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                           style="background:rgba(0,255,135,0.15);color:var(--accent);">
                        {{ s.prenom.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-semibold text-sm" style="color:var(--text-primary);">
                          {{ s.prenom }} {{ s.nom }}
                        </p>
                        <p class="text-xs" style="color:var(--text-muted);">{{ s.telephone }}</p>
                      </div>
                    </button>
                  }
                </div>
              }

              <!-- Client sélectionné -->
              @if (clientTrouve()) {
                <div class="flex items-center gap-3 p-3 rounded-xl"
                     style="background:rgba(0,255,135,0.08);border:1px solid var(--border-accent);">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                       style="background:rgba(0,255,135,0.2);color:var(--accent);">
                    {{ clientTrouve()!.prenom.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-semibold text-sm" style="color:var(--text-primary);">
                      {{ clientTrouve()!.prenom }} {{ clientTrouve()!.nom }}
                    </p>
                    <p class="text-xs" style="color:var(--text-muted);">{{ clientTrouve()!.telephone }}</p>
                  </div>
                  <span class="ml-auto text-xs px-2 py-0.5 rounded-full"
                        style="background:rgba(0,255,135,0.15);color:var(--accent);">Sélectionné</span>
                </div>
              }

              <!-- Option nouveau client : UNIQUEMENT si aucune suggestion et numéro complet -->
              @if (suggestions().length === 0 && formTel.length >= 9 && !clientTrouve() && !clientInconnu()) {
                <button type="button" (click)="nouveauClientAvecCeNumero()"
                        class="text-xs underline" style="color:var(--text-muted);">
                  Ce numéro ({{ formTel }}) est nouveau — créer le compte
                </button>
              }

              <!-- Client inconnu — formulaire création -->
              @if (clientInconnu()) {
                <div class="space-y-3 p-4 rounded-xl"
                     style="background:rgba(255,200,0,0.05);border:1px solid rgba(255,200,0,0.2);">
                  <p class="text-xs font-semibold uppercase" style="color:rgba(255,200,0,0.8);">
                    ⚠ Client inconnu — créer le compte
                  </p>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs mb-1" style="color:var(--text-secondary);">Prénom</label>
                      <input type="text" [(ngModel)]="formPrenom" class="input-field" placeholder="Moussa" />
                    </div>
                    <div>
                      <label class="block text-xs mb-1" style="color:var(--text-secondary);">Nom</label>
                      <input type="text" [(ngModel)]="formNom" class="input-field" placeholder="Diallo" />
                    </div>
                  </div>
                  <p class="text-xs" style="color:var(--text-muted);">
                    Mot de passe par défaut : <span style="color:var(--accent);">Terrain&#64;1234</span>
                  </p>
                </div>
              }

              <!-- Notes -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                       style="color:var(--text-secondary);">Notes (optionnel)</label>
                <input type="text" [(ngModel)]="formNotes" class="input-field"
                       placeholder="Ex: 5 vs 5, tournoi amical..." />
              </div>

              @if (erreurForm()) {
                <div class="p-3 rounded-lg text-sm" style="background:rgba(255,77,109,0.1);color:var(--red);">
                  ⚠ {{ erreurForm() }}
                </div>
              }
              @if (successForm()) {
                <div class="p-3 rounded-lg text-sm" style="background:rgba(0,255,135,0.1);color:var(--accent);">
                  ✅ {{ successForm() }}
                </div>
              }

              <button (click)="confirmerReservation()"
                      [disabled]="actionEnCours() || !formTel || formTel.length < 9 || (!clientTrouve() && !clientInconnu() && suggestions().length > 0)"
                      class="btn-primary w-full">
                {{ actionEnCours() ? 'Réservation...' : 'Confirmer la réservation' }}
              </button>
            </div>
          }

          <!-- Mode Bloquer -->
          @if (modeModal === 'bloquer') {
            <div class="space-y-4">
              <p class="text-sm" style="color:var(--text-secondary);">
                Ce créneau sera marqué <strong style="color:var(--red);">BLOQUÉ</strong> et ne pourra plus être réservé.
              </p>
              <div class="flex gap-3">
                <button (click)="fermerModal()" class="btn-secondary flex-1">Annuler</button>
                <button (click)="confirmerBlocage()"
                        [disabled]="actionEnCours()"
                        class="flex-1 py-2 rounded-xl font-bold uppercase tracking-wider text-sm transition-all"
                        style="background:rgba(255,77,109,0.15);color:var(--red);border:1px solid rgba(255,77,109,0.3);">
                  {{ actionEnCours() ? '...' : '🔒 Bloquer' }}
                </button>
              </div>
            </div>
          }

          <!-- Fermer -->
          <button (click)="fermerModal()" class="absolute top-4 right-4 text-xl"
                  style="color:var(--text-muted);">×</button>

        </div>
      </div>
    }

    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `,
  styles: [':host { position: relative; }']
})
export class CreneauxManagerComponent implements OnInit, OnDestroy {
  grille         = signal<Record<string, CalendrierCellule[]>>({});
  loading        = signal(true);
  enCours        = signal<string | null>(null);
  modalOuvert    = signal(false);
  caseSelectionnee = signal<CaseSelectionnee | null>(null);
  suggestions    = signal<ClientTrouve[]>([]);
  clientTrouve   = signal<ClientTrouve | null>(null);
  clientInconnu  = signal(false);
  rechercheEnCours = signal(false);
  actionEnCours  = signal(false);
  erreurForm     = signal('');
  successForm    = signal('');

  modeModal: 'reserver' | 'bloquer' = 'reserver';
  formTel    = '';
  formNom    = '';
  formPrenom = '';
  formNotes  = '';

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;
  lundi: Date = this.getLundi(new Date());
  heures = Array.from({ length: 24 }, (_, i) => 23 - i);

  constructor(
    private calendrierSvc: CalendrierService,
    private creneauSvc:    CreneauService,
    private adminSvc:      AdminService,
  ) {}

  ngOnInit() {
    this.charger();
    // Recherche en temps réel avec debounce + switchMap (annule les requêtes obsolètes)
    this.searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(tel => {
        if (tel.length < 6) {
          this.rechercheEnCours.set(false);
          this.clientTrouve.set(null);
          this.suggestions.set([]);
          this.clientInconnu.set(false);
          return [];
        }
        this.rechercheEnCours.set(true);
        return this.adminSvc.rechercherClient(tel);
      }),
    ).subscribe({
      next: (clients: ClientTrouve[]) => {
        this.rechercheEnCours.set(false);
        this.clientTrouve.set(null);
        if (clients.length > 0) {
          this.suggestions.set(clients);
          this.clientInconnu.set(false);
        } else {
          this.suggestions.set([]);
          this.clientInconnu.set(true);
        }
      },
      error: () => { this.rechercheEnCours.set(false); this.clientInconnu.set(true); },
    });
  }

  ngOnDestroy() { this.searchSub?.unsubscribe(); }

  charger() {
    this.loading.set(true);
    this.calendrierSvc.getSemaine(1, this.lundi).subscribe({
      next:  g => { this.grille.set(g); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  jours() {
    const pad = (n: number) => String(n).padStart(2, '0');
    const dk  = (d: Date) => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
    const today = dk(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.lundi); d.setDate(d.getDate() + i);
      return {
        date: dk(d),
        nomJour: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        numJour: String(d.getDate()),
        label:   d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        estAujourdhui: dk(d) === today,
      };
    });
  }

  getCellule(dateStr: string, heure: number): CalendrierCellule | undefined {
    return this.grille()[dateStr]?.find(c => new Date(c.debut).getHours() === heure);
  }

  key(dateStr: string, heure: number) {
    return dateStr + 'T' + String(heure).padStart(2, '0');
  }

  // ── Modal ────────────────────────────────────────────────────────────────

  ouvrirModal(dateStr: string, heure: number, jourLabel: string) {
    this.caseSelectionnee.set({
      dateStr, heure,
      label: jourLabel + ' — ' + heure + 'h',
    });
    this.modeModal = 'reserver';
    this.formTel = ''; this.formNom = ''; this.formPrenom = ''; this.formNotes = '';
    this.searchSubject.next('');
    this.suggestions.set([]);
    this.clientTrouve.set(null);
    this.clientInconnu.set(false);
    this.erreurForm.set(''); this.successForm.set('');
    this.modalOuvert.set(true);
  }

  fermerModal() {
    this.modalOuvert.set(false);
    this.caseSelectionnee.set(null);
  }

  onTelChange(tel: string) {
    this.clientTrouve.set(null);
    this.clientInconnu.set(false);
    this.suggestions.set([]);
    this.erreurForm.set('');
    this.searchSubject.next(tel);
  }

  nouveauClientAvecCeNumero() {
    this.suggestions.set([]);
    this.clientTrouve.set(null);
    this.clientInconnu.set(true);
  }

  selectionnerClient(client: ClientTrouve) {
    this.clientTrouve.set(client);
    this.suggestions.set([]);
    this.clientInconnu.set(false);
    this.formTel = client.telephone;
  }

  confirmerReservation() {
    const c = this.caseSelectionnee();
    if (!c) return;
    if (!this.formTel) { this.erreurForm.set('Numéro de téléphone requis'); return; }
    if (this.clientInconnu() && (!this.formNom || !this.formPrenom)) {
      this.erreurForm.set('Nom et prénom requis pour créer le client'); return;
    }

    this.actionEnCours.set(true); this.erreurForm.set('');
    const pad = (n: number) => String(n).padStart(2, '0');
    const debut = c.dateStr + 'T' + pad(c.heure) + ':00:00';

    this.adminSvc.reserverPourClient({
      terrainId: 1,
      debut,
      telephone: this.formTel,
      nom:    this.clientInconnu() ? this.formNom    : undefined,
      prenom: this.clientInconnu() ? this.formPrenom : undefined,
      notes: this.formNotes || undefined,
    }).subscribe({
      next: resa => {
        this.actionEnCours.set(false);
        this.successForm.set('Réservation créée — Code : ' + (resa as any).codeConfirmation);
        setTimeout(() => { this.fermerModal(); this.charger(); }, 1500);
      },
      error: err => {
        this.actionEnCours.set(false);
        this.erreurForm.set(err.error?.message || 'Erreur lors de la réservation');
      },
    });
  }

  confirmerBlocage() {
    const c = this.caseSelectionnee();
    if (!c) return;
    this.actionEnCours.set(true);
    this.creneauSvc.bloquerHeure(1, c.dateStr, c.heure).subscribe({
      next:  () => { this.actionEnCours.set(false); this.fermerModal(); this.charger(); },
      error: () => { this.actionEnCours.set(false); this.fermerModal(); this.charger(); },
    });
  }

  liberer(dateStr: string, heure: number) {
    const cell = this.getCellule(dateStr, heure);
    if (!cell?.creneauId) return;
    this.enCours.set(this.key(dateStr, heure));
    this.creneauSvc.liberer(cell.creneauId).subscribe({
      next:  () => { this.enCours.set(null); this.charger(); },
      error: () => { this.enCours.set(null); this.charger(); },
    });
  }

  semainePrecedente() { this.lundi.setDate(this.lundi.getDate() - 7); this.lundi = new Date(this.lundi); this.charger(); }
  semaineSuivante()   { this.lundi.setDate(this.lundi.getDate() + 7); this.lundi = new Date(this.lundi); this.charger(); }

  labelSemaine() {
    const fin = new Date(this.lundi); fin.setDate(fin.getDate() + 6);
    return this.lundi.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
           ' – ' + fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  private getLundi(d: Date): Date {
    const day = d.getDay(), diff = day === 0 ? -6 : 1 - day;
    const l = new Date(d); l.setDate(l.getDate() + diff); l.setHours(0,0,0,0); return l;
  }
}
