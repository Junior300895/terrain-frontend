import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer style="background:var(--bg-surface);border-top:1px solid var(--border);margin-top:4rem;">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-10">

          <!-- Brand -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                   style="background:var(--accent-dark);border:1px solid var(--border-accent);">⚽</div>
              <span class="font-display font-bold text-xl tracking-widest uppercase">
                Terrain <span style="color:var(--accent);">Oumar Sy</span>
              </span>
            </div>
            <p class="text-sm leading-relaxed" style="color:var(--text-secondary);">
              Réservez votre terrain de football en ligne, rapidement et simplement.
              Disponible 7j/7, de 8h à 22h.
            </p>
            <div class="flex items-center gap-2 mt-4">
              <span class="w-2 h-2 rounded-full glow-pulse" style="background:var(--accent);"></span>
              <span class="text-xs font-medium" style="color:var(--accent);">Terrain ouvert</span>
            </div>
          </div>

          <!-- Liens -->
          <div>
            <h4 class="font-display font-bold uppercase tracking-widest text-sm mb-4"
                style="color:var(--text-primary);">Navigation</h4>
            <ul class="space-y-2.5 text-sm" style="color:var(--text-secondary);">
              <li><a routerLink="/reservations" class="footer-link">Réserver un créneau</a></li>
              <li><a routerLink="/mes-reservations" class="footer-link">Mes réservations</a></li>
              <li><a routerLink="/connexion" class="footer-link">Connexion</a></li>
              <li><a routerLink="/inscription" class="footer-link">Créer un compte</a></li>
            </ul>
          </div>

          <!-- Infos -->
          <div>
            <h4 class="font-display font-bold uppercase tracking-widest text-sm mb-4"
                style="color:var(--text-primary);">Infos pratiques</h4>
            <ul class="space-y-3 text-sm" style="color:var(--text-secondary);">
              <li class="flex items-start gap-2">
                <span style="color:var(--accent);">📍</span>
                <span>Dakar, Sénégal</span>
              </li>
              <li class="flex items-start gap-2">
                <span style="color:var(--accent);">⏰</span>
                <span>Lun–Dim · 8h00 – 23h59</span>
              </li>
              <li class="flex items-start gap-2">
                <span style="color:var(--accent);">💰</span>
                <span>40 000 FCFA / heure</span>
              </li>
              <li class="flex items-start gap-2">
                <span style="color:var(--accent);">💳</span>
                <span>Paiement sur place disponible · (Wave et Orange Money) en cours </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
             style="border-top:1px solid var(--border);">
          <p class="text-xs" style="color:var(--text-muted);">
            &copy; {{ year }} Terrain Oumar Sy. Tous droits réservés.
          </p>
          <p class="text-xs" style="color:var(--text-muted);">
            Fait avec ❤️ au Sénégal
          </p>
        </div>
      </div>
    </footer>
    <style>
      .footer-link { transition: color 0.15s; }
      .footer-link:hover { color: var(--accent); }
    </style>
  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}
