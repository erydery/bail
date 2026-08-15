import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { paiements } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  bailId:       z.string().min(1),
  moisConcerne: z.string().regex(/^\d{4}-\d{2}$/),
  montantDu:    z.number().int().positive(),
  montantPaye:  z.number().int().min(0).default(0),
  datePaiement: z.string().optional(),
  statut:       z.enum(['paye', 'partiel', 'en_retard', 'en_attente']).default('en_attente'),
  mode:         z.enum(['virement', 'cheque', 'especes', 'prelevement']).optional(),
  notes:        z.string().optional(),
});

router.get('/', async (req, res) => {
  try {
    const { bailId, mois } = req.query;
    let query = db.select().from(paiements);
    if (bailId) query = query.where(eq(paiements.bailId, bailId as string)) as typeof query;
    const rows = await query.orderBy(paiements.moisConcerne);
    const filtered = mois ? rows.filter(r => r.moisConcerne === mois) : rows;
    res.json(filtered);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [row] = await db.select().from(paiements).where(eq(paiements.id, req.params.id));
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', async (req, res) => {
  try {
    const data = schema.parse(req.body);
    // Calcul auto du statut selon montants
    let statut = data.statut;
    if (data.montantPaye >= data.montantDu) statut = 'paye';
    else if (data.montantPaye > 0) statut = 'partiel';
    else statut = 'en_attente';
    const [row] = await db.insert(paiements).values({ id: nanoid(), ...data, statut }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = schema.partial().parse(req.body);
    const [row] = await db.update(paiements).set(data).where(eq(paiements.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
