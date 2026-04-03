import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-10 animate-fade-up">
      <div class="w-full max-w-md">

        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-5"
               style="background:var(--accent-dark);border:1px solid var(--border-accent);">⚽</div>
          <h1 class="font-display font-bold text-4xl uppercase tracking-wider mb-2">Créer un compte</h1>
          <p style="color:var(--text-secondary);" class="text-sm">Rejoignez-nous pour réserver votre terrain</p>
        </div>

        <div class="card">
          @if (error()) {
            <div class="mb-5 p-3 rounded-lg text-sm flex items-center gap-2"
                 style="background:rgba(255,77,109,0.1);border:1px solid rgba(255,77,109,0.3);color:var(--red);">
              <span>⚠</span> {{ error() }}
            </div>
          }
          <form (ngSubmit)="onSubmit()" #f="ngForm" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                       style="color:var(--text-secondary);">Prénom</label>
                <input type="text" name="prenom" [(ngModel)]="form.prenom"
                       placeholder="Moussa" required class="input-field" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                       style="color:var(--text-secondary);">Nom</label>
                <input type="text" name="nom" [(ngModel)]="form.nom"
                       placeholder="Diallo" required class="input-field" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style="color:var(--text-secondary);">Téléphone <span style="color:var(--accent);">*</span></label>
              <input type="tel" name="telephone" [(ngModel)]="form.telephone"
                     placeholder="77 000 00 00" required class="input-field" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style="color:var(--text-secondary);">Email <span style="color:var(--text-muted);">(optionnel)</span></label>
              <input type="email" name="email" [(ngModel)]="form.email"
                     placeholder="moussa@email.com" class="input-field" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style="color:var(--text-secondary);">Mot de passe <span style="color:var(--accent);">*</span></label>
              <input type="password" name="motDePasse" [(ngModel)]="form.motDePasse"
                     placeholder="6 caractères minimum" required minlength="6" class="input-field" />
            </div>
            <button type="submit" [disabled]="loading() || !f.valid"
                    class="btn-primary w-full py-3 text-base mt-2">
              {{ loading() ? 'Création...' : 'Créer mon compte' }}
            </button>
          </form>
          <div class="mt-6 pt-5 text-center" style="border-top:1px solid var(--border);">
            <p class="text-sm" style="color:var(--text-secondary);">
              Déjà un compte ?
              <a routerLink="/connexion" class="font-semibold ml-1" style="color:var(--accent);">Se connecter</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = { nom: '', prenom: '', telephone: '', email: '', motDePasse: '' };
  loading = signal(false); error = signal('');
  constructor(private auth: AuthService, private router: Router) {}
  onSubmit() {
    this.loading.set(true); this.error.set('');
    this.auth.inscrire(this.form).subscribe({
      next: () => this.router.navigate(['/reservations']),
      error: (err) => { this.error.set(err.error?.message || 'Erreur inscription'); this.loading.set(false); }
    });
  }
}
