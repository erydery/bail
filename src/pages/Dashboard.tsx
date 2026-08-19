import { useState } from 'react';
import { AlertTriangle, Building2, TrendingUp, Wrench, Clock, CreditCard, Home, Users, ArrowRight, CheckCircle, User } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';

import { SkeletonStatCards, SkeletonCard, SkeletonPageHeader } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { dashboardApi, bauxApi, paiementsApi, logementsApi, candidaturesApi, maintenanceApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { Bail, Paiement, Logement, Candidature, Maintenance } from '../types';

const periods = ["Aujourd'hui", 'Cette semaine', 'Ce mois', 'Cette année'];

export default function Dashboard() {
  const [period, setPeriod] = useState(1);
  const [perfTab, setPerfTab] = useState<'logements' | 'Travaux' | 'baux'>('logements');

  const { data: stats, loading }  = useApi<Record<string, number> | null>(dashboardApi.stats, null);
  const { data: allBaux }         = useApi<Bail[]>(bauxApi.list, []);
  const { data: allPaiements }    = useApi<Paiement[]>(paiementsApi.list, []);
  const { data: allLogements }    = useApi<Logement[]>(logementsApi.list, []);
  const { data: allCandidatures } = useApi<Candidature[]>(candidaturesApi.list, []);
  const { data: allMaintenance }  = useApi<Maintenance[]>(maintenanceApi.list, []);

  const loyersRetard = (allPaiements ?? []).filter((p: any) => p.statut === 'en_retard' || p.statut === 'partiel');
  const ticketsOuverts = (allMaintenance ?? []).filter((m: any) => m.statut === 'ouvert' || m.statut === 'en_cours');
  const candidaturesEnCours = (allCandidatures ?? []).filter((c: any) => c.statut === 'en_attente' || c.statut === 'en_etude');

  const s = stats ?? {
    revenusEncaissesMois: 0, loyersEnRetard: 0, loyersMontantRetard: 0,
    tauxOccupation: 0, logementsTotaux: 0, logementsOccupes: 0,
    ticketsMaintenance: 0, logementsLibres: 0, bauxEcheance30j: 0, revisionsAFaire: 0,
  };

  return (
    <div>
      {loading ? (
        <>
          <SkeletonPageHeader />
          <SkeletonStatCards count={8} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <SkeletonCard lines={4} height="220px" />
              <SkeletonCard lines={5} height="240px" />
            </div>
            <div className="flex flex-col gap-4">
              <SkeletonCard lines={4} height="200px" />
              <SkeletonCard lines={3} height="160px" />
            </div>
          </div>
        </>
      ) : (
      <>
      <PageHeader title="Bienvenue !" breadcrumb="Dashboard"
       
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {periods.map((p, i) => (
          <button key={p} onClick={() => setPeriod(i)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={period === i
              ? { background: 'var(--color-primary)', color: 'var(--color-primary-content)', border: '1px solid var(--color-primary)' }
              : { background: 'transparent', color: 'var(--color-base-content)', opacity: 0.6, border: '1px solid var(--color-base-300)' }
            }
          >{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenus encaissés" value={formatMontant(s.revenusEncaissesMois)} unit="Ce mois" icon={<CreditCard size={20} />} trend={{ value: '+12%', positive: true }} accentColor="#e85d04" />
        <StatCard label="Loyers en retard"  value={s.loyersEnRetard} unit={formatMontant(s.loyersMontantRetard) + ' impayés'} icon={<AlertTriangle size={20} />} trend={{ value: '+1', positive: false }} accentColor="#ef4444" />
        <StatCard label="Taux d'occupation" value={s.tauxOccupation + '%'} unit={`${s.logementsOccupes ?? 0}/${s.logementsTotaux} logements`} icon={<Building2 size={20} />} accentColor="#3b82f6" />
        <StatCard label="Tickets maintenance" value={s.ticketsMaintenance} unit="En cours" icon={<Wrench size={20} />} accentColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Logements libres"  value={s.logementsLibres}  unit="Disponibles"       icon={<Home size={20} />}        accentColor="#22c55e" />
        <StatCard label="Baux à échéance"   value={s.bauxEcheance30j} unit="Dans 30 jours"     icon={<Clock size={20} />}       accentColor="#f59e0b" />
        <StatCard label="Révisions à faire" value={s.revisionsAFaire} unit="Indice IRL dispo." icon={<TrendingUp size={20} />}  accentColor="#a855f7" />
        <StatCard label="Candidatures"      value={candidaturesEnCours.length} unit="En cours" icon={<Users size={20} />}       accentColor="#06b6d4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold" style={{ color: 'var(--color-base-content)' }}>Insights & Recommandations</h2>
              <ArrowRight size={16} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="flex flex-col gap-4">
              {loyersRetard.length === 0 && ticketsOuverts.length === 0 ? (
                <div className="flex items-center gap-3 py-4">
                  <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                  <span style={{ color: 'var(--color-base-content)', opacity: 0.6 }}>Tout est à jour</span>
                </div>
              ) : (
                <>
                  {(loyersRetard as any[]).map((p: any) => (
                    <div key={p.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-error)', color: 'var(--color-error-content)' }}>
                        <AlertTriangle size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: 'var(--color-base-content)' }}>Loyer en retard — bail {p.bailId}</div>
                        <div className="text-xs" style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>Voir le paiement →</div>
                      </div>
                      <div className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>{formatMontant(p.montantDu - p.montantPaye)}</div>
                    </div>
                  ))}
                  {(candidaturesEnCours as any[]).slice(0, 2).map((c: any) => (
                    <div key={c.id} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-info)', color: 'var(--color-info-content)' }}>
                        <User size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: 'var(--color-base-content)' }}>Candidature : {c.prenom} {c.nom}</div>
                        <div className="text-xs" style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>Voir le dossier →</div>
                      </div>
                      <Badge label={c.statut === 'en_etude' ? 'En étude' : 'En attente'} variant={c.statut === 'en_etude' ? 'info' : 'warning'} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: 'var(--color-base-content)' }}>Logements</h2>
            </div>
            <div className="flex flex-col gap-2">
              {(allLogements ?? []).map((l: any) => (
                <div key={l.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--color-base-300)' }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-base-content)' }}>{l.adresse}</div>
                    <div className="text-xs" style={{ color: 'var(--color-base-content)', opacity: 0.4 }}>{l.surface}m² · {l.nbPieces}p</div>
                  </div>
                  <Badge label={l.statut === 'occupe' ? 'Occupé' : l.statut === 'libre' ? 'Libre' : 'Travaux'} variant={l.statut === 'occupe' ? 'success' : l.statut === 'libre' ? 'info' : 'warning'} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {/* Top Performances */}
          <Card>
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--color-base-content)' }}>Top Performances</h2>
            <div className="flex rounded-xl p-1 mb-4" style={{ background: 'var(--color-base-300)' }}>
              {(['logements', 'Travaux', 'baux'] as const).map(tab => (
                <button key={tab} onClick={() => setPerfTab(tab)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={perfTab === tab
                    ? { background: 'var(--color-base-200)', color: 'var(--color-base-content)' }
                    : { background: 'transparent', color: 'var(--color-base-content)', opacity: 0.5 }
                  }
                >
                  {tab === 'logements' ? 'Logements' : tab === 'Travaux' ? 'Travaux' : 'Baux'}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {perfTab === 'logements' && (allLogements ?? []).slice(0, 4).map((l: any, i: number) => (
                <div key={l.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: i === 0 ? 'var(--color-primary)' : 'var(--color-base-300)', color: i === 0 ? 'var(--color-primary-content)' : 'var(--color-base-content)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-base-content)' }}>{l.adresse}</div>
                    <div className="text-xs" style={{ color: 'var(--color-base-content)', opacity: 0.45 }}>{l.surface}m² · {l.nbPieces}p</div>
                  </div>
                  <div className="text-sm font-bold shrink-0" style={{ color: 'var(--color-primary)' }}>{formatMontant(l.loyer)}</div>
                </div>
              ))}
              {perfTab === 'baux' && (allBaux ?? []).slice(0, 4).map((b: any, i: number) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: i === 0 ? 'var(--color-primary)' : 'var(--color-base-300)', color: i === 0 ? 'var(--color-primary-content)' : 'var(--color-base-content)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-base-content)' }}>Bail {b.id}</div>
                    <div className="text-xs" style={{ color: 'var(--color-base-content)', opacity: 0.45 }}>Depuis le {formatDate(b.dateDebut)}</div>
                  </div>
                  <div className="text-sm font-bold shrink-0" style={{ color: 'var(--color-primary)' }}>{formatMontant(b.loyer + b.charges)}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Maintenance */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-base-content)' }}>Maintenance</h2>
              <Badge label={`${ticketsOuverts.length} ouverts`} variant="warning" />
            </div>
            <div className="flex flex-col gap-2">
              {(ticketsOuverts as any[]).slice(0, 4).map((m: any) => (
                <div key={m.id} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--color-base-300)' }}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0`}
                    style={{ background: m.priorite === 'urgente' ? 'var(--color-error)' : m.priorite === 'haute' ? 'var(--color-warning)' : 'var(--color-info)' }}
                  />
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-base-content)' }}>{m.titre}</div>
                    <div className="text-xs" style={{ color: 'var(--color-base-content)', opacity: 0.4 }}>{formatDate(m.dateSignalement)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
