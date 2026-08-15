import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Plus, Send, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import StatCard from '../components/ui/StatCard';
import { SkeletonPageHeader, SkeletonStatCards } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { paiementsApi, bauxApi, locatairesApi, logementsApi } from '../lib/api';
import { formatMontant } from '../lib/utils';
import type { Paiement, Bail, Locataire, Logement } from '../types';

export default function Paiements() {
  const [moisSelectionne, setMoisSelectionne] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    bailId: '', moisConcerne: '', montantPaye: '', datePaiement: '', mode: 'virement',
  });
  const [editingPaiement, setEditingPaiement] = useState<Paiement | null>(null);
  const [editPaiementForm, setEditPaiementForm] = useState({
    montantPaye: '', datePaiement: '', mode: 'virement',
  });

  const { data: allPaiements, loading, refetch: refetchPaiements } = useApi<Paiement[]>(paiementsApi.list, []);
  const { data: allBaux } = useApi<Bail[]>(bauxApi.list, []);
  const { data: allLocataires } = useApi<Locataire[]>(locatairesApi.list, []);
  const { data: allLogements } = useApi<Logement[]>(logementsApi.list, []);

  // Build list of unique months from all paiements
  const moisDisponibles = Array.from(new Set(allPaiements.map(p => p.moisConcerne))).sort().reverse();
  const moisList = moisDisponibles.length > 0 ? moisDisponibles : [moisSelectionne];

  const paiementsMois = allPaiements.filter(p => p.moisConcerne === moisSelectionne);
  const totalDu = paiementsMois.reduce((s, p) => s + p.montantDu, 0);
  const totalPaye = paiementsMois.reduce((s, p) => s + p.montantPaye, 0);
  const enRetard = paiementsMois.filter(p => p.statut === 'en_retard' || p.statut === 'partiel');
  const payes = paiementsMois.filter(p => p.statut === 'paye');
  const tauxRecouvrement = totalDu > 0 ? Math.round(totalPaye / totalDu * 100) : 0;

  const handleCreate = async () => {
    // montantDu = loyer du bail sélectionné
    const bail = allBaux.find(b => b.id === form.bailId);
    const montantDu = bail ? bail.loyer + bail.charges : Number(form.montantPaye);
    await paiementsApi.create({
      bailId: form.bailId,
      moisConcerne: form.moisConcerne,
      montantDu,
      montantPaye: Number(form.montantPaye),
      ...(form.mode ? { mode: form.mode } : {}),
      ...(form.datePaiement ? { datePaiement: form.datePaiement } : {}),
    });
    refetchPaiements();
    setShowModal(false);
    setForm({ bailId: '', moisConcerne: '', montantPaye: '', datePaiement: '', mode: 'virement' });
  };

  const startEditPaiement = (p: Paiement) => {
    setEditingPaiement(p);
    setEditPaiementForm({
      montantPaye: String(p.montantPaye),
      datePaiement: p.datePaiement ?? '',
      mode: p.mode ?? 'virement',
    });
  };

  const handleEditPaiement = async () => {
    if (!editingPaiement) return;
    await paiementsApi.update(editingPaiement.id, {
      montantPaye: Number(editPaiementForm.montantPaye),
      ...(editPaiementForm.datePaiement ? { datePaiement: editPaiementForm.datePaiement } : {}),
      mode: editPaiementForm.mode,
    });
    refetchPaiements();
    setEditingPaiement(null);
  };

  const activeBaux = allBaux.filter(b => b.statut === 'actif' || b.statut === 'preavis');

  return (
    <div>
      {loading ? (
        <>
          <SkeletonPageHeader />
          <div className="flex gap-2 mb-6">
            {[1,2,3].map(i => <div key={i} className="h-8 w-28 rounded-xl animate-pulse" style={{ background: 'var(--color-base-300)' }} />)}
          </div>
          <SkeletonStatCards count={4} />
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)' }} />
            ))}
          </div>
        </>
      ) : (
      <>
      <PageHeader
        title="Paiements"
        subtitle="Suivi mensuel des loyers"
        action={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Enregistrer paiement
          </Button>
        }
      />

      {/* Sélecteur de mois */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {moisList.map(m => (
          <button
            key={m}
            onClick={() => setMoisSelectionne(m)}
            className={moisSelectionne === m ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
          >
            {new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total dû"
          value={formatMontant(totalDu)}
          icon={<Clock size={20} />}
          accentColor="#3b82f6"
        />
        <StatCard
          label="Encaissé"
          value={formatMontant(totalPaye)}
          icon={<CheckCircle size={20} />}
          trend={totalDu > 0 ? { value: `${tauxRecouvrement}%`, positive: true } : undefined}
          accentColor="#22c55e"
        />
        <StatCard
          label="En retard / partiel"
          value={enRetard.length}
          icon={<AlertTriangle size={20} />}
          accentColor="#ef4444"
        />
        <StatCard
          label="Payés"
          value={`${payes.length}/${paiementsMois.length}`}
          icon={<CheckCircle size={20} />}
          accentColor="#22c55e"
        />
      </div>

      {/* Barre de progression */}
      {totalDu > 0 && (
        <Card className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-base-content/60">Taux de recouvrement {moisSelectionne}</span>
            <span className="font-bold text-base-content">{tauxRecouvrement}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-base-300">
            <div
              className="h-3 rounded-full bg-success"
              style={{ width: `${tauxRecouvrement}%` }}
            />
          </div>
        </Card>
      )}

      {paiementsMois.length === 0 && (
        <div className="text-center py-20 text-base-content/40">
          Aucun paiement pour ce mois
        </div>
      )}

      <div className="flex flex-col gap-3">
        {paiementsMois.map(p => {
          const bail = allBaux.find(b => b.id === p.bailId);
          const loc = bail ? allLocataires.find(l => l.id === bail.locataireId) : null;
          const log = bail ? allLogements.find(l => l.id === bail.logementId) : null;
          const restant = p.montantDu - p.montantPaye;

          return (
            <div
              key={p.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-base-200 border border-base-300"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0
                  ${p.statut === 'paye' ? 'bg-success/10 text-success' :
                    p.statut === 'en_retard' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}`}
              >
                {loc ? `${loc.prenom[0]}${loc.nom[0]}` : '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base-content">{loc?.prenom} {loc?.nom}</div>
                <div className="text-xs text-base-content/40">{log?.adresse}</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-base-content/40">Dû</div>
                <div className="font-semibold text-base-content">{formatMontant(p.montantDu)}</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-base-content/40">Payé</div>
                <div className="font-semibold text-success">{formatMontant(p.montantPaye)}</div>
              </div>

              {restant > 0 && (
                <div className="text-right">
                  <div className="text-xs text-base-content/40">Restant</div>
                  <div className="font-semibold text-error">{formatMontant(restant)}</div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge
                  label={
                    p.statut === 'paye' ? 'Payé' :
                    p.statut === 'en_retard' ? 'En retard' :
                    p.statut === 'partiel' ? 'Partiel' : 'En attente'
                  }
                  variant={
                    p.statut === 'paye' ? 'success' :
                    p.statut === 'en_retard' ? 'danger' : 'warning'
                  }
                />
                <Button variant="ghost" size="sm" icon={<Pencil size={12} />}
                  onClick={() => startEditPaiement(p)}>
                  Modifier
                </Button>
                {p.statut !== 'paye' && (
                  <Button variant="ghost" size="sm" icon={<Send size={12} />}>
                    Relance
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Enregistrer un paiement">        <div className="flex flex-col gap-4">
          <Select label="Bail" value={form.bailId}
            onChange={e => setForm(f => ({ ...f, bailId: e.target.value }))}
            options={[
              { value: '', label: 'Sélectionner un bail...' },
              ...activeBaux.map(b => {
                const loc = allLocataires.find(l => l.id === b.locataireId);
                const log = allLogements.find(l => l.id === b.logementId);
                return {
                  value: b.id,
                  label: loc && log ? `${loc.prenom} ${loc.nom} — ${log.adresse}` : b.id,
                };
              }),
            ]} />
          <Input label="Mois concerné" type="month"
            value={form.moisConcerne} onChange={e => setForm(f => ({ ...f, moisConcerne: e.target.value }))} />
          <Input label="Montant payé (XAF)" type="number" placeholder="500000"
            value={form.montantPaye} onChange={e => setForm(f => ({ ...f, montantPaye: e.target.value }))} />
          <Input label="Date de paiement" type="date"
            value={form.datePaiement} onChange={e => setForm(f => ({ ...f, datePaiement: e.target.value }))} />
          <Select label="Mode de paiement" value={form.mode}
            onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
            options={[
              { value: 'virement', label: 'Virement bancaire' },
              { value: 'cheque', label: 'Chèque' },
              { value: 'especes', label: 'Espèces' },
              { value: 'prelevement', label: 'Prélèvement automatique' },
            ]} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Enregistrer</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editingPaiement} onClose={() => setEditingPaiement(null)} title="Modifier le paiement">
        <div className="flex flex-col gap-4">
          {editingPaiement && (
            <div className="p-3 rounded-xl bg-base-100 border border-base-300 text-sm text-base-content/60">
              Montant dû : <span className="font-bold text-base-content">{formatMontant(editingPaiement.montantDu)}</span>
            </div>
          )}
          <Input label="Montant payé (XAF)" type="number"
            value={editPaiementForm.montantPaye}
            onChange={e => setEditPaiementForm(f => ({ ...f, montantPaye: e.target.value }))} />
          <Input label="Date de paiement" type="date"
            value={editPaiementForm.datePaiement}
            onChange={e => setEditPaiementForm(f => ({ ...f, datePaiement: e.target.value }))} />
          <Select label="Mode de paiement" value={editPaiementForm.mode}
            onChange={e => setEditPaiementForm(f => ({ ...f, mode: e.target.value }))}
            options={[
              { value: 'virement', label: 'Virement bancaire' },
              { value: 'cheque', label: 'Chèque' },
              { value: 'especes', label: 'Espèces' },
              { value: 'prelevement', label: 'Prélèvement automatique' },
            ]} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setEditingPaiement(null)}>Annuler</Button>
            <Button onClick={handleEditPaiement}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      </>
      )}
    </div>
  );
}
