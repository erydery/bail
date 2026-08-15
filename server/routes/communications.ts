import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client';
import { communications, relances } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  try {
    const rows = await db.select().from(communications).orderBy(communications.date);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', async (req, res) => {
  try {
    const schema = z.object({
      type:        z.enum(['quittance', 'relance', 'notification']),
      canal:       z.enum(['email', 'sms']),
      locataireId: z.string().min(1),
      paiementId:  z.string().optional(),
      objet:       z.string().min(1),
      statut:      z.enum(['envoye', 'echec', 'en_attente']).default('en_attente'),
    });
    const data = schema.parse(req.body);
    const [row] = await db.insert(communications).values({ id: nanoid(), ...data }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/relances', async (_req, res) => {
  try {
    const rows = await db.select().from(relances).orderBy(relances.dateEnvoi);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/relances', async (req, res) => {
  try {
    const schema = z.object({
      paiementId: z.string().min(1),
      palier:     z.enum(['rappel_amical', 'mise_en_demeure', 'contentieux']),
      statut:     z.enum(['envoye', 'echec']).default('envoye'),
    });
    const data = schema.parse(req.body);
    const [row] = await db.insert(relances).values({ id: nanoid(), ...data }).returning();
    res.status(201).json(row);
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
