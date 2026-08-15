import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { nanoid } from '../utils/id';

const router = Router();

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  nom:      z.string().min(1),
  prenom:   z.string().min(1),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['admin', 'gestionnaire']).optional(),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await db.select().from(users).where(eq(users.email, data.email));
    if (existing.length > 0) {
      res.status(409).json({ error: 'Email déjà utilisé' });
      return;
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    const [user] = await db.insert(users).values({
      id: nanoid(),
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      passwordHash,
      role: data.role ?? 'gestionnaire',
    }).returning();

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
    );
    res.status(201).json({
      token,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, data.email));
    if (!user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return;
    }
    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return;
    }
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions
    );
    res.json({
      token,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select({
      id: users.id, nom: users.nom, prenom: users.prenom,
      email: users.email, role: users.role, avatar: users.avatar,
    }).from(users).where(eq(users.id, req.userId!));
    if (!user) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
