import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="flex gap-1 flex-wrap mb-8 p-1 rounded-xl" style="background:var(--bg-surface);border:1px solid var(--border);">
      <a routerLink="/admin/dashboard" routerLinkActive="admin-tab-active"
         class="admin-tab flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">
        <span>📊</span> Dashboard
      </a>
      <a routerLink="/admin/reservations" routerLinkActive="admin-tab-active"
         class="admin-tab flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">
        <span>📋</span> Réservations
      </a>
      <a routerLink="/admin/creneaux" routerLinkActive="admin-tab-active"
         class="admin-tab flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">
        <span>🗓</span> Créneaux
      </a>
      <a routerLink="/admin/rapports" routerLinkActive="admin-tab-active"
         class="admin-tab flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">
        <span>📈</span> Rapports
      </a>
    </div>
    <style>
      .admin-tab { color: var(--text-secondary); }
      .admin-tab:hover { color: var(--text-primary); background: var(--bg-hover); }
      .admin-tab-active { color: var(--accent) !important; background: var(--accent-dark) !important; border: 1px solid var(--border-accent) !important; }
    </style>
  `
})
export class AdminNavComponent {}
