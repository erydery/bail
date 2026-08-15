// ─── Utilisateurs / Auth ───────────────────────────────────────────────────
export type UserRole = 'admin' | 'gestionnaire';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// ─── Propriétaires ────────────────────────────────────────────────────────
export interface Proprietaire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  iban?: string;
  commissionTaux: number; // %
  createdAt: string;
}

// ─── Logements ────────────────────────────────────────────────────────────
export type LogementStatut = 'libre' | 'occupe' | 'en_travaux';
export type LogementType = 'appartement' | 'maison' | 'studio' | 'local_commercial';

export interface Logement {
  id: string;
  proprietaireId: string;
  adresse: string;
  ville: string;
  codePostal: string;
  type: LogementType;
  surface: number; // m²
  nbPieces: number;
  statut: LogementStatut;
  loyer: number;
  charges: number;
  depotGarantie: number;
  photos: string[];
  description?: string;
  createdAt: string;
}

// ─── Locataires ───────────────────────────────────────────────────────────
export interface Locataire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
  numeroPiece: string;
  garant?: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
  createdAt: string;
}

// ─── Candidatures ─────────────────────────────────────────────────────────
export type CandidatureStatut = 'en_attente' | 'en_etude' | 'acceptee' | 'refusee';

export interface Candidature {
  id: string;
  logementId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  revenus: number;
  employeur: string;
  tauxEffort: number; // %
  garant?: {
    nom: string;
    prenom: string;
    revenus: number;
  };
  statut: CandidatureStatut;
  notes?: string;
  documents: string[];
  createdAt: string;
}

// ─── Baux ─────────────────────────────────────────────────────────────────
export type BailType = 'nu' | 'meuble';
export type BailStatut = 'actif' | 'expire' | 'resilie' | 'preavis';

export interface Bail {
  id: string;
  logementId: string;
  locataireId: string;
  type: BailType;
  statut: BailStatut;
  dateDebut: string;
  dateFin?: string;
  datePreavis?: string;
  loyer: number;
  charges: number;
  depotGarantie: number;
  jourEcheance: number; // 1-28
  indexIRL?: number;
  createdAt: string;
}

// ─── Paiements ────────────────────────────────────────────────────────────
export type PaiementStatut = 'paye' | 'partiel' | 'en_retard' | 'en_attente';
export type PaiementMode = 'virement' | 'cheque' | 'especes' | 'prelevement';

export interface Paiement {
  id: string;
  bailId: string;
  moisConcerne: string; // YYYY-MM
  montantDu: number;
  montantPaye: number;
  datePaiement?: string;
  statut: PaiementStatut;
  mode?: PaiementMode;
  notes?: string;
  createdAt: string;
}

// ─── Communications ───────────────────────────────────────────────────────
export type CommunicationType = 'quittance' | 'relance' | 'notification';
export type CommunicationCanal = 'email' | 'sms';
export type RelancePalier = 'rappel_amical' | 'mise_en_demeure' | 'contentieux';

export interface Communication {
  id: string;
  type: CommunicationType;
  canal: CommunicationCanal;
  locataireId: string;
  paiementId?: string;
  statut: 'envoye' | 'echec' | 'en_attente';
  date: string;
  objet: string;
}

export interface Relance {
  id: string;
  paiementId: string;
  palier: RelancePalier;
  dateEnvoi: string;
  statut: 'envoye' | 'echec';
}

// ─── Révisions de loyer ───────────────────────────────────────────────────
export interface RevisionLoyer {
  id: string;
  bailId: string;
  date: string;
  ancienLoyer: number;
  nouveauLoyer: number;
  indiceIRL: number;
  tauxVariation: number;
  applique: boolean;
}

// ─── Charges locatives ────────────────────────────────────────────────────
export interface ChargeLocative {
  id: string;
  logementId: string;
  periode: string; // YYYY
  typeCharge: string;
  montantReel: number;
  justificatif?: string;
}

export interface RegularisationCharges {
  id: string;
  bailId: string;
  periode: string;
  provisionsPercues: number;
  chargesReelles: number;
  solde: number; // positif = remboursement, négatif = complément dû
  statut: 'calculee' | 'envoyee' | 'reglee';
}

// ─── Comptabilité ─────────────────────────────────────────────────────────
export interface Depense {
  id: string;
  logementId: string;
  proprietaireId: string;
  type: 'travaux' | 'charge_avancee' | 'frais_gestion' | 'autre';
  montant: number;
  description: string;
  date: string;
  justificatif?: string;
}

export interface Reversement {
  id: string;
  proprietaireId: string;
  periode: string; // YYYY-MM
  totalLoyers: number;
  totalCommission: number;
  totalDepenses: number;
  montantReverseNet: number;
  date: string;
  statut: 'en_attente' | 'vire' | 'annule';
}

// ─── États des lieux ──────────────────────────────────────────────────────
export type EDLType = 'entree' | 'sortie';

export interface PieceEDL {
  nom: string;
  etat: 'bon' | 'usage' | 'degrade' | 'manquant';
  observations: string;
  photos: string[];
}

export interface EtatDesLieux {
  id: string;
  bailId: string;
  type: EDLType;
  date: string;
  pieces: PieceEDL[];
  observations: string;
  signatureLocataire: boolean;
  signatureAgent: boolean;
  createdAt: string;
}

// ─── Maintenance ──────────────────────────────────────────────────────────
export type MaintenanceStatut = 'ouvert' | 'en_cours' | 'resolu' | 'annule';
export type MaintenancePriorite = 'basse' | 'normale' | 'haute' | 'urgente';

export interface Maintenance {
  id: string;
  logementId: string;
  titre: string;
  description: string;
  statut: MaintenanceStatut;
  priorite: MaintenancePriorite;
  prestataire?: string;
  cout?: number;
  dateSignalement: string;
  dateResolution?: string;
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────
export interface DashboardStats {
  loyersEnRetard: number;
  loyersMontantRetard: number;
  bauxEcheance30j: number;
  revisionsAFaire: number;
  ticketsMaintenance: number;
  tauxOccupation: number;
  revenusEncaissesMois: number;
  logementsTotaux: number;
  logementsLibres: number;
}
