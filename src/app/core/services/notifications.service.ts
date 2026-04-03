import { Injectable, OnDestroy } from '@angular/core';
import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface NotificationReservation {
  id: number;
  codeConfirmation: string;
  clientNom: string;
  clientTelephone: string;
  debut: string;
  montantTotal: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService implements OnDestroy {
  notifications = signal<NotificationReservation[]>([]);
  nonLues       = signal(0);

  private eventSource: EventSource | null = null;

  constructor(private auth: AuthService) {}

  connecter() {
    if (this.eventSource) return; // déjà connecté
    const token = this.auth.getToken();
    if (!token) return;

    const url = environment.apiUrl + '/notifications/reservations?token=' + token;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const notif: NotificationReservation = JSON.parse(event.data);
        this.notifications.update(list => [notif, ...list].slice(0, 20));
        this.nonLues.update(n => n + 1);
      } catch (_) {}
    };

    this.eventSource.onerror = () => {
      // Reconnexion automatique gérée par le navigateur pour SSE
    };
  }

  deconnecter() {
    this.eventSource?.close();
    this.eventSource = null;
  }

  marquerLues() {
    this.nonLues.set(0);
  }

  ngOnDestroy() {
    this.deconnecter();
  }
}
