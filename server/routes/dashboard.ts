import { Router } from 'express';
import { eq, and, gte, lt, count, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  logements, baux, paiements, maintenances, revisionsLoyer
} from '../db/schema';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/stats', async (_req, res) => {
  try {
    const now = new Date();
    const moisCourant = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    // Logements
    const tousLogements = await db.select().from(logements);
    const logementsTotaux = tousLogements.length;
    const logementsLibres = tousLogements.filter(l => l.statut === 'libre').length;
    const logementsOccupes = tousLogements.filter(l => l.statut === 'occupe').length;
    const tauxOccupation = logementsTotaux > 0 ? Math.round((logementsOccupes / logementsTotaux) * 100) : 0;

    // Paiements du mois courant
    const paiementsMois = await db.select().from(paiements).where(eq(paiements.moisConcerne, moisCourant));
    const loyersEnRetard = paiementsMois.filter(p => p.statut === 'en_retard' || p.statut === 'partiel').length;
    const loyersMontantRetard = paiementsMois
      .filter(p => p.statut === 'en_retard' || p.statut === 'partiel')
      .reduce((s, p) => s + (p.montantDu - p.montantPaye), 0);
    const revenusEncaissesMois = paiementsMois.reduce((s, p) => s + p.montantPaye, 0);

    // Baux à échéance dans 30 jours
    const tousLessBaux = await db.select().from(baux).where(eq(baux.statut, 'actif'));
    const bauxEcheance30j = tousLessBaux.filter(b => {
      if (!b.dateFin) return false;
      const fin = new Date(b.dateFin);
      return fin >= now && fin <= in30Days;
    }).length;

    // Révisions à faire (bail actif sans révision récente)
    const revisionsNonAppliquees = await db.select().from(revisionsLoyer).where(eq(revisionsLoyer.applique, false));
    const revisionsAFaire = revisionsNonAppliquees.length;

    // Tickets maintenance ouverts
    const ticketsMaintenance = await db.select({ count: count() }).from(maintenances)
      .where(sql`${maintenances.statut} IN ('ouvert', 'en_cours')`);
    const nbTickets = ticketsMaintenance[0]?.count ?? 0;

    res.json({
      logementsTotaux,
      logementsLibres,
      logementsOccupes,
      tauxOccupation,
      loyersEnRetard,
      loyersMontantRetard,
      revenusEncaissesMois,
      bauxEcheance30j,
      revisionsAFaire,
      ticketsMaintenance: Number(nbTickets),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
