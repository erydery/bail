import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { logements } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  proprietaireId: z.string().min(1),
  adresse:        z.string().min(1),
  ville:          z.string().min(1),
  codePostal:     z.string().min(1),
  type:           z.enum(['appartement', 'maison', 'studio', 'local_commercial']),
  surface:        z.number().positive(),
  nbPieces:       z.number().int().positive(),
  statut:         z.enum(['libre', 'occupe', 'en_travaux']).default('libre'),
  loyer:          z.number().int().positive(),
  charges:        z.number().int().min(0).default(0),
  depotGarantie:  z.number().int().min(0).default(0),
  photos:         z.array(z.string()).default([]),
  description:    z.string().optional(),
});

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(logements).orderBy(logements.createdAt);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [row] = await db.select().from(logements).where(eq(logements.id, req.params.id));
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', async (req, res) => {
  try {
    const data = schema.parse(req.body);
    const [row] = await db.insert(logements).values({
      id: nanoid(), ...data, surface: String(data.surface),
    }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = schema.partial().parse(req.body);
    const update: Record<string, unknown> = { ...data };
    if (data.surface !== undefined) update.surface = String(data.surface);
    const [row] = await db.update(logements).set(update).where(eq(logements.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.delete(logements).where(eq(logements.id, req.params.id));
    res.status(204).end();
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

export default router;
