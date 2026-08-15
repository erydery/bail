import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { revisionsLoyer, chargesLocatives, regularisations } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

// Révisions de loyer
router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(revisionsLoyer).orderBy(revisionsLoyer.date);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', async (req, res) => {
  try {
    const schema = z.object({
      bailId:        z.string().min(1),
      date:          z.string(),
      ancienLoyer:   z.number().int(),
      nouveauLoyer:  z.number().int(),
      indiceIRL:     z.number(),
      tauxVariation: z.number(),
      applique:      z.boolean().default(false),
    });
    const data = schema.parse(req.body);
    const [row] = await db.insert(revisionsLoyer).values({
      id: nanoid(), ...data,
      indiceIRL: String(data.indiceIRL),
      tauxVariation: String(data.tauxVariation),
    }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Charges locatives
router.get('/charges', async (_req, res) => {
  try {
    const rows = await db.select().from(chargesLocatives);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/charges', async (req, res) => {
  try {
    const schema = z.object({
      logementId:  z.string().min(1),
      periode:     z.string(),
      typeCharge:  z.string().min(1),
      montantReel: z.number().int(),
    });
    const data = schema.parse(req.body);
    const [row] = await db.insert(chargesLocatives).values({ id: nanoid(), ...data }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Régularisations
router.get('/regularisations', async (_req, res) => {
  try {
    const rows = await db.select().from(regularisations);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/regularisations', async (req, res) => {
  try {
    const schema = z.object({
      bailId:            z.string().min(1),
      periode:           z.string(),
      provisionsPercues: z.number().int(),
      chargesReelles:    z.number().int(),
      solde:             z.number().int(),
      statut:            z.enum(['calculee', 'envoyee', 'reglee']).default('calculee'),
    });
    const data = schema.parse(req.body);
    const [row] = await db.insert(regularisations).values({ id: nanoid(), ...data }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.errors }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
