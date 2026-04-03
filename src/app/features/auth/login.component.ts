import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4 animate-fade-up">
      <div class="w-full max-w-md">

        <!-- Hero -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-5 glow-pulse"
               style="background:var(--accent-dark);border:1px solid var(--border-accent);">⚽</div>
          <h1 class="font-display font-bold text-4xl uppercase tracking-wider mb-2">
            Connexion
          </h1>
          <p style="color:var(--text-secondary);" class="text-sm">
            Accédez à votre espace réservation
          </p>
        </div>

        <div class="card">
          @if (error()) {
            <div class="mb-5 p-3 rounded-lg text-sm flex items-center gap-2"
                 style="background:rgba(255,77,109,0.1);border:1px solid rgba(255,77,109,0.3);color:var(--red);">
              <span>⚠</span> {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" #f="ngForm" class="space-y-5">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style="color:var(--text-secondary);">Téléphone</label>
              <input type="tel" name="telephone" [(ngModel)]="form.telephone"
                     placeholder="77 000 00 00" required class="input-field" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest mb-2"
                     style="color:var(--text-secondary);">Mot de passe</label>
              <input type="password" name="motDePasse" [(ngModel)]="form.motDePasse"
                     placeholder="••••••••" required class="input-field" />
            </div>
            <button type="submit" [disabled]="loading() || !f.valid"
                    class="btn-primary w-full py-3 text-base mt-2">
              {{ loading() ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>

          <div class="mt-6 pt-5" style="border-top:1px solid var(--border);">
            <p class="text-center text-sm" style="color:var(--text-secondary);">
              Pas encore de compte ?
              <a routerLink="/inscription" class="font-semibold ml-1"
                 style="color:var(--accent);">S'inscrire</a>
            </p>
          </div>

          <!-- Démo -->
          <div class="mt-4 p-3 rounded-lg text-xs text-center"
               style="background:rgba(0,255,135,0.05);border:1px solid var(--border-accent);color:var(--text-secondary);">
            Admin démo : <span style="color:var(--accent);font-weight:600;">770000000</span>
            / <span style="color:var(--accent);font-weight:600;">Admin&#64;1234</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form = { telephone: '', motDePasse: '' };
  loading = signal(false);
  error = signal('');
  constructor(private auth: AuthService, private router: Router) {}
  onSubmit() {
    this.loading.set(true); this.error.set('');
    this.auth.connecter(this.form).subscribe({
      next: () => this.router.navigate(['/reservations']),
      error: (err) => { this.error.set(err.error?.message || 'Identifiants incorrects'); this.loading.set(false); }
    });
  }
}
