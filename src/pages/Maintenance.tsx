import { useState } from 'react';
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StatCard from '../components/ui/StatCard';
import { SkeletonPageHeader, SkeletonStatCards, SkeletonCardGrid } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { maintenanceApi, logementsApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { Maintenance, MaintenanceStatut, MaintenancePriorite, Logement } from '../types';

const statutConfig: Record<MaintenanceStatut, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' | 'danger' | 'orange' }> = {
  ouvert: { label: 'Ouvert', variant: 'info' },
  en_cours: { label: 'En cours', variant: 'warning' },
  resolu: { label: 'Résolu', variant: 'success' },
  annule: { label: 'Annulé', variant: 'neutral' },
};

const prioriteConfig: Record<MaintenancePriorite, { label: string; variant: 'danger' | 'warning' | 'info' | 'neutral'; bgClass: string }> = {
  urgente: { label: 'Urgente', variant: 'danger', bgClass: 'bg-error' },
  haute: { label: 'Haute', variant: 'warning', bgClass: 'bg-warning' },
  normale: { label: 'Normale', variant: 'info', bgClass: 'bg-info' },
  basse: { label: 'Basse', variant: 'neutral', bgClass: 'bg-base-content/40' },
};

export default function Maintenance() {
  const [showModal, setShowModal] = useState(false);
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterPriorite, setFilterPriorite] = useState('tous');
  const [form, setForm] = useState({
    logementId: '', titre: '', description: '',
    priorite: 'normale', dateSignalement: '', prestataire: '', cout: '',
  });
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [editForm, setEditForm] = useState({
    titre: '', description: '', priorite: 'normale', statut: 'ouvert',
    prestataire: '', cout: '', dateResolution: '',
  });

  const { data: maintenances, loading, refetch: refetchMaintenances } = useApi<Maintenance[]>(maintenanceApi.list, []);
  const { data: allLogements } = useApi<Logement[]>(logementsApi.list, []);

  const getLogement = (id: string) => allLogements.find(l => l.id === id);

  const startEdit = (m: Maintenance) => {
    setEditingMaintenance(m);
    setEditForm({
      titre: m.titre,
      description: m.description,
      priorite: m.priorite,
      statut: m.statut,
      prestataire: m.prestataire ?? '',
      cout: m.cout ? String(m.cout) : '',
      dateResolution: m.dateResolution ?? '',
    });
  };

  const handleEdit = async () => {
    if (!editingMaintenance) return;
    await maintenanceApi.update(editingMaintenance.id, {
      titre: editForm.titre,
      description: editForm.description,
      priorite: editForm.priorite,
      statut: editForm.statut,
      ...(editForm.prestataire.trim() ? { prestataire: editForm.prestataire.trim() } : {}),
      ...(editForm.cout ? { cout: Number(editForm.cout) } : {}),
      ...(editForm.dateResolution ? { dateResolution: editForm.dateResolution } : {}),
    });
    refetchMaintenances();
    setEditingMaintenance(null);
  };

  const filtered = maintenances.filter(m => {
    const matchStatut = filterStatut === 'tous' || m.statut === filterStatut;
    const matchPrio = filterPriorite === 'tous' || m.priorite === filterPriorite;
    return matchStatut && matchPrio;
  });

  const ouverts = maintenances.filter(m => m.statut === 'ouvert').length;
  const enCours = maintenances.filter(m => m.statut === 'en_cours').length;
  const resolus = maintenances.filter(m => m.statut === 'resolu').length;
  const totalCout = maintenances.filter(m => m.cout).reduce((s, m) => s + (m.cout ?? 0), 0);

  const handleCreate = async () => {
    await maintenanceApi.create({
      logementId: form.logementId,
      titre: form.titre,
      description: form.description,
      priorite: form.priorite,
      dateSignalement: form.dateSignalement,
      statut: 'ouvert',
      ...(form.prestataire.trim() ? { prestataire: form.prestataire.trim() } : {}),
      ...(form.cout ? { cout: Number(form.cout) } : {}),
    });
    refetchMaintenances();
    setShowModal(false);
    setForm({ logementId: '', titre: '', description: '', priorite: 'normale', dateSignalement: '', prestataire: '', cout: '' });
  };

  const handleResoudre = async (id: string) => {
    await maintenanceApi.update(id, {
      statut: 'resolu',
      dateResolution: new Date().toISOString().slice(0, 10),
    });
    refetchMaintenances();
  };

  return (
    <div>
      {loading ? (
        <>
          <SkeletonPageHeader />
          <SkeletonStatCards count={4} />
          <div className="flex gap-2 mb-6">
            {[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-8 w-20 rounded-xl animate-pulse" style={{ background: 'var(--color-base-300)' }} />)}
          </div>
          <SkeletonCardGrid count={6} cols={3} cardHeight="220px" />
        </>
      ) : (
      <>
      <PageHeader
        title="Maintenance"
        subtitle="Tickets de maintenance du parc locatif"
        action={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Nouveau ticket
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Ouverts" value={ouverts} icon={<Clock size={20} />} accentColor="#3b82f6" />
        <StatCard label="En cours" value={enCours} icon={<Wrench size={20} />} accentColor="#f59e0b" />
        <StatCard label="Résolus" value={resolus} icon={<CheckCircle size={20} />} accentColor="#22c55e" />
        <StatCard label="Coût total" value={formatMontant(totalCout)} icon={<AlertTriangle size={20} />} accentColor="#ef4444" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-2">
          {[
            { value: 'tous', label: 'Tous' },
            { value: 'ouvert', label: 'Ouverts' },
            { value: 'en_cours', label: 'En cours' },
            { value: 'resolu', label: 'Résolus' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterStatut(f.value)}
              className={filterStatut === f.value ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="h-6 w-px mx-2 bg-base-300" />
        <div className="flex gap-2">
          {[
            { value: 'tous', label: 'Toutes priorités' },
            { value: 'urgente', label: '🔴 Urgente' },
            { value: 'haute', label: '🟡 Haute' },
            { value: 'normale', label: '🔵 Normale' },
            { value: 'basse', label: 'Basse' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterPriorite(f.value)}
              className={filterPriorite === f.value ? 'btn btn-sm btn-ghost border border-base-300' : 'btn btn-sm btn-ghost'}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-base-content/40">Aucun ticket</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => {
          const log = getLogement(m.logementId);
          const pr = prioriteConfig[m.priorite];
          const st = statutConfig[m.statut];

          return (
            <Card key={m.id} className="cursor-pointer hover:scale-[1.01] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-1 h-full rounded-full mr-0 absolute left-0 top-0 bottom-0 ${pr.bgClass}`}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge label={pr.label} variant={pr.variant} />
                    <Badge label={st.label} variant={st.variant} />
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-base-content mb-1">{m.titre}</h3>
              <p className="text-sm mb-3 text-base-content/60">{m.description}</p>

              <div className="flex flex-col gap-1 text-xs mb-3 text-base-content/40">
                <div className="font-medium text-base-content">{log?.adresse ?? '—'}</div>
                <div>Signalé le {formatDate(m.dateSignalement)}</div>
                {m.dateResolution && <div className="text-success">Résolu le {formatDate(m.dateResolution)}</div>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-base-300">
                {m.prestataire ? (
                  <div>
                    <div className="text-xs text-base-content/40">Prestataire</div>
                    <div className="text-sm text-base-content">{m.prestataire}</div>
                  </div>
                ) : (
                  <span className="text-xs text-base-content/40">Aucun prestataire</span>
                )}
                {m.cout ? (
                  <div className="text-right">
                    <div className="text-xs text-base-content/40">Coût</div>
                    <div className="font-bold text-primary">{formatMontant(m.cout)}</div>
                  </div>
                ) : null}
              </div>

              {m.statut !== 'resolu' && m.statut !== 'annule' && (
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" size="sm" className="flex-1 justify-center"
                    onClick={() => maintenanceApi.update(m.id, { statut: 'en_cours' }).then(refetchMaintenances)}>
                    En cours
                  </Button>
                  <Button size="sm" className="flex-1 justify-center" icon={<CheckCircle size={12} />}
                    onClick={() => handleResoudre(m.id)}>
                    Résoudre
                  </Button>
                </div>
              )}
              <div className="mt-2">
                <Button variant="ghost" size="sm" icon={<Pencil size={12} />}
                  className="w-full justify-center"
                  onClick={e => { e.stopPropagation(); startEdit(m); }}>
                  Modifier
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouveau ticket maintenance">
        <div className="flex flex-col gap-4">
          <Select label="Logement" value={form.logementId}
            onChange={e => setForm(f => ({ ...f, logementId: e.target.value }))}
            options={[
              { value: '', label: 'Sélectionner un logement...' },
              ...allLogements.map(l => ({ value: l.id, label: l.adresse })),
            ]} />
          <Input label="Titre" placeholder="Fuite robinet..."
            value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Description</label>
            <textarea
              rows={3}
              placeholder="Décrivez le problème..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none bg-base-100 border border-base-300 text-base-content"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priorité" value={form.priorite}
              onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}
              options={[
                { value: 'basse', label: 'Basse' },
                { value: 'normale', label: 'Normale' },
                { value: 'haute', label: 'Haute' },
                { value: 'urgente', label: 'Urgente' },
              ]} />
            <Input label="Date de signalement" type="date"
              value={form.dateSignalement} onChange={e => setForm(f => ({ ...f, dateSignalement: e.target.value }))} />
          </div>
          <Input label="Prestataire (optionnel)" placeholder="Plomberie Express..."
            value={form.prestataire} onChange={e => setForm(f => ({ ...f, prestataire: e.target.value }))} />
          <Input label="Coût estimé (XAF)" type="number" placeholder="25000"
            value={form.cout} onChange={e => setForm(f => ({ ...f, cout: e.target.value }))} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Créer le ticket</Button>
          </div>
        </div>
      </Modal>

      {/* Modal d'édition */}
      <Modal open={!!editingMaintenance} onClose={() => setEditingMaintenance(null)} title="Modifier le ticket">
        <div className="flex flex-col gap-4">
          <Input label="Titre" value={editForm.titre}
            onChange={e => setEditForm(f => ({ ...f, titre: e.target.value }))} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Description</label>
            <textarea
              rows={3}
              value={editForm.description}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none bg-base-100 border border-base-300 text-base-content"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priorité" value={editForm.priorite}
              onChange={e => setEditForm(f => ({ ...f, priorite: e.target.value }))}
              options={[
                { value: 'basse', label: 'Basse' },
                { value: 'normale', label: 'Normale' },
                { value: 'haute', label: 'Haute' },
                { value: 'urgente', label: 'Urgente' },
              ]} />
            <Select label="Statut" value={editForm.statut}
              onChange={e => setEditForm(f => ({ ...f, statut: e.target.value }))}
              options={[
                { value: 'ouvert', label: 'Ouvert' },
                { value: 'en_cours', label: 'En cours' },
                { value: 'resolu', label: 'Résolu' },
                { value: 'annule', label: 'Annulé' },
              ]} />
          </div>
          <Input label="Prestataire (optionnel)" value={editForm.prestataire}
            onChange={e => setEditForm(f => ({ ...f, prestataire: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Coût (XAF)" type="number" value={editForm.cout}
              onChange={e => setEditForm(f => ({ ...f, cout: e.target.value }))} />
            <Input label="Date de résolution" type="date" value={editForm.dateResolution}
              onChange={e => setEditForm(f => ({ ...f, dateResolution: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setEditingMaintenance(null)}>Annuler</Button>
            <Button onClick={handleEdit}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      </>
      )}
    </div>
  );
}
