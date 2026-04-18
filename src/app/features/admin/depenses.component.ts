import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepenseService, Depense, CATEGORIES } from '../../core/services/depense.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminNavComponent } from '../../shared/components/admin-nav/admin-nav.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavComponent],
  template: `
    <div class="space-y-6 animate-fade-up">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6"
           style="border-bottom:1px solid var(--border);">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--accent);">Administration</p>
          <h1 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">Dépenses</h1>
          <p class="text-sm mt-1" style="color:var(--text-secondary);">Suivi des charges et factures du terrain</p>
        </div>
        <button (click)="ouvrirFormulaire()"
                class="btn-primary self-start sm:self-end">
          + Nouvelle dépense
        </button>
      </div>

      <app-admin-nav />

      <!-- Filtres -->
      <div class="card animate-fade-up-2">
        <div class="flex flex-wrap gap-3 items-end">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--text-secondary);">Du</label>
            <input type="date" [(ngModel)]="filtreDebut" class="input-field" (ngModelChange)="charger()" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--text-secondary);">Au</label>
            <input type="date" [(ngModel)]="filtreFin" class="input-field" (ngModelChange)="charger()" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase tracking-widest mb-1" style="color:var(--text-secondary);">Catégorie</label>
            <select [(ngModel)]="filtreCategorie" class="input-field" (ngModelChange)="charger()"
                    style="background:var(--bg-surface);color:var(--text-primary);">
              <option value="">Toutes</option>
              @for (c of categories; track c.value) {
                <option [value]="c.value" style="background:var(--bg-surface);">{{ c.label }}</option>
              }
            </select>
          </div>
          @if (filtreDebut || filtreFin || filtreCategorie) {
            <button (click)="resetFiltres()" class="btn-secondary text-sm px-3">✕ Reset</button>
          }
        </div>
      </div>

      <!-- KPIs -->
      @if (!loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up-2">
          <div class="card text-center">
            <p class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-secondary);">Total dépenses</p>
            <p class="font-display font-bold text-2xl" style="color:var(--red);">{{ fmt(totalDepenses()) }} F</p>
          </div>
          <div class="card text-center">
            <p class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-secondary);">Nb dépenses</p>
            <p class="font-display font-bold text-2xl" style="color:var(--text-primary);">{{ depenses().length }}</p>
          </div>
          @for (cat of topCategories(); track cat.categorie) {
            <div class="card text-center">
              <p class="text-xs uppercase tracking-widest mb-1" style="color:var(--text-secondary);">
                {{ svc.getCategorieLabel(cat.categorie) }}
              </p>
              <p class="font-display font-bold text-xl" [style.color]="svc.getCategorieColor(cat.categorie)">
                {{ fmt(cat.total) }} F
              </p>
            </div>
          }
        </div>
      }

      <!-- Liste -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 rounded-full" style="border:2px solid var(--border);border-top-color:var(--accent);animation:spin 1s linear infinite;"></div>
        </div>
      } @else if (depenses().length === 0) {
        <div class="card text-center py-16">
          <p class="text-4xl mb-3">🧾</p>
          <p class="font-semibold" style="color:var(--text-primary);">Aucune dépense enregistrée</p>
          <p class="text-sm mt-1" style="color:var(--text-muted);">Cliquez sur "+ Nouvelle dépense" pour commencer.</p>
        </div>
      } @else {
        <div class="card overflow-x-auto animate-fade-up-3" style="padding:0;">
          <table class="w-full text-sm" style="min-width:700px;">
            <thead>
              <tr style="border-bottom:1px solid var(--border);">
                @for (h of ['Date','Catégorie','Description','Référence','Montant','Statut','Fichier','Actions']; track h) {
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                      style="color:var(--text-secondary);">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (d of depenses(); track d.id; let i = $index) {
                <tr [style.background]="i % 2 === 0 ? 'transparent' : 'var(--bg-surface)'"
                    style="border-bottom:1px solid rgba(255,255,255,0.03);">
                  <td class="px-4 py-3 text-xs" style="color:var(--text-secondary);">{{ formatDate(d.dateDepense) }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs font-semibold px-2 py-1 rounded-full"
                          [style.background]="svc.getCategorieColor(d.categorie) + '22'"
                          [style.color]="svc.getCategorieColor(d.categorie)">
                      {{ svc.getCategorieLabel(d.categorie) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-medium" style="color:var(--text-primary);max-width:200px;">{{ d.description }}</td>
                  <td class="px-4 py-3 text-xs font-mono" style="color:var(--text-muted);">{{ d.referenceFacture || '—' }}</td>
                  <td class="px-4 py-3 font-bold font-display" style="color:var(--red);">{{ fmt(d.montant) }} F</td>
                  <td class="px-4 py-3">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                          [style.background]="d.statut === 'PAYEE' ? 'rgba(0,255,135,0.1)' : 'rgba(255,200,0,0.1)'"
                          [style.color]="d.statut === 'PAYEE' ? 'var(--accent)' : 'rgba(255,200,0,0.9)'">
                      {{ d.statut === 'PAYEE' ? '✓ Payée' : '⏳ En attente' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    @if (d.fichierUrl) {
                      <button (click)="voirFichier(d)"
                              class="text-xs px-2 py-1 rounded-lg transition-all"
                              style="background:rgba(72,149,239,0.1);color:#4895ef;border:1px solid rgba(72,149,239,0.3);">
                        📎 Voir
                      </button>
                    } @else {
                      <span style="color:var(--text-muted);" class="text-xs">—</span>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-1">
                      <button (click)="ouvrirFormulaire(d)" class="btn-secondary text-xs px-2 py-1">✎</button>
                      <button (click)="supprimer(d)" class="text-xs px-2 py-1 rounded-lg transition-all"
                              style="background:rgba(255,77,109,0.1);color:var(--red);border:1px solid rgba(255,77,109,0.2);">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- ── MODAL FORMULAIRE ─────────────────────────────────────────── -->
    @if (modalOuvert()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.75);overflow:hidden;"
           (click)="fermerModal()">
        <div class="w-full max-w-lg rounded-2xl animate-fade-up"
             style="background:var(--bg-card);border:1px solid var(--border-accent);max-height:90vh;display:flex;flex-direction:column;overflow:hidden;"
             (click)="$event.stopPropagation()">

          <!-- Header modal -->
          <div class="px-6 py-4 flex items-center justify-between shrink-0"
               style="border-bottom:1px solid var(--border);">
            <h2 class="font-display font-bold text-xl uppercase tracking-wide">
              {{ depenseEdit() ? 'Modifier' : 'Nouvelle' }} dépense
            </h2>
            <button (click)="fermerModal()" class="text-xl" style="color:var(--text-muted);">×</button>
          </div>

          <!-- Corps modal scrollable -->
          <div class="px-6 py-5 space-y-4 overflow-y-auto flex-1">

            <!-- Catégorie -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:var(--text-secondary);">Catégorie *</label>
              <select [(ngModel)]="form.categorie" class="input-field w-full"
                      style="background:var(--bg-surface);color:var(--text-primary);">
                <option value="" style="background:var(--bg-surface);">Sélectionner...</option>
                @for (c of categories; track c.value) {
                  <option [value]="c.value" style="background:var(--bg-surface);">{{ c.label }}</option>
                }
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:var(--text-secondary);">Description *</label>
              <input type="text" [(ngModel)]="form.description" class="input-field w-full"
                     placeholder="Ex: Facture Woyofal avril 2026" />
            </div>

            <!-- Montant + Date -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:var(--text-secondary);">Montant (FCFA) *</label>
                <input type="number" [(ngModel)]="form.montant" class="input-field w-full"
                       placeholder="0" min="0" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:var(--text-secondary);">Date *</label>
                <input type="date" [(ngModel)]="form.dateDepense" class="input-field w-full" />
              </div>
            </div>

            <!-- Référence + Statut -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:var(--text-secondary);">Référence facture</label>
                <input type="text" [(ngModel)]="form.referenceFacture" class="input-field w-full"
                       placeholder="Ex: WOY-2026-042" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:var(--text-secondary);">Statut</label>
                <select [(ngModel)]="form.statut" class="input-field w-full"
                        style="background:var(--bg-surface);color:var(--text-primary);">
                  <option value="PAYEE" style="background:var(--bg-surface);">✓ Payée</option>
                  <option value="EN_ATTENTE" style="background:var(--bg-surface);">⏳ En attente</option>
                </select>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:var(--text-secondary);">Notes</label>
              <textarea [(ngModel)]="form.notes" class="input-field w-full" rows="2"
                        placeholder="Informations complémentaires..."></textarea>
            </div>

            <!-- Upload fichier -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2" style="color:var(--text-secondary);">
                Facture (photo ou PDF)
              </label>
              <div class="relative">
                <input type="file" #fileInput accept="image/*,.pdf"
                       (change)="onFichierChange($event)"
                       class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <div class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                     style="background:var(--bg-surface);border:1px dashed var(--border);">
                  <span class="text-xl">📎</span>
                  <div>
                    <p class="text-sm" style="color:var(--text-primary);">
                      {{ fichierSelectionne ? fichierSelectionne.name : (depenseEdit()?.fichierNom || 'Choisir un fichier') }}
                    </p>
                    <p class="text-xs" style="color:var(--text-muted);">JPG, PNG, PDF — max 10 Mo</p>
                  </div>
                </div>
              </div>
              @if (depenseEdit()?.fichierUrl && !fichierSelectionne) {
                <p class="text-xs mt-1" style="color:var(--accent);">✓ Fichier existant conservé</p>
              }
            </div>

            @if (erreur()) {
              <div class="p-3 rounded-xl text-sm" style="background:rgba(255,77,109,0.1);color:var(--red);">
                ⚠ {{ erreur() }}
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="flex gap-3 px-6 py-4 shrink-0" style="border-top:1px solid var(--border);">
            <button (click)="fermerModal()" class="flex-1 btn-secondary">Annuler</button>
            <button (click)="sauvegarder()"
                    [disabled]="enCours()"
                    class="flex-1 btn-primary">
              {{ enCours() ? 'Enregistrement...' : (depenseEdit() ? 'Modifier' : 'Enregistrer') }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── MODAL VISUALISATION FICHIER ──────────────────────────────── -->

    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `
})
export class DepensesComponent implements OnInit {
  depenses    = signal<Depense[]>([]);
  loading     = signal(true);
  modalOuvert = signal(false);
  depenseEdit = signal<Depense | null>(null);
  enCours     = signal(false);
  erreur      = signal('');

  filtreDebut     = '';
  filtreFin       = '';
  filtreCategorie = '';

  categories = CATEGORIES;

  form = {
    categorie: '', description: '', montant: 0,
    dateDepense: new Date().toISOString().slice(0, 10),
    referenceFacture: '', statut: 'PAYEE', notes: '',
  };
  fichierSelectionne: File | null = null;

  totalDepenses = computed(() =>
    this.depenses().reduce((s, d) => s + Number(d.montant), 0)
  );

  topCategories = computed(() => {
    const map = new Map<string, number>();
    for (const d of this.depenses()) {
      map.set(d.categorie, (map.get(d.categorie) ?? 0) + Number(d.montant));
    }
    return Array.from(map.entries())
      .map(([categorie, total]) => ({ categorie, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 2);
  });

  constructor(public svc: DepenseService, private auth: AuthService) {}

  ngOnInit() { this.charger(); }

  charger() {
    this.loading.set(true);
    this.svc.getAll(this.filtreDebut || undefined, this.filtreFin || undefined,
                    this.filtreCategorie || undefined).subscribe({
      next:  d => { this.depenses.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  resetFiltres() {
    this.filtreDebut = ''; this.filtreFin = ''; this.filtreCategorie = '';
    this.charger();
  }

  ouvrirFormulaire(d?: Depense) {
    this.depenseEdit.set(d ?? null);
    this.erreur.set('');
    this.fichierSelectionne = null;
    if (d) {
      this.form = {
        categorie: d.categorie, description: d.description,
        montant: d.montant, dateDepense: d.dateDepense,
        referenceFacture: d.referenceFacture ?? '',
        statut: d.statut, notes: d.notes ?? '',
      };
    } else {
      this.form = { categorie: '', description: '', montant: 0,
        dateDepense: new Date().toISOString().slice(0, 10),
        referenceFacture: '', statut: 'PAYEE', notes: '' };
    }
    document.body.style.overflow = 'hidden';
    this.modalOuvert.set(true);
  }

  fermerModal() {
    this.modalOuvert.set(false);
    document.body.style.overflow = '';
  }

  onFichierChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fichierSelectionne = input.files?.[0] ?? null;
  }

  sauvegarder() {
    if (!this.form.categorie || !this.form.description || !this.form.montant || !this.form.dateDepense) {
      this.erreur.set('Veuillez remplir tous les champs obligatoires.'); return;
    }
    this.enCours.set(true); this.erreur.set('');

    const fd = new FormData();
    fd.append('categorie',        this.form.categorie);
    fd.append('description',      this.form.description);
    fd.append('montant',          String(this.form.montant));
    fd.append('dateDepense',      this.form.dateDepense);
    fd.append('referenceFacture', this.form.referenceFacture);
    fd.append('statut',           this.form.statut);
    fd.append('notes',            this.form.notes);
    if (this.fichierSelectionne) fd.append('fichier', this.fichierSelectionne);

    const obs = this.depenseEdit()
      ? this.svc.modifier(this.depenseEdit()!.id, fd)
      : this.svc.creer(fd);

    obs.subscribe({
      next: () => { this.enCours.set(false); this.fermerModal(); this.charger(); },
      error: err => {
        this.erreur.set(err.error?.message || 'Erreur lors de l\'enregistrement');
        this.enCours.set(false);
      },
    });
  }

  supprimer(d: Depense) {
    if (!confirm(`Supprimer la dépense "${d.description}" ?`)) return;
    this.svc.supprimer(d.id).subscribe({ next: () => this.charger() });
  }

  voirFichier(d: Depense) {
    if (!d.fichierUrl) return;
    this.svc.getUrlSignee(d.id).subscribe({
      next: url => { window.open(url ?? d.fichierUrl!, '_blank'); },
      error: ()  => { window.open(d.fichierUrl!, '_blank'); },
    });
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));
  }

  formatDate(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}
