import { Component, OnInit, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- ============================================================
         HERO
    ============================================================ -->
    <section class="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">

      <!-- Terrain SVG background -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style="opacity:0.07;">
        <svg viewBox="0 0 800 540" width="900" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#00ff87" stroke-width="1.5">
          <!-- Terrain extérieur -->
          <rect x="20" y="20" width="760" height="500" rx="4"/>
          <!-- Ligne médiane -->
          <line x1="400" y1="20" x2="400" y2="520"/>
          <!-- Cercle central -->
          <circle cx="400" cy="270" r="60"/>
          <circle cx="400" cy="270" r="3" fill="#00ff87"/>
          <!-- Surface de réparation gauche -->
          <rect x="20" y="160" width="110" height="220"/>
          <rect x="20" y="205" width="55" height="130"/>
          <!-- Surface de réparation droite -->
          <rect x="670" y="160" width="110" height="220"/>
          <rect x="725" y="205" width="55" height="130"/>
          <!-- Arcs de coin -->
          <path d="M20 20 Q35 20 35 35"/>
          <path d="M780 20 Q765 20 765 35"/>
          <path d="M20 520 Q35 520 35 505"/>
          <path d="M780 520 Q765 520 765 505"/>
          <!-- Points de penalty -->
          <circle cx="105" cy="270" r="3" fill="#00ff87"/>
          <circle cx="695" cy="270" r="3" fill="#00ff87"/>
          <!-- Buts -->
          <rect x="4" y="235" width="16" height="70" stroke-width="1"/>
          <rect x="780" y="235" width="16" height="70" stroke-width="1"/>
          <!-- Projecteurs coins -->
          <circle cx="20" cy="20" r="8" fill="none" stroke-width="1"/>
          <circle cx="780" cy="20" r="8" fill="none" stroke-width="1"/>
          <circle cx="20" cy="520" r="8" fill="none" stroke-width="1"/>
          <circle cx="780" cy="520" r="8" fill="none" stroke-width="1"/>
        </svg>
      </div>

      <!-- Glow orbs ambiance -->
      <div class="absolute pointer-events-none" style="top:15%;left:8%;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle, rgba(0,255,135,0.06) 0%, transparent 70%);"></div>
      <div class="absolute pointer-events-none" style="bottom:20%;right:6%;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle, rgba(0,255,135,0.04) 0%, transparent 70%);"></div>

      <!-- Hero content -->
      <div class="relative z-10 text-center max-w-4xl mx-auto">

        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-up"
             style="background:rgba(0,255,135,0.08);border:1px solid var(--border-accent);">
          <span class="w-2 h-2 rounded-full glow-pulse" style="background:var(--accent);"></span>
          <span class="text-xs font-semibold uppercase tracking-widest" style="color:var(--accent);">
            Dakar · Terrain disponible maintenant
          </span>
        </div>

        <!-- Titre principal -->
        <h1 class="font-display font-bold uppercase leading-none mb-6 animate-fade-up-2"
            style="font-size:clamp(3rem, 10vw, 7rem);letter-spacing:0.01em;">
          <span style="color:var(--text-primary);">Le Terrain</span>
          <br>
          <span style="color:var(--accent);text-shadow:0 0 60px rgba(0,255,135,0.3);">de Football</span>
          <br>
          <span style="color:var(--text-primary);">à Dakar</span>
        </h1>

        <!-- Sous-titre -->
        <p class="text-lg sm:text-xl mb-10 max-w-xl mx-auto animate-fade-up-3"
           style="color:var(--text-secondary);line-height:1.7;">
          Réservez votre créneau en ligne en 30 secondes.
          Gazon synthétique, éclairage LED, disponible 7j/7 de 8h à 22h.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-3">
          <a routerLink="/reservations" class="btn-primary text-base px-8 py-4 w-full sm:w-auto" style="font-size:1rem;">
            ⚽ Réserver maintenant
          </a>
          @if (!auth.isLoggedIn()) {
            <a routerLink="/inscription" class="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
              Créer un compte gratuit
            </a>
          } @else {
            <a routerLink="/mes-reservations" class="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
              Mes réservations →
            </a>
          }
        </div>

        <!-- Stat bar -->
        <div class="flex items-center justify-center gap-8 mt-14 flex-wrap animate-fade-up-3">
          <div class="text-center">
            <p class="font-display font-bold text-3xl" style="color:var(--accent);">40k</p>
            <p class="text-xs uppercase tracking-widest mt-1" style="color:var(--text-muted);">FCFA / heure</p>
          </div>
          <div class="w-px h-10 hidden sm:block" style="background:var(--border);"></div>
          <div class="text-center">
            <p class="font-display font-bold text-3xl" style="color:var(--accent);">7j/7</p>
            <p class="text-xs uppercase tracking-widest mt-1" style="color:var(--text-muted);">Ouvert</p>
          </div>
          <div class="w-px h-10 hidden sm:block" style="background:var(--border);"></div>
          <div class="text-center">
            <p class="font-display font-bold text-3xl" style="color:var(--accent);">14h</p>
            <p class="text-xs uppercase tracking-widest mt-1" style="color:var(--text-muted);">De 8h à 22h</p>
          </div>
          <div class="w-px h-10 hidden sm:block" style="background:var(--border);"></div>
          <div class="text-center">
            <p class="font-display font-bold text-3xl" style="color:var(--accent);">30s</p>
            <p class="text-xs uppercase tracking-widest mt-1" style="color:var(--text-muted);">Pour réserver</p>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up-3">
        <span class="text-xs uppercase tracking-widest" style="color:var(--text-muted);">Découvrir</span>
        <div class="w-px h-8" style="background:linear-gradient(to bottom, var(--text-muted), transparent);"></div>
      </div>
    </section>

    <!-- ============================================================
         COMMENT ÇA MARCHE
    ============================================================ -->
    <section class="py-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
             style="background:var(--bg-surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-xs font-semibold uppercase tracking-widest mb-3" style="color:var(--accent);">Simple & rapide</p>
          <h2 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">
            Comment ça marche ?
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          <!-- Ligne de connexion desktop -->
          <div class="hidden sm:block absolute top-10 left-1/3 right-1/3 h-px"
               style="background:linear-gradient(90deg, transparent, var(--border-accent), transparent);"></div>

          @for (step of steps; track step.num) {
            <div class="flex flex-col items-center text-center gap-4">
              <div class="relative">
                <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300"
                     [style.background]="step.bg"
                     [style.border]="step.border"
                     [style.boxShadow]="step.glow">
                  {{ step.icon }}
                </div>
                <div class="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold"
                     style="background:var(--accent);color:#0a0e14;">
                  {{ step.num }}
                </div>
              </div>
              <div>
                <h3 class="font-display font-bold text-xl uppercase tracking-wide mb-2">{{ step.title }}</h3>
                <p class="text-sm leading-relaxed" style="color:var(--text-secondary);">{{ step.desc }}</p>
              </div>
            </div>
          }
        </div>

        <div class="text-center mt-14">
          <a routerLink="/reservations" class="btn-primary text-base px-10 py-4">
            Commencer maintenant
          </a>
        </div>
      </div>
    </section>

    <!-- ============================================================
         FEATURES
    ============================================================ -->
    <section class="py-24 max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-xs font-semibold uppercase tracking-widest mb-3" style="color:var(--accent);">Pourquoi nous choisir</p>
        <h2 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">
          Un terrain d'exception
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (feat of features; track feat.icon) {
          <div class="card card-hover group transition-all duration-300">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-all duration-300"
                 style="background:var(--accent-dark);border:1px solid var(--border-accent);"
                 [style.boxShadow]="'none'"
                 onmouseenter="this.style.boxShadow='0 0 16px rgba(0,255,135,0.2)'"
                 onmouseleave="this.style.boxShadow='none'">
              {{ feat.icon }}
            </div>
            <h3 class="font-display font-bold text-xl uppercase tracking-wide mb-2">{{ feat.title }}</h3>
            <p class="text-sm leading-relaxed" style="color:var(--text-secondary);">{{ feat.desc }}</p>
          </div>
        }
      </div>
    </section>

    <!-- ============================================================
         TARIFS
    ============================================================ -->
    <section class="py-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
             style="background:var(--bg-surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-xs font-semibold uppercase tracking-widest mb-3" style="color:var(--accent);">Tarification</p>
          <h2 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">Nos tarifs</h2>
          <p class="mt-4 text-sm" style="color:var(--text-secondary);">Transparent, sans frais cachés</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <!-- Tarif standard -->
          <div class="card flex flex-col gap-4"
               style="border-color:var(--border);">
            <div>
              <p class="text-xs uppercase tracking-widest font-semibold mb-1" style="color:var(--text-secondary);">Tarif standard</p>
              <div class="flex items-end gap-2">
                <span class="font-display font-bold text-5xl" style="color:var(--text-primary);">40 000</span>
                <span class="text-lg mb-1" style="color:var(--text-secondary);">FCFA / heure</span>
              </div>
            </div>
            <ul class="space-y-2.5 text-sm" style="color:var(--text-secondary);">
              @for (item of tarifsStandard; track item) {
                <li class="flex items-center gap-2">
                  <span style="color:var(--accent);">✓</span> {{ item }}
                </li>
              }
            </ul>
            <a routerLink="/reservations" class="btn-secondary text-sm text-center mt-auto">
              Réserver ce créneau
            </a>
          </div>

          <!-- Tarif soirée / promoted -->
          <div class="card flex flex-col gap-4 relative overflow-hidden"
               style="border-color:var(--border-accent);box-shadow:0 0 30px var(--accent-glow);">
            <div class="absolute top-4 right-4">
              <span class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                    style="background:var(--accent);color:#0a0e14;">
                Populaire
              </span>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest font-semibold mb-1" style="color:var(--accent);">Soirée (18h – 22h)</p>
              <div class="flex items-end gap-2">
                <span class="font-display font-bold text-5xl" style="color:var(--accent);">40 000</span>
                <span class="text-lg mb-1" style="color:var(--text-secondary);">FCFA / heure</span>
              </div>
            </div>
            <ul class="space-y-2.5 text-sm" style="color:var(--text-secondary);">
              @for (item of tarifsSoiree; track item) {
                <li class="flex items-center gap-2">
                  <span style="color:var(--accent);">✓</span> {{ item }}
                </li>
              }
            </ul>
            <a routerLink="/reservations" class="btn-primary text-sm text-center mt-auto">
              Réserver maintenant
            </a>
          </div>
        </div>

        <!-- Modes de paiement -->
        <div class="mt-10 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
             style="background:var(--bg-card);border:1px solid var(--border);">
          <div>
            <p class="font-semibold text-sm mb-1">Modes de paiement acceptés</p>
            <p class="text-xs" style="color:var(--text-secondary);">Paiement à l'arrivée ou en ligne</p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            @for (mode of paiements; track mode.label) {
              <div class="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
                   style="background:var(--bg-surface);border:1px solid var(--border);color:var(--text-primary);">
                <span>{{ mode.icon }}</span> {{ mode.label }}
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         INFOS PRATIQUES
    ============================================================ -->
    <section class="py-24 max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-xs font-semibold uppercase tracking-widest mb-3" style="color:var(--accent);">Infos pratiques</p>
        <h2 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide">
          Tout ce qu'il faut savoir
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        @for (info of infos; track info.title) {
          <div class="flex items-start gap-4 p-5 rounded-xl"
               style="background:var(--bg-card);border:1px solid var(--border);">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                 style="background:var(--accent-dark);border:1px solid var(--border-accent);">
              {{ info.icon }}
            </div>
            <div>
              <p class="font-display font-bold uppercase tracking-wide mb-1">{{ info.title }}</p>
              <p class="text-sm leading-relaxed" style="color:var(--text-secondary);">{{ info.desc }}</p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- ============================================================
         CTA FINAL
    ============================================================ -->
    <section class="py-24 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden"
             style="background:var(--bg-surface);border-top:1px solid var(--border);">
      <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(ellipse at center, rgba(0,255,135,0.05) 0%, transparent 60%);"></div>
      <div class="relative z-10 max-w-2xl mx-auto">
        <div class="text-6xl mb-6">⚽</div>
        <h2 class="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide mb-4">
          Prêt à jouer ?
        </h2>
        <p class="text-lg mb-10" style="color:var(--text-secondary);">
          Réservez votre terrain en 30 secondes. Aucune avance, paiement sur place.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/reservations" class="btn-primary text-base px-10 py-4 w-full sm:w-auto">
            Voir les créneaux disponibles
          </a>
          @if (!auth.isLoggedIn()) {
            <a routerLink="/inscription" class="btn-secondary text-base px-10 py-4 w-full sm:w-auto">
              Créer un compte
            </a>
          }
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {

  constructor(public auth: AuthService) {}

  steps = [
    {
      num: 1, icon: '📅',
      title: 'Choisissez',
      desc: 'Consultez le calendrier et sélectionnez le créneau qui vous convient.',
      bg: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.25)',
      glow: '0 0 20px rgba(0,255,135,0.15)'
    },
    {
      num: 2, icon: '✅',
      title: 'Confirmez',
      desc: 'Validez votre réservation en un clic. Recevez votre code de confirmation.',
      bg: 'rgba(72,149,239,0.08)', border: '1px solid rgba(72,149,239,0.25)',
      glow: '0 0 20px rgba(72,149,239,0.12)'
    },
    {
      num: 3, icon: '⚽',
      title: 'Jouez !',
      desc: 'Présentez-vous au terrain avec votre code. Payez sur place et profitez !',
      bg: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.25)',
      glow: '0 0 20px rgba(255,209,102,0.12)'
    }
  ];

  features = [
    { icon: '🌿', title: 'Gazon synthétique',   desc: 'Surface de jeu de qualité professionnelle, entretenue régulièrement pour un maximum de confort.' },
    { icon: '💡', title: 'Éclairage LED',        desc: 'Projecteurs puissants pour jouer en soirée dans des conditions optimales, même après le coucher du soleil.' },
    { icon: '🅿️', title: 'Parking gratuit',      desc: 'Espace de stationnement sécurisé à disposition de tous les joueurs, sans frais supplémentaires.' },
    { icon: '🚿', title: 'Vestiaires',           desc: 'Vestiaires propres et douches disponibles avant et après votre match.' },
    { icon: '📱', title: 'Réservation en ligne', desc: 'Réservez depuis votre téléphone en 30 secondes, 24h/24 et 7j/7, sans appel ni déplacement.' },
    { icon: '🔒', title: 'Paiement sécurisé',   desc: 'Payez sur place à votre arrivée, ou via Wave et Orange Money. Aucune avance requise.' },
  ];

  tarifsStandard = [
    'Lundi au vendredi, 8h – 18h',
    'Accès vestiaires inclus',
    'Parking gratuit',
    'Annulation jusqu\'à 2h avant'
  ];

  tarifsSoiree = [
    'Tous les jours, 18h – 22h',
    'Éclairage LED inclus',
    'Accès vestiaires inclus',
    'Parking gratuit'
  ];

  paiements = [
    { icon: '💵', label: 'Sur place' },
    { icon: '📲', label: 'Wave' },
    { icon: '🟠', label: 'Orange Money' },
    { icon: '🟣', label: 'Free Money' },
  ];

  infos = [
    { icon: '📍', title: 'Adresse',      desc: 'Dakar, Sénégal. Nous vous envoyons la localisation exacte à la confirmation de réservation.' },
    { icon: '⏰', title: 'Horaires',     desc: 'Ouvert 7 jours sur 7, de 8h00 à 22h00. Créneaux d\'une heure, réservables jusqu\'à 30 min avant.' },
    { icon: '📞', title: 'Contact',      desc: 'Une question ? Contactez-nous via WhatsApp au +221 77 000 00 00. Réponse rapide garantie.' },
    { icon: '🔄', title: 'Annulation',   desc: 'Annulation gratuite jusqu\'à 2 heures avant le début du créneau. Simple et sans condition.' },
    { icon: '👥', title: 'Capacité',     desc: 'Terrain homologué pour 5 vs 5, 7 vs 7 ou 11 vs 11. Adapté à tous les formats de jeu.' },
    { icon: '🏆', title: 'Tournois',     desc: 'Organisez vos tournois et événements. Tarifs groupes disponibles sur demande.' },
  ];
}
