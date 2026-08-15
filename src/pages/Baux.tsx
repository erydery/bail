import { useState } from 'react';
import { Plus, ArrowLeft, FileDown, AlertCircle, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import { SkeletonPageHeader, SkeletonTable } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { bauxApi, locatairesApi, logementsApi, paiementsApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { Bail, Locataire, Logement, Paiement } from '../types';

const statutConfig = {
  actif: { label: 'Actif', variant: 'success' as const },
  preavis: { label: 'Préavis', variant: 'warning' as const },
  expire: { label: 'Expiré', variant: 'neutral' as const },
  resilie: { label: 'Résilié', variant: 'danger' as const },
};

export default function Baux() {
  const [selected, setSelected] = useState<Bail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [editing, setEditing] = useState<Bail | null>(null);
  const [editForm, setEditForm] = useState({
    type: 'nu', statut: 'actif', loyer: '', charges: '', depotGarantie: '',
    jourEcheance: '', dateDebut: '', dateFin: '',
  });

  // Form state
  const [form, setForm] = useState({
    logementId: '', locataireId: '', type: 'nu', jourEcheance: '5',
    loyer: '', charges: '', depotGarantie: '', dateDebut: '', dateFin: '',
  });

  const { data: baux, loading, refetch: refetchBaux } = useApi<Bail[]>(bauxApi.list, []);
  const { data: locataires } = useApi<Locataire[]>(locatairesApi.list, []);
  const { data: logements } = useApi<Logement[]>(logementsApi.list, []);
  const { data: allPaiements } = useApi<Paiement[]>(paiementsApi.list, []);

  const getLogement = (id: string) => logements.find(l => l.id === id);
  const getLocataire = (id: string) => locataires.find(l => l.id === id);
  const getPaiementsByBail = (bailId: string) => (allPaiements as Paiement[]).filter(p => p.bailId === bailId);

  const handleCreate = async () => {
    await bauxApi.create({
      logementId: form.logementId,
      locataireId: form.locataireId,
      type: form.type,
      dateDebut: form.dateDebut,
      loyer: Number(form.loyer),
      charges: Number(form.charges),
      depotGarantie: Number(form.depotGarantie),
      jourEcheance: Number(form.jourEcheance),
      ...(form.dateFin ? { dateFin: form.dateFin } : {}),
    });
    refetchBaux();
    setShowModal(false);
    setStep(1);
    setForm({ logementId: '', locataireId: '', type: 'nu', jourEcheance: '5', loyer: '', charges: '', depotGarantie: '', dateDebut: '', dateFin: '' });
  };

  const startEdit = (b: Bail) => {
    setEditing(b);
    setEditForm({
      type: b.type,
      statut: b.statut,
      loyer: String(b.loyer),
      charges: String(b.charges),
      depotGarantie: String(b.depotGarantie),
      jourEcheance: String(b.jourEcheance),
      dateDebut: b.dateDebut,
      dateFin: b.dateFin ?? '',
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    await bauxApi.update(editing.id, {
      type: editForm.type,
      statut: editForm.statut,
      loyer: Number(editForm.loyer),
      charges: Number(editForm.charges),
      depotGarantie: Number(editForm.depotGarantie),
      jourEcheance: Number(editForm.jourEcheance),
      dateDebut: editForm.dateDebut,
      ...(editForm.dateFin ? { dateFin: editForm.dateFin } : {}),
    });
    refetchBaux();
    setEditing(null);
    setSelected(prev => prev && prev.id === editing.id
      ? { ...prev, ...editForm, type: editForm.type as import('../types').BailType, statut: editForm.statut as import('../types').BailStatut, loyer: Number(editForm.loyer), charges: Number(editForm.charges), depotGarantie: Number(editForm.depotGarantie), jourEcheance: Number(editForm.jourEcheance) }
      : prev
    );
  };

  if (selected) {
    const log = getLogement(selected.logementId);
    const loc = getLocataire(selected.locataireId);
    const pays = getPaiementsByBail(selected.id);
    const s = statutConfig[selected.statut];

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelected(null)}
            className="btn btn-sm btn-ghost border border-base-300 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <Button variant="secondary" size="sm" icon={<FileDown size={14} />}>
            Télécharger PDF
          </Button>
          <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => startEdit(selected)}>
            Modifier
          </Button>
        </div>

        <PageHeader
          title={`Bail — ${loc?.prenom} ${loc?.nom}`}
          subtitle={log?.adresse}
          breadcrumb="Baux"
          action={<Badge label={s.label} variant={s.variant} />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
              Détails du bail
            </h3>
            {[
              { label: 'Type', value: selected.type === 'nu' ? 'Location nue' : 'Location meublée' },
              { label: 'Date de début', value: formatDate(selected.dateDebut) },
              { label: 'Date de fin', value: selected.dateFin ? formatDate(selected.dateFin) : 'Indéterminée' },
              { label: 'Loyer hors charges', value: formatMontant(selected.loyer) },
              { label: 'Charges mensuelles', value: formatMontant(selected.charges) },
              { label: 'Total mensuel', value: formatMontant(selected.loyer + selected.charges) },
              { label: 'Dépôt de garantie', value: formatMontant(selected.depotGarantie) },
              { label: "Jour d'échéance", value: `Le ${selected.jourEcheance} du mois` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 text-sm border-b border-base-300">
                <span className="text-base-content/60">{label}</span>
                <span className="font-medium text-base-content">{value}</span>
              </div>
            ))}
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
              Locataire
            </h3>
            {loc && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg bg-primary text-primary-content">
                    {loc.prenom[0]}{loc.nom[0]}
                  </div>
                  <div>
                    <div className="font-bold text-base-content">{loc.prenom} {loc.nom}</div>
                    <div className="text-xs text-base-content/40">{loc.email}</div>
                  </div>
                </div>
                {[
                  { label: 'Téléphone', value: loc.telephone },
                  { label: 'Adresse', value: loc.adresse },
                  { label: 'N° pièce', value: loc.numeroPiece },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2 text-sm border-b border-base-300">
                    <div className="text-xs mb-0.5 text-base-content/40">{label}</div>
                    <div className="text-base-content">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
              Logement
            </h3>
            {log && (
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Adresse', value: log.adresse },
                  { label: 'Ville', value: log.ville },
                  { label: 'Type', value: log.type },
                  { label: 'Surface', value: `${log.surface} m²` },
                  { label: 'Pièces', value: String(log.nbPieces) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 text-sm border-b border-base-300">
                    <span className="text-base-content/60">{label}</span>
                    <span className="font-medium text-base-content">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-base-content mb-4">Historique des paiements</h3>
          <Table<Paiement>
            columns={[
              { key: 'moisConcerne', label: 'Mois' },
              { key: 'montantDu', label: 'Dû', render: r => formatMontant(r.montantDu) },
              { key: 'montantPaye', label: 'Payé', render: r => formatMontant(r.montantPaye) },
              {
                key: 'solde', label: 'Solde',
                render: r => {
                  const solde = r.montantPaye - r.montantDu;
                  return <span className={solde < 0 ? 'text-error' : 'text-success'}>{formatMontant(Math.abs(solde))}</span>;
                }
              },
              { key: 'datePaiement', label: 'Date', render: r => r.datePaiement ? formatDate(r.datePaiement) : '—' },
              {
                key: 'statut', label: 'Statut',
                render: r => (
                  <Badge
                    label={r.statut === 'paye' ? 'Payé' : r.statut === 'en_retard' ? 'En retard' : r.statut === 'partiel' ? 'Partiel' : 'En attente'}
                    variant={r.statut === 'paye' ? 'success' : r.statut === 'en_retard' ? 'danger' : 'warning'}
                  />
                )
              },
            ]}
            data={pays}
          />
        </div>

        <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le bail">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Type de bail" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                options={[
                  { value: 'nu', label: 'Bail nu' },
                  { value: 'meuble', label: 'Bail meublé' },
                ]} />
              <Select label="Statut" value={editForm.statut} onChange={e => setEditForm(f => ({ ...f, statut: e.target.value }))}
                options={[
                  { value: 'actif', label: 'Actif' },
                  { value: 'preavis', label: 'Préavis' },
                  { value: 'expire', label: 'Expiré' },
                  { value: 'resilie', label: 'Résilié' },
                ]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Loyer HC (XAF)" type="number" value={editForm.loyer} onChange={e => setEditForm(f => ({ ...f, loyer: e.target.value }))} />
              <Input label="Charges (XAF)" type="number" value={editForm.charges} onChange={e => setEditForm(f => ({ ...f, charges: e.target.value }))} />
            </div>
            <Input label="Dépôt de garantie (XAF)" type="number" value={editForm.depotGarantie} onChange={e => setEditForm(f => ({ ...f, depotGarantie: e.target.value }))} />
            <Input label="Jour d'échéance" type="number" value={editForm.jourEcheance} onChange={e => setEditForm(f => ({ ...f, jourEcheance: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date de début" type="date" value={editForm.dateDebut} onChange={e => setEditForm(f => ({ ...f, dateDebut: e.target.value }))} />
              <Input label="Date de fin (optionnel)" type="date" value={editForm.dateFin} onChange={e => setEditForm(f => ({ ...f, dateFin: e.target.value }))} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Annuler</Button>
              <Button onClick={handleEdit}>Enregistrer</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  const logementsLibres = logements.filter(l => l.statut === 'libre');

  if (loading) {
    return (
      <div>
        <SkeletonPageHeader />
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Baux"
        subtitle={`${baux.length} baux`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => { setShowModal(true); setStep(1); }}>
            Nouveau bail
          </Button>
        }
      />

      {baux.filter(b => b.statut === 'preavis').map(b => {
        const loc = getLocataire(b.locataireId);
        const log = getLogement(b.logementId);
        return (
          <div
            key={b.id}
            className="flex items-center gap-3 p-4 rounded-xl mb-4 bg-warning/10 border border-warning/30"
          >
            <AlertCircle size={18} className="text-warning" />
            <span className="text-sm text-warning">
              Préavis : {loc?.prenom} {loc?.nom} quitte {log?.adresse}
              {b.dateFin ? ` le ${formatDate(b.dateFin)}` : ''}
            </span>
          </div>
        );
      })}

      <Table<Bail>
        columns={[
          {
            key: 'locataire', label: 'Locataire',
            render: r => {
              const loc = getLocataire(r.locataireId);
              return (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-primary text-primary-content">
                    {loc ? `${loc.prenom[0]}${loc.nom[0]}` : '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-base-content">{loc?.prenom} {loc?.nom}</div>
                  </div>
                </div>
              );
            }
          },
          {
            key: 'logement', label: 'Logement',
            render: r => <span className="text-base-content">{getLogement(r.logementId)?.adresse ?? '—'}</span>
          },
          { key: 'type', label: 'Type', render: r => r.type === 'nu' ? 'Bail nu' : 'Bail meublé' },
          { key: 'loyer', label: 'Loyer + charges', render: r => formatMontant(r.loyer + r.charges) },
          { key: 'dateDebut', label: 'Début', render: r => formatDate(r.dateDebut) },
          {
            key: 'statut', label: 'Statut',
            render: r => {
              const sc = statutConfig[r.statut];
              return <Badge label={sc.label} variant={sc.variant} />;
            }
          },
        ]}
        data={baux}
        onRowClick={setSelected}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={`Nouveau bail — Étape ${step}/3`} width="600px">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-base-300'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-base-content">Sélection du logement et locataire</h3>
            <Select label="Logement" value={form.logementId}
              onChange={e => setForm(f => ({ ...f, logementId: e.target.value }))}
              options={[
                { value: '', label: 'Sélectionner...' },
                ...logementsLibres.map(l => ({ value: l.id, label: `${l.adresse} (${l.type})` })),
              ]} />
            <Select label="Locataire" value={form.locataireId}
              onChange={e => setForm(f => ({ ...f, locataireId: e.target.value }))}
              options={[
                { value: '', label: 'Sélectionner...' },
                ...locataires.map(l => ({ value: l.id, label: `${l.prenom} ${l.nom}` })),
              ]} />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={() => setStep(2)}>Suivant →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-base-content">Conditions financières</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Type de bail" value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                options={[
                  { value: 'nu', label: 'Bail nu' },
                  { value: 'meuble', label: 'Bail meublé' },
                ]} />
              <Input label="Jour d'échéance" type="number" placeholder="5"
                value={form.jourEcheance} onChange={e => setForm(f => ({ ...f, jourEcheance: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Loyer HC (XAF)" type="number" placeholder="450000"
                value={form.loyer} onChange={e => setForm(f => ({ ...f, loyer: e.target.value }))} />
              <Input label="Charges (XAF)" type="number" placeholder="50000"
                value={form.charges} onChange={e => setForm(f => ({ ...f, charges: e.target.value }))} />
            </div>
            <Input label="Dépôt de garantie (XAF)" type="number" placeholder="900000"
              value={form.depotGarantie} onChange={e => setForm(f => ({ ...f, depotGarantie: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date de début" type="date"
                value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} />
              <Input label="Date de fin (optionnel)" type="date"
                value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))} />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setStep(1)}>← Retour</Button>
              <Button onClick={() => setStep(3)}>Suivant →</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-base-content">Récapitulatif</h3>
            <div className="p-4 rounded-xl bg-base-100 border border-base-300 flex flex-col gap-2 text-sm">
              {[
                { label: 'Logement', value: getLogement(form.logementId)?.adresse ?? '—' },
                { label: 'Locataire', value: (() => { const l = getLocataire(form.locataireId); return l ? `${l.prenom} ${l.nom}` : '—'; })() },
                { label: 'Type', value: form.type === 'nu' ? 'Bail nu' : 'Bail meublé' },
                { label: 'Loyer + charges', value: form.loyer && form.charges ? formatMontant(Number(form.loyer) + Number(form.charges)) : '—' },
                { label: 'Début', value: form.dateDebut ? formatDate(form.dateDebut) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-base-300 py-1">
                  <span className="text-base-content/60">{label}</span>
                  <span className="font-medium text-base-content">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setStep(2)}>← Retour</Button>
              <Button onClick={handleCreate}>Créer le bail</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
