export type Role = 'CLIENT' | 'ADMIN' | 'CAISSIER';
export type StatutCreneau = 'DISPONIBLE' | 'RESERVE' | 'BLOQUE';
export type StatutReservation = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'EXPIREE';
export type StatutPaiement = 'EN_ATTENTE' | 'VALIDE' | 'ECHOUE' | 'REMBOURSE';
export type ModePaiement = 'SUR_PLACE' | 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY';

export interface AuthResponse {
  token: string; type: string; id: number;
  nom: string; prenom: string; telephone: string; email: string; role: Role;
}
export interface Terrain {
  id: number; nom: string; description: string;
  capacite: number; prixParHeure: number; adresse: string; actif: boolean;
}
export interface Creneau {
  id: number; terrainId: number; terrainNom: string;
  debut: string; fin: string; statut: StatutCreneau;
  prixEffectif: number; dureeHeures: number;
}
export interface Reservation {
  id: number; codeConfirmation: string; statut: StatutReservation;
  montantTotal: number; notes: string; createdAt: string;
  utilisateur: Partial<AuthResponse>;
  creneau: Creneau;
  paiement?: Paiement;
}
export interface Paiement {
  id: number; montant: number; mode: ModePaiement;
  statut: StatutPaiement; referenceExterne: string; paidAt: string;
}
export interface Dashboard {
  totalReservationsAujourdhui: number; totalReservationsMois: number;
  revenuAujourdhui: number; revenuMois: number;
  creneauxDisponiblesAujourdhui: number; tauxOccupation: number;
  prochainesReservations: Reservation[];
}
export interface ApiResponse<T> {
  success: boolean; message: string; data: T; timestamp: string;
}
