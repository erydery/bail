import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { maintenances } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  logementId:      z.string().min(1),
  titre:           z.string().min(1),
  description:     z.string().min(1),
  statut:          z.enum(['ouvert', 'en_cours', 'resolu', 'annule']).default('ouvert'),
  priorite:        z.enum(['basse', 'normale', 'haute', 'urgente']).default('normale'),
  prestataire:     z.string().optional(),
  cout:            z.number().int().optional(),
  dateSignalement: z.string(),
  dateResolution:  z.string().optional(),
});

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(maintenances).orderBy(maintenances.dateSignalement);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [row] = await db.select().from(maintenances).where(eq(maintenances.id, req.params.id));
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', async (req, res) => {
  try {
    const data = schema.parse(req.body);
    const [row] = await db.insert(maintenances).values({ id: nanoid(), ...data }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = schema.partial().parse(req.body);
    const [row] = await db.update(maintenances).set(data).where(eq(maintenances.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.delete(maintenances).where(eq(maintenances.id, req.params.id));
    res.status(204).end();
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

export default router;
