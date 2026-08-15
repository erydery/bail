import {
  pgTable, text, integer, numeric, boolean,
  timestamp, date, pgEnum, jsonb, serial
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────
export const userRoleEnum       = pgEnum('user_role',         ['admin', 'gestionnaire']);
export const logementStatutEnum = pgEnum('logement_statut',   ['libre', 'occupe', 'en_travaux']);
export const logementTypeEnum   = pgEnum('logement_type',     ['appartement', 'maison', 'studio', 'local_commercial']);
export const candidatureStatutEnum = pgEnum('candidature_statut', ['en_attente', 'en_etude', 'acceptee', 'refusee']);
export const bailTypeEnum       = pgEnum('bail_type',         ['nu', 'meuble']);
export const bailStatutEnum     = pgEnum('bail_statut',       ['actif', 'expire', 'resilie', 'preavis']);
export const paiementStatutEnum = pgEnum('paiement_statut',   ['paye', 'partiel', 'en_retard', 'en_attente']);
export const paiementModeEnum   = pgEnum('paiement_mode',     ['virement', 'cheque', 'especes', 'prelevement']);
export const commTypeEnum       = pgEnum('comm_type',         ['quittance', 'relance', 'notification']);
export const commCanalEnum      = pgEnum('comm_canal',        ['email', 'sms']);
export const commStatutEnum     = pgEnum('comm_statut',       ['envoye', 'echec', 'en_attente']);
export const relancePalierEnum  = pgEnum('relance_palier',    ['rappel_amical', 'mise_en_demeure', 'contentieux']);
export const relanceStatutEnum  = pgEnum('relance_statut',    ['envoye', 'echec']);
export const regChargesStatutEnum = pgEnum('reg_charges_statut', ['calculee', 'envoyee', 'reglee']);
export const depenseTypeEnum    = pgEnum('depense_type',      ['travaux', 'charge_avancee', 'frais_gestion', 'autre']);
export const reversementStatutEnum = pgEnum('reversement_statut', ['en_attente', 'vire', 'annule']);
export const edlTypeEnum        = pgEnum('edl_type',          ['entree', 'sortie']);
export const maintenanceStatutEnum = pgEnum('maintenance_statut', ['ouvert', 'en_cours', 'resolu', 'annule']);
export const maintenancePrioriteEnum = pgEnum('maintenance_priorite', ['basse', 'normale', 'haute', 'urgente']);

// ─── Users ────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:           text('id').primaryKey(),
  nom:          text('nom').notNull(),
  prenom:       text('prenom').notNull(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role:         userRoleEnum('role').notNull().default('gestionnaire'),
  avatar:       text('avatar'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
});

// ─── Propriétaires ────────────────────────────────────────────────────────
export const proprietaires = pgTable('proprietaires', {
  id:              text('id').primaryKey(),
  nom:             text('nom').notNull(),
  prenom:          text('prenom').notNull(),
  email:           text('email').notNull(),
  telephone:       text('telephone').notNull(),
  adresse:         text('adresse').notNull(),
  iban:            text('iban'),
  commissionTaux:  numeric('commission_taux', { precision: 5, scale: 2 }).notNull().default('8'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
});

// ─── Logements ────────────────────────────────────────────────────────────
export const logements = pgTable('logements', {
  id:              text('id').primaryKey(),
  proprietaireId:  text('proprietaire_id').notNull().references(() => proprietaires.id, { onDelete: 'cascade' }),
  adresse:         text('adresse').notNull(),
  ville:           text('ville').notNull(),
  codePostal:      text('code_postal').notNull(),
  type:            logementTypeEnum('type').notNull(),
  surface:         numeric('surface', { precision: 8, scale: 2 }).notNull(),
  nbPieces:        integer('nb_pieces').notNull(),
  statut:          logementStatutEnum('statut').notNull().default('libre'),
  loyer:           integer('loyer').notNull(),
  charges:         integer('charges').notNull().default(0),
  depotGarantie:   integer('depot_garantie').notNull().default(0),
  photos:          jsonb('photos').notNull().default([]),
  description:     text('description'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
});

// ─── Locataires ───────────────────────────────────────────────────────────
export const locataires = pgTable('locataires', {
  id:            text('id').primaryKey(),
  nom:           text('nom').notNull(),
  prenom:        text('prenom').notNull(),
  email:         text('email').notNull(),
  telephone:     text('telephone').notNull(),
  adresse:       text('adresse').notNull(),
  dateNaissance: date('date_naissance').notNull(),
  numeroPiece:   text('numero_piece').notNull(),
  garant:        jsonb('garant'),   // { nom, prenom, telephone, email }
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

// ─── Candidatures ─────────────────────────────────────────────────────────
export const candidatures = pgTable('candidatures', {
  id:          text('id').primaryKey(),
  logementId:  text('logement_id').notNull().references(() => logements.id, { onDelete: 'cascade' }),
  nom:         text('nom').notNull(),
  prenom:      text('prenom').notNull(),
  email:       text('email').notNull(),
  telephone:   text('telephone').notNull(),
  revenus:     integer('revenus').notNull(),
  employeur:   text('employeur').notNull(),
  tauxEffort:  numeric('taux_effort', { precision: 5, scale: 2 }).notNull(),
  garant:      jsonb('garant'),
  statut:      candidatureStatutEnum('statut').notNull().default('en_attente'),
  notes:       text('notes'),
  documents:   jsonb('documents').notNull().default([]),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

// ─── Baux ─────────────────────────────────────────────────────────────────
export const baux = pgTable('baux', {
  id:            text('id').primaryKey(),
  logementId:    text('logement_id').notNull().references(() => logements.id),
  locataireId:   text('locataire_id').notNull().references(() => locataires.id),
  type:          bailTypeEnum('type').notNull(),
  statut:        bailStatutEnum('statut').notNull().default('actif'),
  dateDebut:     date('date_debut').notNull(),
  dateFin:       date('date_fin'),
  datePreavis:   date('date_preavis'),
  loyer:         integer('loyer').notNull(),
  charges:       integer('charges').notNull().default(0),
  depotGarantie: integer('depot_garantie').notNull().default(0),
  jourEcheance:  integer('jour_echeance').notNull().default(5),
  indexIRL:      numeric('index_irl', { precision: 8, scale: 2 }),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

// ─── Paiements ────────────────────────────────────────────────────────────
export const paiements = pgTable('paiements', {
  id:            text('id').primaryKey(),
  bailId:        text('bail_id').notNull().references(() => baux.id, { onDelete: 'cascade' }),
  moisConcerne:  text('mois_concerne').notNull(),   // YYYY-MM
  montantDu:     integer('montant_du').notNull(),
  montantPaye:   integer('montant_paye').notNull().default(0),
  datePaiement:  date('date_paiement'),
  statut:        paiementStatutEnum('statut').notNull().default('en_attente'),
  mode:          paiementModeEnum('mode'),
  notes:         text('notes'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

// ─── Communications ───────────────────────────────────────────────────────
export const communications = pgTable('communications', {
  id:          text('id').primaryKey(),
  type:        commTypeEnum('type').notNull(),
  canal:       commCanalEnum('canal').notNull(),
  locataireId: text('locataire_id').notNull().references(() => locataires.id),
  paiementId:  text('paiement_id').references(() => paiements.id),
  statut:      commStatutEnum('statut').notNull().default('en_attente'),
  date:        timestamp('date').notNull().defaultNow(),
  objet:       text('objet').notNull(),
});

// ─── Relances ─────────────────────────────────────────────────────────────
export const relances = pgTable('relances', {
  id:          text('id').primaryKey(),
  paiementId:  text('paiement_id').notNull().references(() => paiements.id, { onDelete: 'cascade' }),
  palier:      relancePalierEnum('palier').notNull(),
  dateEnvoi:   timestamp('date_envoi').notNull().defaultNow(),
  statut:      relanceStatutEnum('statut').notNull().default('envoye'),
});

// ─── Révisions de loyer ───────────────────────────────────────────────────
export const revisionsLoyer = pgTable('revisions_loyer', {
  id:             text('id').primaryKey(),
  bailId:         text('bail_id').notNull().references(() => baux.id, { onDelete: 'cascade' }),
  date:           date('date').notNull(),
  ancienLoyer:    integer('ancien_loyer').notNull(),
  nouveauLoyer:   integer('nouveau_loyer').notNull(),
  indiceIRL:      numeric('indice_irl', { precision: 8, scale: 2 }).notNull(),
  tauxVariation:  numeric('taux_variation', { precision: 5, scale: 2 }).notNull(),
  applique:       boolean('applique').notNull().default(false),
});

// ─── Charges locatives ────────────────────────────────────────────────────
export const chargesLocatives = pgTable('charges_locatives', {
  id:          text('id').primaryKey(),
  logementId:  text('logement_id').notNull().references(() => logements.id, { onDelete: 'cascade' }),
  periode:     text('periode').notNull(),  // YYYY
  typeCharge:  text('type_charge').notNull(),
  montantReel: integer('montant_reel').notNull(),
  justificatif: text('justificatif'),
});

// ─── Régularisations charges ──────────────────────────────────────────────
export const regularisations = pgTable('regularisations', {
  id:                text('id').primaryKey(),
  bailId:            text('bail_id').notNull().references(() => baux.id, { onDelete: 'cascade' }),
  periode:           text('periode').notNull(),
  provisionsPercues: integer('provisions_percues').notNull(),
  chargesReelles:    integer('charges_reelles').notNull(),
  solde:             integer('solde').notNull(),
  statut:            regChargesStatutEnum('statut').notNull().default('calculee'),
});

// ─── Dépenses ─────────────────────────────────────────────────────────────
export const depenses = pgTable('depenses', {
  id:              text('id').primaryKey(),
  logementId:      text('logement_id').notNull().references(() => logements.id),
  proprietaireId:  text('proprietaire_id').notNull().references(() => proprietaires.id),
  type:            depenseTypeEnum('type').notNull(),
  montant:         integer('montant').notNull(),
  description:     text('description').notNull(),
  date:            date('date').notNull(),
  justificatif:    text('justificatif'),
});

// ─── Reversements ─────────────────────────────────────────────────────────
export const reversements = pgTable('reversements', {
  id:                  text('id').primaryKey(),
  proprietaireId:      text('proprietaire_id').notNull().references(() => proprietaires.id),
  periode:             text('periode').notNull(),  // YYYY-MM
  totalLoyers:         integer('total_loyers').notNull(),
  totalCommission:     integer('total_commission').notNull(),
  totalDepenses:       integer('total_depenses').notNull().default(0),
  montantReverseNet:   integer('montant_reverse_net').notNull(),
  date:                date('date').notNull(),
  statut:              reversementStatutEnum('statut').notNull().default('en_attente'),
});

// ─── États des lieux ──────────────────────────────────────────────────────
export const etatsDesLieux = pgTable('etats_des_lieux', {
  id:                   text('id').primaryKey(),
  bailId:               text('bail_id').notNull().references(() => baux.id, { onDelete: 'cascade' }),
  type:                 edlTypeEnum('type').notNull(),
  date:                 date('date').notNull(),
  pieces:               jsonb('pieces').notNull().default([]),
  observations:         text('observations').notNull().default(''),
  signatureLocataire:   boolean('signature_locataire').notNull().default(false),
  signatureAgent:       boolean('signature_agent').notNull().default(false),
  createdAt:            timestamp('created_at').notNull().defaultNow(),
});

// ─── Maintenance ──────────────────────────────────────────────────────────
export const maintenances = pgTable('maintenances', {
  id:              text('id').primaryKey(),
  logementId:      text('logement_id').notNull().references(() => logements.id, { onDelete: 'cascade' }),
  titre:           text('titre').notNull(),
  description:     text('description').notNull(),
  statut:          maintenanceStatutEnum('statut').notNull().default('ouvert'),
  priorite:        maintenancePrioriteEnum('priorite').notNull().default('normale'),
  prestataire:     text('prestataire'),
  cout:            integer('cout'),
  dateSignalement: date('date_signalement').notNull(),
  dateResolution:  date('date_resolution'),
});
