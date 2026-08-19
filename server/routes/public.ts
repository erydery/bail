import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { logements, candidatures, proprietaires } from '../db/schema';
import { nanoid } from '../utils/id';

const router = Router();

// ── Helper : enrichit un logement avec les infos de contact du propriétaire ──
async function withProprietaire(rows: typeof logements.$inferSelect[]) {
  if (rows.length === 0) return [];
  const propIds = [...new Set(rows.map(r => r.proprietaireId))];
  const props = await db
    .select({
      id:        proprietaires.id,
      nom:       proprietaires.nom,
      prenom:    proprietaires.prenom,
      email:     proprietaires.email,
      telephone: proprietaires.telephone,
    })
    .from(proprietaires)
    .where(eq(proprietaires.id, propIds[0])); // on boucle ci-dessous

  // Pour plusieurs propriétaires on fait une map
  const allProps = await Promise.all(
    propIds.map(id =>
      db.select({
        id:        proprietaires.id,
        nom:       proprietaires.nom,
        prenom:    proprietaires.prenom,
        email:     proprietaires.email,
        telephone: proprietaires.telephone,
      })
      .from(proprietaires)
      .where(eq(proprietaires.id, id))
      .then(r => r[0])
    )
  );
  const propMap = Object.fromEntries(allProps.filter(Boolean).map(p => [p.id, p]));

  return rows.map(l => ({
    ...l,
    proprietaire: propMap[l.proprietaireId] ?? null,
  }));
}

// ── GET /api/public/logements — logements libres uniquement ──────────────────
router.get('/logements', async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(logements)
      .where(eq(logements.statut, 'libre'))
      .orderBy(logements.createdAt);
    const enriched = await withProprietaire(rows);
    res.json(enriched);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── GET /api/public/logements/:id ────────────────────────────────────────────
router.get('/logements/:id', async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(logements)
      .where(eq(logements.id, req.params.id));
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    const [enriched] = await withProprietaire([row]);
    res.json(enriched);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── POST /api/public/candidatures — sans auth ────────────────────────────────
const candidatureSchema = z.object({
  logementId: z.string().min(1),
  nom:        z.string().min(1),
  prenom:     z.string().min(1),
  email:      z.string().email(),
  telephone:  z.string().min(1),
  revenus:    z.number().int().positive(),
  employeur:  z.string().min(1),
  garant: z.object({
    nom:     z.string(),
    prenom:  z.string(),
    revenus: z.number(),
  }).optional(),
  notes: z.string().optional(),
});

router.post('/candidatures', async (req, res) => {
  try {
    const data = candidatureSchema.parse(req.body);
    const tauxEffort = Math.round((data.revenus > 0
      ? 0 // sera calculé côté admin à partir du loyer
      : 0));
    const [row] = await db
      .insert(candidatures)
      .values({
        id:         nanoid(),
        logementId: data.logementId,
        nom:        data.nom,
        prenom:     data.prenom,
        email:      data.email,
        telephone:  data.telephone,
        revenus:    data.revenus,
        employeur:  data.employeur,
        tauxEffort: String(tauxEffort),
        garant:     data.garant ?? null,
        statut:     'en_attente',
        notes:      data.notes ?? null,
        documents:  [],
      })
      .returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
