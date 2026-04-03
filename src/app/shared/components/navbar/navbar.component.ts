import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav style="background:var(--bg-surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:40;backdrop-filter:blur(12px);">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-300 group-hover:scale-110"
                 style="background:var(--accent-dark);border:1px solid var(--border-accent);box-shadow:0 0 12px var(--accent-glow);">
              ⚽
            </div>
            <span class="hidden sm:block font-display font-bold text-xl tracking-widest uppercase">
              Terrain <span style="color:var(--accent);">Dakar</span>
            </span>
          </a>

          <!-- Nav links -->
          <div class="flex items-center gap-1">
            <a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="nav-active"
               class="nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hidden sm:block">
              Accueil
            </a>
            @if (!auth.isCaissier()) {
              <a routerLink="/reservations" routerLinkActive="nav-active"
                 class="nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                Réserver
              </a>
            }
            @if (auth.isLoggedIn() && !auth.isCaissier()) {
              <a routerLink="/mes-reservations" routerLinkActive="nav-active"
                 class="nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hidden sm:block">
                Mes résa.
              </a>
            }
            @if (auth.isCaissier()) {
              <a routerLink="/admin/dashboard" routerLinkActive="nav-active"
                 class="nav-link px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                Admin
              </a>
            }

            <div class="w-px h-5 mx-2" style="background:var(--border);"></div>

            @if (auth.isLoggedIn()) {
              <div class="flex items-center gap-2">
                <span class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                      style="background:var(--accent-dark);border:1px solid var(--border-accent);color:var(--accent);">
                  <span class="w-2 h-2 rounded-full" style="background:var(--accent);"></span>
                  {{ auth.currentUser()?.prenom }}
                </span>
                <button (click)="auth.deconnecter()" class="btn-secondary text-sm px-3 py-1.5">
                  Déco.
                </button>
              </div>
            } @else {
              <a routerLink="/connexion" class="btn-primary text-sm">Connexion</a>
            }
          </div>
        </div>
      </div>
    </nav>
    <style>
      .nav-link { color:var(--text-secondary); }
      .nav-link:hover { color:var(--text-primary); background:var(--bg-hover); }
      .nav-active { color:var(--accent) !important; background:var(--accent-dark) !important; }
    </style>
  `
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
