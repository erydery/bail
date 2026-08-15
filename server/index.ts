import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes          from './routes/auth';
import proprietairesRoutes from './routes/proprietaires';
import logementsRoutes     from './routes/logements';
import locatairesRoutes    from './routes/locataires';
import candidaturesRoutes  from './routes/candidatures';
import bauxRoutes          from './routes/baux';
import paiementsRoutes     from './routes/paiements';
import communicationsRoutes from './routes/communications';
import revisionsRoutes     from './routes/revisions';
import comptabiliteRoutes  from './routes/comptabilite';
import etatsDesLieuxRoutes from './routes/etatsDesLieux';
import maintenanceRoutes   from './routes/maintenance';
import dashboardRoutes     from './routes/dashboard';

const app  = express();
const PORT = Number(process.env.PORT ?? 3001);

// ── Middlewares ────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (ex: curl, Postman)
    if (!origin) return callback(null, true);
    // En dev, autoriser tous les localhost quel que soit le port
    if (origin.match(/^http:\/\/localhost(:\d+)?$/)) return callback(null, true);
    // En prod, utiliser FRONTEND_URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error(`CORS bloqué pour l'origine: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/dashboard',      dashboardRoutes);
app.use('/api/proprietaires',  proprietairesRoutes);
app.use('/api/logements',      logementsRoutes);
app.use('/api/locataires',     locatairesRoutes);
app.use('/api/candidatures',   candidaturesRoutes);
app.use('/api/baux',           bauxRoutes);
app.use('/api/paiements',      paiementsRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/revisions',      revisionsRoutes);
app.use('/api/comptabilite',   comptabiliteRoutes);
app.use('/api/etats-des-lieux', etatsDesLieuxRoutes);
app.use('/api/maintenance',    maintenanceRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur Simi Bail démarré sur http://localhost:${PORT}`);
  console.log(`   • API:    http://localhost:${PORT}/api`);
  console.log(`   • Health: http://localhost:${PORT}/api/health\n`);
});
