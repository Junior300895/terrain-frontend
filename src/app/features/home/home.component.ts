import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-wrapper" style="margin: 0 -1rem; overflow-x: hidden;">

      <!-- ══════════════════════════════════════════════════════════
           HERO
      ══════════════════════════════════════════════════════════ -->
      <section class="hero-section">

        <!-- Terrain SVG animé en fond -->
        <div class="pitch-bg" aria-hidden="true">
          <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="rgba(0,255,135,0.12)" stroke-width="1.5">
            <rect x="30" y="30" width="840" height="540" rx="4"/>
            <line x1="450" y1="30" x2="450" y2="570"/>
            <circle cx="450" cy="300" r="70"/>
            <circle cx="450" cy="300" r="4" fill="rgba(0,255,135,0.2)"/>
            <rect x="30" y="175" width="130" height="250"/>
            <rect x="30" y="220" width="65" height="160"/>
            <rect x="740" y="175" width="130" height="250"/>
            <rect x="805" y="220" width="65" height="160"/>
            <path d="M 30 300 Q 160 240 160 300 Q 160 360 30 300"/>
            <path d="M 870 300 Q 740 240 740 300 Q 740 360 870 300"/>
          </svg>
        </div>

        <!-- Grille décorative -->
        <div class="grid-overlay" aria-hidden="true"></div>

        <!-- Particules flottantes -->
        <div class="particles" aria-hidden="true">
          @for (p of particles; track p.id) {
            <div class="particle" [style]="p.style"></div>
          }
        </div>

        <!-- Contenu Hero -->
        <div class="hero-content">

          <!-- Badge propriétaire -->
          <div class="owner-badge animate-fade-in">
            <span class="badge-dot"></span>
            <span>Terrain de Oumar Sy</span>
          </div>

          <!-- Titre principal -->
          <h1 class="hero-title animate-fade-up">
            <span class="title-line-1">TERRAIN</span>
            <span class="title-line-2">
              <span class="title-accent">DAKAR</span>
            </span>
          </h1>

          <!-- Sous-titre -->
          <p class="hero-subtitle animate-fade-up-2">
            La plateforme de référence pour réserver votre terrain de football à Dakar.
            Simple, rapide, disponible 24h/24.
          </p>

          <!-- CTA -->
          <div class="hero-cta animate-fade-up-3">
            <a routerLink="/reservations" class="cta-primary">
              <span class="cta-icon">⚽</span>
              <span>Réserver maintenant</span>
              <span class="cta-arrow">→</span>
            </a>
            @if (!auth.isLoggedIn()) {
              <a routerLink="/connexion" class="cta-secondary">Se connecter</a>
            }
          </div>

          <!-- Stats -->
          <div class="hero-stats animate-fade-up-3">
            <div class="stat-item">
              <span class="stat-number">40K</span>
              <span class="stat-label">FCFA / heure</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">24h</span>
              <span class="stat-label">Disponible</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">7j</span>
              <span class="stat-label">Sur 7</span>
            </div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div class="scroll-indicator animate-fade-up-3">
          <div class="scroll-dot"></div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           FEATURES
      ══════════════════════════════════════════════════════════ -->
      <section class="features-section">
        <div class="section-inner">

          <div class="section-tag">Pourquoi nous choisir</div>
          <h2 class="section-title">Tout pour votre match</h2>

          <div class="features-grid">
            @for (f of features; track f.icon) {
              <div class="feature-card">
                <div class="feature-icon-wrap">{{ f.icon }}</div>
                <h3 class="feature-title">{{ f.title }}</h3>
                <p class="feature-desc">{{ f.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           HOW IT WORKS
      ══════════════════════════════════════════════════════════ -->
      <section class="steps-section">
        <div class="section-inner">

          <div class="section-tag">Simple comme bonjour</div>
          <h2 class="section-title">Réserver en 3 étapes</h2>

          <div class="steps-grid">
            @for (s of steps; track s.num) {
              <div class="step-card">
                <div class="step-num">{{ s.num }}</div>
                <div class="step-icon">{{ s.icon }}</div>
                <h3 class="step-title">{{ s.title }}</h3>
                <p class="step-desc">{{ s.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════
           CTA FINAL
      ══════════════════════════════════════════════════════════ -->
      <section class="cta-section">
        <div class="cta-inner">
          <div class="cta-glow" aria-hidden="true"></div>
          <span class="cta-tag">Prêt à jouer ?</span>
          <h2 class="cta-heading">Votre prochain match commence ici</h2>
          <p class="cta-text">Choisissez votre créneau, réservez en ligne et profitez du terrain.</p>
          <a routerLink="/reservations" class="cta-primary cta-large">
            <span>⚽ Voir les créneaux disponibles</span>
            <span class="cta-arrow">→</span>
          </a>
        </div>
      </section>

    </div>

    <style>
      /* ── Reset & variables ─────────────────────────────────── */
      .home-wrapper { background: var(--bg-base, #0a0e14); }

      /* ── HERO ──────────────────────────────────────────────── */
      .hero-section {
        position: relative;
        min-height: 96vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 6rem 1.5rem 4rem;
        overflow: hidden;
      }

      .pitch-bg {
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        pointer-events: none;
      }
      .pitch-bg svg { width: 100%; height: 100%; object-fit: cover; }

      .grid-overlay {
        position: absolute; inset: 0; pointer-events: none;
        background-image:
          linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px);
        background-size: 60px 60px;
      }

      .particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .particle {
        position: absolute; border-radius: 50%;
        background: rgba(0,255,135,0.5);
        animation: float-up linear infinite;
      }

      @keyframes float-up {
        0%   { transform: translateY(100vh) scale(0); opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 0.3; }
        100% { transform: translateY(-20px) scale(1); opacity: 0; }
      }

      .hero-content {
        position: relative; z-index: 2;
        display: flex; flex-direction: column; align-items: center;
        text-align: center; gap: 1.5rem; max-width: 800px;
      }

      .owner-badge {
        display: inline-flex; align-items: center; gap: 0.5rem;
        padding: 0.4rem 1rem; border-radius: 999px;
        background: rgba(0,255,135,0.08);
        border: 1px solid rgba(0,255,135,0.25);
        font-size: 0.75rem; font-weight: 600;
        color: var(--accent, #00ff87);
        letter-spacing: 0.05em; text-transform: uppercase;
      }
      .badge-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--accent, #00ff87);
        animation: pulse 2s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.4); }
      }

      .hero-title {
        display: flex; flex-direction: column; align-items: center;
        line-height: 0.9; margin: 0;
        font-family: var(--font-display, 'Barlow Condensed', sans-serif);
        font-weight: 800; text-transform: uppercase;
      }
      .title-line-1 {
        font-size: clamp(4rem, 14vw, 9rem);
        color: rgba(255,255,255,0.12);
        letter-spacing: -0.02em;
      }
      .title-line-2 {
        font-size: clamp(4.5rem, 16vw, 10rem);
        letter-spacing: -0.02em;
        margin-top: -0.1em;
      }
      .title-accent {
        color: var(--accent, #00ff87);
        text-shadow: 0 0 60px rgba(0,255,135,0.4), 0 0 120px rgba(0,255,135,0.15);
        position: relative;
      }
      .title-accent::after {
        content: '';
        position: absolute; bottom: -4px; left: 0; right: 0;
        height: 3px; background: var(--accent, #00ff87);
        border-radius: 2px;
        box-shadow: 0 0 20px rgba(0,255,135,0.6);
      }

      .hero-subtitle {
        font-size: clamp(0.95rem, 2.5vw, 1.15rem);
        color: rgba(255,255,255,0.5);
        max-width: 520px; line-height: 1.7; margin: 0;
      }

      .hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

      .cta-primary {
        display: inline-flex; align-items: center; gap: 0.75rem;
        padding: 0.9rem 2rem; border-radius: 0.75rem;
        background: var(--accent, #00ff87);
        color: #0a0e14; font-weight: 800;
        font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em;
        text-decoration: none; transition: all 0.2s;
        box-shadow: 0 0 30px rgba(0,255,135,0.3);
      }
      .cta-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 50px rgba(0,255,135,0.5);
      }
      .cta-icon { font-size: 1.1rem; }
      .cta-arrow { transition: transform 0.2s; }
      .cta-primary:hover .cta-arrow { transform: translateX(4px); }

      .cta-secondary {
        display: inline-flex; align-items: center;
        padding: 0.9rem 1.75rem; border-radius: 0.75rem;
        border: 1px solid rgba(255,255,255,0.15);
        color: rgba(255,255,255,0.7);
        font-size: 0.9rem; font-weight: 600;
        text-decoration: none; transition: all 0.2s;
      }
      .cta-secondary:hover {
        border-color: var(--accent, #00ff87);
        color: var(--accent, #00ff87);
      }

      .hero-stats {
        display: flex; align-items: center; gap: 2rem;
        padding: 1.25rem 2.5rem; border-radius: 1rem;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(10px);
      }
      .stat-item { text-align: center; }
      .stat-number {
        display: block;
        font-family: var(--font-display, 'Barlow Condensed', sans-serif);
        font-size: 1.8rem; font-weight: 800;
        color: var(--accent, #00ff87); line-height: 1;
      }
      .stat-label {
        display: block; font-size: 0.65rem;
        color: rgba(255,255,255,0.35);
        text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.2rem;
      }
      .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.08); }

      .scroll-indicator {
        position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
        display: flex; flex-direction: column; align-items: center;
      }
      .scroll-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: rgba(0,255,135,0.5);
        animation: scroll-bounce 2s ease-in-out infinite;
      }
      @keyframes scroll-bounce {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(8px); opacity: 0.3; }
      }

      /* ── SECTIONS communes ─────────────────────────────────── */
      .section-inner { max-width: 1100px; margin: 0 auto; padding: 5rem 1.5rem; }
      .section-tag {
        display: inline-block;
        font-size: 0.7rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.15em;
        color: var(--accent, #00ff87);
        margin-bottom: 0.75rem;
      }
      .section-title {
        font-family: var(--font-display, 'Barlow Condensed', sans-serif);
        font-size: clamp(2rem, 5vw, 3.5rem);
        font-weight: 800; text-transform: uppercase;
        color: #fff; margin: 0 0 3rem; line-height: 1;
      }

      /* ── FEATURES ──────────────────────────────────────────── */
      .features-section { background: rgba(255,255,255,0.02); }
      .features-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
      }
      .feature-card {
        padding: 2rem; border-radius: 1rem;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        transition: all 0.25s;
      }
      .feature-card:hover {
        border-color: rgba(0,255,135,0.25);
        background: rgba(0,255,135,0.04);
        transform: translateY(-4px);
      }
      .feature-icon-wrap {
        font-size: 2.2rem; margin-bottom: 1rem; display: block;
      }
      .feature-title {
        font-size: 1rem; font-weight: 700; color: #fff;
        margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.04em;
      }
      .feature-desc { font-size: 0.85rem; color: rgba(255,255,255,0.45); line-height: 1.7; margin: 0; }

      /* ── STEPS ─────────────────────────────────────────────── */
      .steps-section {}
      .steps-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem; position: relative;
      }
      .step-card {
        display: flex; flex-direction: column; align-items: flex-start;
        gap: 0.75rem; padding: 1.5rem 0;
        border-top: 2px solid rgba(0,255,135,0.2);
      }
      .step-num {
        font-family: var(--font-display, 'Barlow Condensed', sans-serif);
        font-size: 3.5rem; font-weight: 800; line-height: 1;
        color: rgba(0,255,135,0.15);
      }
      .step-icon { font-size: 1.8rem; }
      .step-title { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; }
      .step-desc { font-size: 0.82rem; color: rgba(255,255,255,0.4); line-height: 1.7; margin: 0; }

      /* ── CTA FINAL ─────────────────────────────────────────── */
      .cta-section {
        padding: 2rem 1.5rem 5rem;
        display: flex; justify-content: center;
      }
      .cta-inner {
        position: relative; max-width: 700px; width: 100%;
        text-align: center; padding: 4rem 2rem;
        border-radius: 1.5rem;
        background: rgba(0,255,135,0.04);
        border: 1px solid rgba(0,255,135,0.15);
        overflow: hidden;
      }
      .cta-glow {
        position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
        width: 400px; height: 300px; border-radius: 50%;
        background: radial-gradient(ellipse, rgba(0,255,135,0.12) 0%, transparent 70%);
        pointer-events: none;
      }
      .cta-tag {
        display: inline-block; font-size: 0.7rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.15em;
        color: var(--accent, #00ff87); margin-bottom: 1rem;
      }
      .cta-heading {
        font-family: var(--font-display, 'Barlow Condensed', sans-serif);
        font-size: clamp(2rem, 5vw, 3rem); font-weight: 800;
        text-transform: uppercase; color: #fff; margin: 0 0 1rem; line-height: 1.1;
      }
      .cta-text {
        font-size: 0.9rem; color: rgba(255,255,255,0.45);
        margin: 0 0 2.5rem; line-height: 1.7;
      }
      .cta-large { padding: 1.1rem 2.5rem; font-size: 1rem; }

      /* ── Animations ────────────────────────────────────────── */
      .animate-fade-in  { animation: fadeIn 0.8s ease forwards; }
      .animate-fade-up  { animation: fadeUp 0.8s 0.1s ease both; }
      .animate-fade-up-2 { animation: fadeUp 0.8s 0.25s ease both; }
      .animate-fade-up-3 { animation: fadeUp 0.8s 0.4s ease both; }

      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
    </style>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  particles: { id: number; style: string }[] = [];

  features = [
    { icon: '📅', title: 'Calendrier temps réel',  desc: 'Visualisez tous les créneaux disponibles en temps réel, 24h/24 et 7j/7.' },
    { icon: '⚡', title: 'Réservation instantanée', desc: 'Choisissez votre heure, confirmez et recevez votre code en quelques secondes.' },
    { icon: '💰', title: 'Paiement flexible',       desc: 'Payez en totalité ou versez un acompte — Wave, Orange Money, Sur place.' },
    { icon: '📲', title: 'Confirmation WhatsApp',   desc: 'Recevez votre confirmation directement sur WhatsApp après paiement.' },
    { icon: '🔒', title: 'Réservation sécurisée',   desc: 'Votre créneau est bloqué dès la réservation. Zéro risque de double réservation.' },
    { icon: '📊', title: 'Suivi en ligne',           desc: 'Consultez vos réservations passées et à venir depuis votre espace personnel.' },
  ];

  steps = [
    { num: '01', icon: '🔍', title: 'Choisissez un créneau', desc: 'Parcourez le calendrier et sélectionnez l\'heure qui vous convient.' },
    { num: '02', icon: '✍️', title: 'Confirmez',             desc: 'Entrez vos informations et validez votre réservation en un clic.' },
    { num: '03', icon: '⚽', title: 'Jouez !',              desc: 'Présentez-vous au terrain avec votre code de confirmation. C\'est parti !' },
  ];

  constructor(public auth: AuthService) {}

  ngOnInit() {
    // Générer les particules flottantes
    this.particles = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      style: [
        `left: ${Math.random() * 100}%`,
        `width: ${2 + Math.random() * 4}px`,
        `height: ${2 + Math.random() * 4}px`,
        `animation-duration: ${8 + Math.random() * 12}s`,
        `animation-delay: ${Math.random() * 10}s`,
        `opacity: ${0.3 + Math.random() * 0.4}`,
      ].join(';')
    }));
  }

  ngOnDestroy() {}
}
