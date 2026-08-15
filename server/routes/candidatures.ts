import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { candidatures } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

const schema = z.object({
  logementId: z.string().min(1),
  nom:        z.string().min(1),
  prenom:     z.string().min(1),
  email:      z.string().email(),
  telephone:  z.string().min(1),
  revenus:    z.number().int().positive(),
  employeur:  z.string().min(1),
  tauxEffort: z.number().min(0).max(100),
  garant:     z.object({ nom: z.string(), prenom: z.string(), revenus: z.number() }).optional(),
  statut:     z.enum(['en_attente', 'en_etude', 'acceptee', 'refusee']).default('en_attente'),
  notes:      z.string().optional(),
  documents:  z.array(z.string()).default([]),
});

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(candidatures).orderBy(candidatures.createdAt);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [row] = await db.select().from(candidatures).where(eq(candidatures.id, req.params.id));
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', async (req, res) => {
  try {
    const data = schema.parse(req.body);
    const [row] = await db.insert(candidatures).values({
      id: nanoid(), ...data, tauxEffort: String(data.tauxEffort),
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
    if (data.tauxEffort !== undefined) update.tauxEffort = String(data.tauxEffort);
    const [row] = await db.update(candidatures).set(update).where(eq(candidatures.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.delete(candidatures).where(eq(candidatures.id, req.params.id));
    res.status(204).end();
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

export default router;
