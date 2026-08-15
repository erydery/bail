import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { etatsDesLieux } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

const pieceSchema = z.object({
  nom:          z.string(),
  etat:         z.enum(['bon', 'usage', 'degrade', 'manquant']),
  observations: z.string().default(''),
  photos:       z.array(z.string()).default([]),
});

const schema = z.object({
  bailId:             z.string().min(1),
  type:               z.enum(['entree', 'sortie']),
  date:               z.string(),
  pieces:             z.array(pieceSchema).default([]),
  observations:       z.string().default(''),
  signatureLocataire: z.boolean().default(false),
  signatureAgent:     z.boolean().default(false),
});

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(etatsDesLieux).orderBy(etatsDesLieux.date);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [row] = await db.select().from(etatsDesLieux).where(eq(etatsDesLieux.id, req.params.id));
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', async (req, res) => {
  try {
    const data = schema.parse(req.body);
    const [row] = await db.insert(etatsDesLieux).values({ id: nanoid(), ...data }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = schema.partial().parse(req.body);
    const [row] = await db.update(etatsDesLieux).set(data).where(eq(etatsDesLieux.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
