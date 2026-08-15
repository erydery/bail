import { useState } from 'react';
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StatCard from '../components/ui/StatCard';
import { SkeletonPageHeader, SkeletonStatCards, SkeletonTable } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { comptabiliteApi, proprietairesApi, logementsApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { Depense, Reversement, Proprietaire, Logement } from '../types';

export default function Comptabilite() {
  const [activeTab, setActiveTab] = useState<'reversements' | 'depenses' | 'commissions'>('reversements');
  const [showDepenseModal, setShowDepenseModal] = useState(false);
  const [form, setForm] = useState({
    logementId: '', type: 'travaux', description: '', montant: '', date: '',
  });

  const { data: depenses, refetch: refetchDepenses } = useApi<Depense[]>(comptabiliteApi.listDepenses, []);
  const { data: reversements, loading } = useApi<Reversement[]>(comptabiliteApi.listReversements, []);
  const { data: proprietaires } = useApi<Proprietaire[]>(proprietairesApi.list, []);
  const { data: allLogements } = useApi<Logement[]>(logementsApi.list, []);

  const getProprietaire = (id: string) => proprietaires.find(p => p.id === id);
  const getLogement = (id: string) => allLogements.find(l => l.id === id);

  const totalReverse = reversements.reduce((s, r) => s + r.montantReverseNet, 0);
  const totalCommissions = reversements.reduce((s, r) => s + r.totalCommission, 0);
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);

  const handleCreate = async () => {
    const logement = getLogement(form.logementId);
    if (!logement) return;
    await comptabiliteApi.createDepense({
      ...form,
      montant: Number(form.montant),
      proprietaireId: logement.proprietaireId,
    });
    refetchDepenses();
    setShowDepenseModal(false);
  };

  return (
    <div>
      {loading ? (
        <>
          <SkeletonPageHeader />
          <SkeletonStatCards count={4} />
          <div className="flex gap-2 mb-6">
            {[1,2,3].map(i => <div key={i} className="h-8 w-28 rounded-xl animate-pulse" style={{ background: 'var(--color-base-300)' }} />)}
          </div>
          <SkeletonTable rows={6} cols={7} />
        </>
      ) : (
      <>
      <PageHeader
        title="Comptabilité"
        subtitle="Dépenses, commissions et reversements propriétaires"
        action={
          <Button icon={<Plus size={16} />} onClick={() => setShowDepenseModal(true)}>
            Saisir dépense
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Reversé ce mois" value={formatMontant(totalReverse)} icon={<TrendingUp size={20} />} accentColor="#22c55e" />
        <StatCard label="Commissions perçues" value={formatMontant(totalCommissions)} icon={<Percent size={20} />} accentColor="#e85d04" />
        <StatCard label="Dépenses engagées" value={formatMontant(totalDepenses)} icon={<TrendingDown size={20} />} accentColor="#ef4444" />
        <StatCard label="Résultat net agence" value={formatMontant(totalCommissions - totalDepenses)} icon={<DollarSign size={20} />} accentColor="#3b82f6" />
      </div>

      <div className="flex gap-2 mb-6">
        {(['reversements', 'depenses', 'commissions'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={activeTab === t ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}>
            {t === 'reversements' ? 'Reversements' : t === 'depenses' ? 'Dépenses' : 'Commissions'}
          </button>
        ))}
      </div>

      {activeTab === 'reversements' && (
        reversements.length === 0
          ? <div className="text-center py-20 text-base-content/40">Aucun reversement</div>
          : <Table<Reversement>
              columns={[
                {
                  key: 'proprietaire', label: 'Propriétaire',
                  render: (r: Reversement) => {
                    const p = getProprietaire(r.proprietaireId);
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-primary text-primary-content">
                          {p ? `${p.prenom[0]}${p.nom[0]}` : '?'}
                        </div>
                        <span className="text-base-content">{p?.prenom} {p?.nom}</span>
                      </div>
                    );
                  },
                },
                { key: 'periode', label: 'Période' },
                { key: 'totalLoyers', label: 'Loyers encaissés', render: (r: Reversement) => formatMontant(r.totalLoyers) },
                { key: 'totalCommission', label: 'Commission', render: (r: Reversement) => <span className="text-primary">- {formatMontant(r.totalCommission)}</span> },
                { key: 'totalDepenses', label: 'Dépenses', render: (r: Reversement) => r.totalDepenses > 0 ? <span className="text-error">- {formatMontant(r.totalDepenses)}</span> : '—' },
                { key: 'montantReverseNet', label: 'Net reversé', render: (r: Reversement) => <span className="font-bold text-success">{formatMontant(r.montantReverseNet)}</span> },
                { key: 'date', label: 'Date', render: (r: Reversement) => formatDate(r.date) },
                {
                  key: 'statut', label: 'Statut',
                  render: (r: Reversement) => (
                    <Badge
                      label={r.statut === 'vire' ? 'Viré' : r.statut === 'en_attente' ? 'En attente' : 'Annulé'}
                      variant={r.statut === 'vire' ? 'success' : r.statut === 'en_attente' ? 'warning' : 'danger'}
                    />
                  ),
                },
                {
                  key: 'actions', label: '',
                  render: () => <Button variant="ghost" size="sm" icon={<Download size={12} />}>Relevé PDF</Button>,
                },
              ]}
              data={reversements}
            />
      )}

      {activeTab === 'depenses' && (
        depenses.length === 0
          ? <div className="text-center py-20 text-base-content/40">Aucune dépense</div>
          : <Table<Depense>
              columns={[
                { key: 'logement', label: 'Logement', render: (r: Depense) => <span className="text-base-content">{getLogement(r.logementId)?.adresse ?? '—'}</span> },
                {
                  key: 'proprietaire', label: 'Propriétaire',
                  render: (r: Depense) => { const p = getProprietaire(r.proprietaireId); return <span className="text-base-content/60">{p?.prenom} {p?.nom}</span>; },
                },
                {
                  key: 'type', label: 'Type',
                  render: (r: Depense) => (
                    <Badge
                      label={r.type === 'travaux' ? 'Travaux' : r.type === 'charge_avancee' ? 'Charge avancée' : r.type}
                      variant={r.type === 'travaux' ? 'warning' : 'info'}
                    />
                  ),
                },
                { key: 'description', label: 'Description', render: (r: Depense) => <span className="text-base-content/60">{r.description}</span> },
                { key: 'montant', label: 'Montant', render: (r: Depense) => <span className="font-bold text-error">{formatMontant(r.montant)}</span> },
                { key: 'date', label: 'Date', render: (r: Depense) => formatDate(r.date) },
              ]}
              data={depenses}
            />
      )}

      {activeTab === 'commissions' && (
        proprietaires.length === 0
          ? <div className="text-center py-20 text-base-content/40">Aucun propriétaire</div>
          : <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {proprietaires.map(p => {
                const revs = reversements.filter(r => r.proprietaireId === p.id);
                const totalComm = revs.reduce((s, r) => s + r.totalCommission, 0);
                const totalLoy = revs.reduce((s, r) => s + r.totalLoyers, 0);
                return (
                  <Card key={p.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold bg-primary text-primary-content">
                        {p.prenom[0]}{p.nom[0]}
                      </div>
                      <div>
                        <div className="font-bold text-base-content">{p.prenom} {p.nom}</div>
                        <div className="text-xs text-base-content/40">Taux: {p.commissionTaux}%</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm py-2 border-b border-base-300">
                        <span className="text-base-content/60">Loyers gérés</span>
                        <span className="text-base-content font-medium">{formatMontant(totalLoy)}</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-base-content/60">Commissions</span>
                        <span className="font-bold text-primary">{formatMontant(totalComm)}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
      )}

      <Modal open={showDepenseModal} onClose={() => setShowDepenseModal(false)} title="Saisir une dépense">
        <div className="flex flex-col gap-4">
          <Select label="Logement" value={form.logementId}
            onChange={e => setForm(f => ({ ...f, logementId: e.target.value }))}
            options={[{ value: '', label: 'Sélectionner...' }, ...allLogements.map(l => ({ value: l.id, label: l.adresse }))]} />
          <Select label="Type de dépense" value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            options={[
              { value: 'travaux', label: 'Travaux' },
              { value: 'charge_avancee', label: "Charge avancée par l'agence" },
              { value: 'frais_gestion', label: 'Frais de gestion' },
              { value: 'autre', label: 'Autre' },
            ]} />
          <Input label="Description" placeholder="Réfection salle de bain..."
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Montant (XAF)" type="number" placeholder="250000"
              value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} />
            <Input label="Date" type="date"
              value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowDepenseModal(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      </>
      )}
    </div>
  );
}
