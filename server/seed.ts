import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './db/client';
import {
  users, proprietaires, logements, locataires, baux,
  paiements, candidatures, maintenances, etatsDesLieux,
  communications, relances, revisionsLoyer, chargesLocatives,
  regularisations, depenses, reversements,
} from './db/schema';

async function seed() {
  console.log('🌱 Démarrage du seed...');

  // ── Nettoyer dans l'ordre des dépendances ──────────────────────────────
  await db.delete(reversements);
  await db.delete(depenses);
  await db.delete(regularisations);
  await db.delete(chargesLocatives);
  await db.delete(revisionsLoyer);
  await db.delete(relances);
  await db.delete(communications);
  await db.delete(etatsDesLieux);
  await db.delete(maintenances);
  await db.delete(paiements);
  await db.delete(candidatures);
  await db.delete(baux);
  await db.delete(locataires);
  await db.delete(logements);
  await db.delete(proprietaires);
  await db.delete(users);
  console.log('  ✓ Tables vidées');

  // ── Users ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin1234', 12);
  await db.insert(users).values([
    { id: 'u1', nom: 'Mbarga', prenom: 'Jean-Pierre', email: 'admin@gestionlocative.com', passwordHash, role: 'admin' },
    { id: 'u2', nom: 'Ngo Bilong', prenom: 'Carine', email: 'gestionnaire@gestionlocative.com', passwordHash: await bcrypt.hash('gest1234', 12), role: 'gestionnaire' },
  ]);
  console.log('  ✓ Users créés  (admin@gestionlocative.com / admin1234)');

  // ── Propriétaires ──────────────────────────────────────────────────────
  await db.insert(proprietaires).values([
    { id: 'p1', nom: 'Tchamba', prenom: 'Paul', email: 'paul.tchamba@email.cm', telephone: '+237 677 12 34 56', adresse: '14 Rue de Nachtigal, Yaoundé', iban: 'CM21 1000 2000 0123 4567 8901 234', commissionTaux: '8' },
    { id: 'p2', nom: 'Nkodo', prenom: 'Élise', email: 'elise.nkodo@email.cm', telephone: '+237 699 87 65 43', adresse: '3 Avenue Charles de Gaulle, Douala', iban: 'CM21 1000 2000 9876 5432 1098 765', commissionTaux: '7' },
    { id: 'p3', nom: 'Bello', prenom: 'Hamidou', email: 'h.bello@email.cm', telephone: '+237 691 55 44 33', adresse: '27 Rue Ahmadou Ahidjo, Yaoundé', iban: 'CM21 1000 2000 1111 2222 3333 444', commissionTaux: '10' },
  ]);
  console.log('  ✓ Propriétaires');

  // ── Logements ──────────────────────────────────────────────────────────
  await db.insert(logements).values([
    { id: 'l1', proprietaireId: 'p1', adresse: '18 Rue de la Joie, Bastos', ville: 'Yaoundé', codePostal: 'BP 1234', type: 'appartement', surface: '90', nbPieces: 3, statut: 'occupe', loyer: 180000, charges: 20000, depotGarantie: 360000, photos: [] },
    { id: 'l2', proprietaireId: 'p1', adresse: '5 Résidence Mvog-Ada', ville: 'Yaoundé', codePostal: 'BP 2345', type: 'studio', surface: '38', nbPieces: 1, statut: 'libre', loyer: 75000, charges: 8000, depotGarantie: 150000, photos: [] },
    { id: 'l3', proprietaireId: 'p2', adresse: '42 Rue Joss, Akwa', ville: 'Douala', codePostal: 'BP 4056', type: 'appartement', surface: '110', nbPieces: 4, statut: 'occupe', loyer: 250000, charges: 30000, depotGarantie: 500000, photos: [] },
    { id: 'l4', proprietaireId: 'p2', adresse: '8 Quartier Ndokoti', ville: 'Douala', codePostal: 'BP 5678', type: 'maison', surface: '160', nbPieces: 5, statut: 'en_travaux', loyer: 350000, charges: 40000, depotGarantie: 700000, photos: [] },
    { id: 'l5', proprietaireId: 'p3', adresse: '11 Avenue Kennedy, Centre-ville', ville: 'Yaoundé', codePostal: 'BP 3210', type: 'local_commercial', surface: '130', nbPieces: 2, statut: 'occupe', loyer: 420000, charges: 50000, depotGarantie: 840000, photos: [] },
    { id: 'l6', proprietaireId: 'p3', adresse: '7 Rue Koloko, Biyem-Assi', ville: 'Yaoundé', codePostal: 'BP 6789', type: 'appartement', surface: '80', nbPieces: 3, statut: 'libre', loyer: 150000, charges: 15000, depotGarantie: 300000, photos: [] },
  ]);
  console.log('  ✓ Logements');

  // ── Locataires ─────────────────────────────────────────────────────────
  await db.insert(locataires).values([
    { id: 'loc1', nom: 'Owona', prenom: 'Serge', email: 'serge.owona@email.cm', telephone: '+237 677 22 33 44', adresse: '18 Rue de la Joie, Bastos, Yaoundé', dateNaissance: '1988-03-12', numeroPiece: 'CNI-CM-001234' },
    { id: 'loc2', nom: 'Ngono', prenom: 'Félicité', email: 'f.ngono@email.cm', telephone: '+237 699 44 55 66', adresse: '42 Rue Joss, Akwa, Douala', dateNaissance: '1991-09-25', numeroPiece: 'CNI-CM-005678', garant: { nom: 'Ngono', prenom: 'Bernard', telephone: '+237 691 88 77 66', email: 'bernard.ngono@email.cm' } },
    { id: 'loc3', nom: 'Fomekong', prenom: 'Rodrigue', email: 'r.fomekong@email.cm', telephone: '+237 655 11 22 33', adresse: '11 Avenue Kennedy, Yaoundé', dateNaissance: '1985-06-18', numeroPiece: 'CNI-CM-009012' },
  ]);
  console.log('  ✓ Locataires');

  // ── Baux ───────────────────────────────────────────────────────────────
  await db.insert(baux).values([
    { id: 'b1', logementId: 'l1', locataireId: 'loc1', type: 'nu', statut: 'actif', dateDebut: '2025-01-01', loyer: 180000, charges: 20000, depotGarantie: 360000, jourEcheance: 5 },
    { id: 'b2', logementId: 'l3', locataireId: 'loc2', type: 'meuble', statut: 'actif', dateDebut: '2025-03-01', loyer: 250000, charges: 30000, depotGarantie: 500000, jourEcheance: 1 },
    { id: 'b3', logementId: 'l5', locataireId: 'loc3', type: 'nu', statut: 'preavis', dateDebut: '2025-02-15', datePreavis: '2026-07-01', dateFin: '2026-08-15', loyer: 420000, charges: 50000, depotGarantie: 840000, jourEcheance: 10 },
  ]);
  console.log('  ✓ Baux');

  // ── Paiements ──────────────────────────────────────────────────────────
  await db.insert(paiements).values([
    // Bail b1 — Serge Owona
    { id: 'pay1', bailId: 'b1', moisConcerne: '2026-07', montantDu: 200000, montantPaye: 200000, datePaiement: '2026-07-04', statut: 'paye', mode: 'virement' },
    { id: 'pay2', bailId: 'b1', moisConcerne: '2026-06', montantDu: 200000, montantPaye: 200000, datePaiement: '2026-06-05', statut: 'paye', mode: 'virement' },
    { id: 'pay3', bailId: 'b1', moisConcerne: '2026-05', montantDu: 200000, montantPaye: 200000, datePaiement: '2026-05-03', statut: 'paye', mode: 'virement' },
    // Bail b2 — Félicité Ngono
    { id: 'pay4', bailId: 'b2', moisConcerne: '2026-07', montantDu: 280000, montantPaye: 0, statut: 'en_retard' },
    { id: 'pay5', bailId: 'b2', moisConcerne: '2026-06', montantDu: 280000, montantPaye: 280000, datePaiement: '2026-06-02', statut: 'paye', mode: 'cheque' },
    { id: 'pay6', bailId: 'b2', moisConcerne: '2026-05', montantDu: 280000, montantPaye: 140000, statut: 'partiel' },
    // Bail b3 — Rodrigue Fomekong
    { id: 'pay7', bailId: 'b3', moisConcerne: '2026-07', montantDu: 470000, montantPaye: 470000, datePaiement: '2026-07-09', statut: 'paye', mode: 'virement' },
    { id: 'pay8', bailId: 'b3', moisConcerne: '2026-06', montantDu: 470000, montantPaye: 470000, datePaiement: '2026-06-10', statut: 'paye', mode: 'virement' },
  ]);
  console.log('  ✓ Paiements');

  // ── Candidatures ───────────────────────────────────────────────────────
  await db.insert(candidatures).values([
    { id: 'c1', logementId: 'l2', nom: 'Atangana', prenom: 'Kevin', email: 'k.atangana@email.cm', telephone: '+237 677 30 40 50', revenus: 250000, employeur: 'Ministère des Finances', tauxEffort: '32', statut: 'en_etude', documents: ['cni.pdf', 'fiche_salaire.pdf'] },
    { id: 'c2', logementId: 'l6', nom: 'Mbassi', prenom: 'Laure', email: 'l.mbassi@email.cm', telephone: '+237 699 60 70 80', revenus: 500000, employeur: 'Société Générale Cameroun', tauxEffort: '31', statut: 'en_attente', documents: ['cni.pdf'] },
    { id: 'c3', logementId: 'l2', nom: 'Essama', prenom: 'Bruno', email: 'b.essama@email.cm', telephone: '+237 655 90 80 70', revenus: 180000, employeur: 'Auto-entrepreneur', tauxEffort: '46', statut: 'refusee', notes: "Taux d'effort trop élevé", documents: [] },
  ]);
  console.log('  ✓ Candidatures');

  // ── Maintenance ────────────────────────────────────────────────────────
  await db.insert(maintenances).values([
    { id: 'm1', logementId: 'l1', titre: 'Fuite tuyauterie salle de bain', description: 'Fuite importante sous le lavabo', statut: 'en_cours', priorite: 'haute', prestataire: 'Plomberie Rapid Yaoundé', cout: 45000, dateSignalement: '2026-07-02' },
    { id: 'm2', logementId: 'l3', titre: 'Climatiseur en panne', description: "Le climatiseur du salon ne refroidit plus", statut: 'ouvert', priorite: 'urgente', dateSignalement: '2026-07-10' },
    { id: 'm3', logementId: 'l5', titre: 'Remplacement serrure portail', description: 'Serrure forcée, à changer', statut: 'resolu', priorite: 'haute', prestataire: 'Menuiserie Centrale', cout: 30000, dateSignalement: '2026-06-15', dateResolution: '2026-06-17' },
    { id: 'm4', logementId: 'l4', titre: 'Travaux toiture', description: 'Infiltrations eau de pluie au plafond', statut: 'en_cours', priorite: 'urgente', prestataire: 'BTP Cameroun SARL', cout: 380000, dateSignalement: '2026-05-20' },
  ]);
  console.log('  ✓ Maintenance');

  // ── Communications & Relances ──────────────────────────────────────────
  await db.insert(communications).values([
    { id: 'com1', type: 'quittance', canal: 'email', locataireId: 'loc1', paiementId: 'pay1', statut: 'envoye', objet: 'Quittance Juillet 2026' },
    { id: 'com2', type: 'quittance', canal: 'email', locataireId: 'loc2', paiementId: 'pay5', statut: 'envoye', objet: 'Quittance Juin 2026' },
    { id: 'com3', type: 'relance', canal: 'email', locataireId: 'loc2', paiementId: 'pay4', statut: 'envoye', objet: 'Rappel loyer Juillet 2026 — impayé' },
    { id: 'com4', type: 'relance', canal: 'sms', locataireId: 'loc2', paiementId: 'pay6', statut: 'envoye', objet: 'Rappel loyer partiel Mai 2026' },
    { id: 'com5', type: 'quittance', canal: 'email', locataireId: 'loc3', paiementId: 'pay7', statut: 'envoye', objet: 'Quittance Juillet 2026' },
  ]);
  await db.insert(relances).values([
    { id: 'rel1', paiementId: 'pay4', palier: 'rappel_amical', statut: 'envoye' },
    { id: 'rel2', paiementId: 'pay6', palier: 'rappel_amical', statut: 'envoye' },
  ]);
  console.log('  ✓ Communications & Relances');

  // ── Révisions & Charges ────────────────────────────────────────────────
  await db.insert(revisionsLoyer).values([
    { id: 'rev1', bailId: 'b1', date: '2026-01-01', ancienLoyer: 170000, nouveauLoyer: 180000, indiceIRL: '138.50', tauxVariation: '5.88', applique: true },
    { id: 'rev2', bailId: 'b2', date: '2026-03-01', ancienLoyer: 235000, nouveauLoyer: 250000, indiceIRL: '138.50', tauxVariation: '6.38', applique: true },
  ]);
  await db.insert(chargesLocatives).values([
    { id: 'ch1', logementId: 'l1', periode: '2025', typeCharge: 'Eau (SNEC)', montantReel: 96000 },
    { id: 'ch2', logementId: 'l1', periode: '2025', typeCharge: 'Gardiennage', montantReel: 60000 },
    { id: 'ch3', logementId: 'l3', periode: '2025', typeCharge: 'Eau (SNEC)', montantReel: 132000 },
    { id: 'ch4', logementId: 'l3', periode: '2025', typeCharge: 'Électricité parties communes', montantReel: 84000 },
  ]);
  await db.insert(regularisations).values([
    { id: 'reg1', bailId: 'b1', periode: '2025', provisionsPercues: 240000, chargesReelles: 210000, solde: 30000, statut: 'reglee' },
    { id: 'reg2', bailId: 'b2', periode: '2025', provisionsPercues: 360000, chargesReelles: 390000, solde: -30000, statut: 'envoyee' },
  ]);
  console.log('  ✓ Révisions & Charges');

  // ── Dépenses & Reversements ────────────────────────────────────────────
  await db.insert(depenses).values([
    { id: 'd1', logementId: 'l4', proprietaireId: 'p2', type: 'travaux', montant: 380000, description: 'Réparation toiture — infiltrations', date: '2026-05-25' },
    { id: 'd2', logementId: 'l1', proprietaireId: 'p1', type: 'charge_avancee', montant: 96000, description: 'Facture eau SNEC avancée', date: '2026-06-18' },
    { id: 'd3', logementId: 'l5', proprietaireId: 'p3', type: 'travaux', montant: 30000, description: 'Remplacement serrure portail', date: '2026-06-17' },
  ]);
  await db.insert(reversements).values([
    { id: 'rv1', proprietaireId: 'p1', periode: '2026-06', totalLoyers: 200000, totalCommission: 16000, totalDepenses: 96000, montantReverseNet: 88000, date: '2026-07-05', statut: 'vire' },
    { id: 'rv2', proprietaireId: 'p2', periode: '2026-06', totalLoyers: 280000, totalCommission: 19600, totalDepenses: 0, montantReverseNet: 260400, date: '2026-07-05', statut: 'vire' },
    { id: 'rv3', proprietaireId: 'p3', periode: '2026-06', totalLoyers: 470000, totalCommission: 47000, totalDepenses: 30000, montantReverseNet: 393000, date: '2026-07-05', statut: 'vire' },
  ]);
  console.log('  ✓ Dépenses & Reversements');

  // ── États des lieux ────────────────────────────────────────────────────
  await db.insert(etatsDesLieux).values([
    {
      id: 'edl1', bailId: 'b1', type: 'entree', date: '2025-01-01',
      pieces: [
        { nom: 'Salon', etat: 'bon', observations: 'Peinture récente, carrelage intact', photos: [] },
        { nom: 'Chambre principale', etat: 'bon', observations: 'RAS', photos: [] },
        { nom: 'Chambre 2', etat: 'bon', observations: 'RAS', photos: [] },
        { nom: 'Cuisine', etat: 'bon', observations: 'Équipements fonctionnels', photos: [] },
        { nom: 'Salle de bain', etat: 'bon', observations: 'RAS', photos: [] },
      ],
      observations: 'Logement en bon état général à la remise des clés.',
      signatureLocataire: true,
      signatureAgent: true,
    },
    {
      id: 'edl2', bailId: 'b2', type: 'entree', date: '2025-03-01',
      pieces: [
        { nom: 'Salon', etat: 'bon', observations: 'Meublé, TV incluse', photos: [] },
        { nom: 'Chambre 1', etat: 'bon', observations: 'Lit double fourni', photos: [] },
        { nom: 'Chambre 2', etat: 'usage', observations: 'Légère usure moquette', photos: [] },
        { nom: 'Cuisine équipée', etat: 'bon', observations: 'Réfrigérateur et cuisinière en état', photos: [] },
      ],
      observations: 'Quelques usures normales sur la moquette chambre 2.',
      signatureLocataire: true,
      signatureAgent: true,
    },
  ]);
  console.log('  ✓ États des lieux');

  console.log('\n✅ Seed terminé avec succès !');
  console.log('   Connexion : admin@gestionlocative.com / admin1234');
  process.exit(0);
}

seed().catch(e => { console.error('❌ Seed échoué:', e); process.exit(1); });
