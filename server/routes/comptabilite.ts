import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { depenses, reversements } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

// Dépenses
router.get('/depenses', async (_req, res) => {
  try {
    const rows = await db.select().from(depenses).orderBy(depenses.date);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/depenses', async (req, res) => {
  try {
    const schema = z.object({
      logementId:     z.string().min(1),
      proprietaireId: z.string().min(1),
      type:           z.enum(['travaux', 'charge_avancee', 'frais_gestion', 'autre']),
      montant:        z.number().int().positive(),
      description:    z.string().min(1),
      date:           z.string(),
      justificatif:   z.string().optional(),
    });
    const data = schema.parse(req.body);
    const [row] = await db.insert(depenses).values({ id: nanoid(), ...data }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Reversements
router.get('/reversements', async (_req, res) => {
  try {
    const rows = await db.select().from(reversements).orderBy(reversements.date);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/reversements', async (req, res) => {
  try {
    const schema = z.object({
      proprietaireId:    z.string().min(1),
      periode:           z.string(),
      totalLoyers:       z.number().int(),
      totalCommission:   z.number().int(),
      totalDepenses:     z.number().int().default(0),
      montantReverseNet: z.number().int(),
      date:              z.string(),
      statut:            z.enum(['en_attente', 'vire', 'annule']).default('en_attente'),
    });
    const data = schema.parse(req.body);
    const [row] = await db.insert(reversements).values({ id: nanoid(), ...data }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/reversements/:id', async (req, res) => {
  try {
    const schema = z.object({ statut: z.enum(['en_attente', 'vire', 'annule']) });
    const { statut } = schema.parse(req.body);
    const [row] = await db.update(reversements).set({ statut }).where(eq(reversements.id, req.params.id)).returning();
    if (!row) { res.status(404).json({ error: 'Introuvable' }); return; }
    res.json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
