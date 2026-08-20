import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client';
import {
  logements, locataires, proprietaires, baux,
  paiements, candidatures, maintenances, revisionsLoyer,
} from '../db/schema';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ── Récupère un snapshot de la base pour le contexte ─────────────────────────
async function getDbSnapshot() {
  const [
    logementsRows,
    locatairesRows,
    proprietairesRows,
    bauxRows,
    paiementsRows,
    candidaturesRows,
    maintenancesRows,
    revisionsRows,
  ] = await Promise.all([
    db.select().from(logements),
    db.select().from(locataires),
    db.select().from(proprietaires),
    db.select().from(baux),
    db.select().from(paiements),
    db.select().from(candidatures),
    db.select().from(maintenances),
    db.select().from(revisionsLoyer),
  ]);

  const now = new Date();
  const moisCourant = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const logementsLibres  = logementsRows.filter(l => l.statut === 'libre').length;
  const logementsOccupes = logementsRows.filter(l => l.statut === 'occupe').length;
  const bauxActifs       = bauxRows.filter(b => b.statut === 'actif').length;
  const loyersRetard     = paiementsRows.filter(p => p.statut === 'en_retard' || p.statut === 'partiel').length;
  const paiementsMois    = paiementsRows.filter(p => p.moisConcerne === moisCourant);
  const totalEncaisse    = paiementsMois.reduce((s, p) => s + Number(p.montantPaye), 0);
  const ticketsOuverts   = maintenancesRows.filter(m => m.statut === 'ouvert' || m.statut === 'en_cours').length;
  const candidaturesEnCours = candidaturesRows.filter(c => c.statut === 'en_attente' || c.statut === 'en_etude').length;
  const revisionsEnAttente  = revisionsRows.filter(r => !r.applique).length;

  return `
=== DONNÉES SIMI BAIL (snapshot temps réel) ===

## Résumé global
- Logements totaux : ${logementsRows.length} (${logementsLibres} libres, ${logementsOccupes} occupés)
- Baux actifs : ${bauxActifs}
- Locataires : ${locatairesRows.length}
- Propriétaires : ${proprietairesRows.length}
- Loyers en retard : ${loyersRetard}
- Revenus encaissés ce mois : ${totalEncaisse.toLocaleString('fr-CM')} XAF
- Tickets maintenance ouverts : ${ticketsOuverts}
- Candidatures en cours : ${candidaturesEnCours}
- Révisions de loyer en attente : ${revisionsEnAttente}

## Logements
${logementsRows.map(l =>
  `- ${l.adresse}, ${l.ville} | ${l.type} | ${l.surface}m² | ${l.nbPieces}p | Loyer: ${l.loyer} XAF | Statut: ${l.statut}`
).join('\n')}

## Locataires
${locatairesRows.map(l =>
  `- ${l.prenom} ${l.nom} | ${l.email} | ${l.telephone}`
).join('\n')}

## Propriétaires
${proprietairesRows.map(p =>
  `- ${p.prenom} ${p.nom} | ${p.email} | Commission: ${p.commissionTaux}%`
).join('\n')}

## Baux actifs
${bauxRows.filter(b => b.statut === 'actif').map(b =>
  `- ID: ${b.id} | Logement: ${b.logementId} | Locataire: ${b.locataireId} | Loyer: ${b.loyer} XAF | Début: ${b.dateDebut}`
).join('\n')}

## Paiements en retard
${paiementsRows.filter(p => p.statut === 'en_retard' || p.statut === 'partiel').map(p =>
  `- Bail: ${p.bailId} | Mois: ${p.moisConcerne} | Dû: ${p.montantDu} | Payé: ${p.montantPaye} | Statut: ${p.statut}`
).join('\n') || 'Aucun'}

## Tickets maintenance ouverts
${maintenancesRows.filter(m => m.statut === 'ouvert' || m.statut === 'en_cours').map(m =>
  `- ${m.titre} | Logement: ${m.logementId} | Priorité: ${m.priorite} | Statut: ${m.statut}`
).join('\n') || 'Aucun'}

## Candidatures en cours
${candidaturesRows.filter(c => c.statut === 'en_attente' || c.statut === 'en_etude').map(c =>
  `- ${c.prenom} ${c.nom} | Logement: ${c.logementId} | Revenus: ${c.revenus} XAF | Statut: ${c.statut}`
).join('\n') || 'Aucune'}
`;
}

// ── POST /api/chat ────────────────────────────────────────────────────────────
const schema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  model: z.string().optional().default('google/gemini-2.5-flash'),
});

router.post('/', async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENROUTER_API_KEY non configurée' });
    return;
  }

  try {
    const { messages, model } = schema.parse(req.body);
    const dbContext = await getDbSnapshot();

    const systemPrompt = `Tu es l'assistant IA intégré de Simi Bail, une application de gestion locative pour les bailleurs camerounais.

Tu as accès aux données en temps réel de l'application :
${dbContext}

## Tes capacités
- Répondre aux questions sur les logements, locataires, baux, paiements, maintenance
- Analyser la situation financière (loyers en retard, taux d'occupation, revenus)
- Suggérer des actions (relances, révisions IRL, maintenance urgente)
- Expliquer le fonctionnement de chaque module de l'application
- Calculer des révisions de loyer basées sur l'IRL
- Identifier les risques (impayés, baux en préavis, tickets urgents)

## Règles
- Réponds toujours en français
- Sois concis et actionnable
- Si une information n'est pas dans les données, dis-le clairement
- Ne divulgue jamais les mots de passe ou tokens
- Format: utilise des listes et des chiffres pour les données numériques`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL ?? 'http://localhost:5173',
        'X-Title': 'Simi Bail',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: false,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      res.status(502).json({ error: 'Erreur OpenRouter', detail: err });
      return;
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content ?? '';
    res.json({ reply });
  } catch (e) {
    if (e instanceof z.ZodError) { res.status(400).json({ error: e.issues }); return; }
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
