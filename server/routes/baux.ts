import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { baux } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  logementId:    z.string().min(1),
  locataireId:   z.string().min(1),
  type:          z.enum(['nu', 'meuble']),
  statut:        z.enum(['actif', 'expire', 'resilie', 'preavis']).default('actif'),
  dateDebut:     z.string(),
  dateFin:       z.string().optional(),
  datePreavis:   z.string().optional(),
  loyer:         z.number().int().positive(),
  charges:       z.number().int().min(0).default(0),
  depotGarantie: z.number().int().min(0).default(0),
  jourEcheance:  z.number().int().min(1).max(28).default(5),
  indexIRL:      z.number().optional(),
});

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(baux).orderBy(baux.createdAt);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [row] = await db.select().from(baux).where(eq(baux.id, req.params.id));
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', async (req, res) => {
  try {
    const data = schema.parse(req.body);
    const [row] = await db.insert(baux).values({
      id: nanoid(), ...data,
      indexIRL: data.indexIRL !== undefined ? String(data.indexIRL) : undefined,
    }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = schema.partial().parse(req.body);
    const update: Record<string, unknown> = { ...data };
    if (data.indexIRL !== undefined) update.indexIRL = String(data.indexIRL);
    const [row] = await db.update(baux).set(update).where(eq(baux.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.delete(baux).where(eq(baux.id, req.params.id));
    res.status(204).end();
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

export default router;
