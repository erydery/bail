import { useState } from 'react';
import { Plus, Mail, Phone, ArrowLeft, Shield, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import { SkeletonPageHeader, SkeletonTable } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { locatairesApi, bauxApi, logementsApi, paiementsApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { Locataire, Bail, Logement, Paiement } from '../types';

export default function Locataires() {
  const [selected, setSelected] = useState<Locataire | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse: '', dateNaissance: '', numeroPiece: '',
  });
  const [editing, setEditing] = useState<Locataire | null>(null);
  const [editForm, setEditForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse: '', dateNaissance: '', numeroPiece: '',
  });

  const { data: locataires, loading, refetch: refetchLocataires } = useApi<Locataire[]>(locatairesApi.list, []);
  const { data: allBaux } = useApi<Bail[]>(bauxApi.list, []);
  const { data: allLogements } = useApi<Logement[]>(logementsApi.list, []);
  const { data: allPaiements } = useApi<Paiement[]>(paiementsApi.list, []);

  const getLogement = (id: string) => allLogements.find(l => l.id === id);

  const handleCreate = async () => {
    await locatairesApi.create(form);
    refetchLocataires();
    setShowModal(false);
    setForm({ prenom: '', nom: '', email: '', telephone: '', adresse: '', dateNaissance: '', numeroPiece: '' });
  };

  const startEdit = (l: Locataire) => {
    setEditing(l);
    setEditForm({
      prenom: l.prenom,
      nom: l.nom,
      email: l.email,
      telephone: l.telephone,
      adresse: l.adresse,
      dateNaissance: l.dateNaissance,
      numeroPiece: l.numeroPiece,
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    await locatairesApi.update(editing.id, {
      prenom: editForm.prenom,
      nom: editForm.nom,
      email: editForm.email,
      telephone: editForm.telephone,
      adresse: editForm.adresse,
      dateNaissance: editForm.dateNaissance,
      numeroPiece: editForm.numeroPiece,
    });
    refetchLocataires();
    setEditing(null);
    setSelected(prev => prev && prev.id === editing.id ? { ...prev, ...editForm } : prev);
  };

  if (selected) {
    const bailsLoc = allBaux.filter(b => b.locataireId === selected.id);
    const bailActif = bailsLoc.find(b => b.statut === 'actif' || b.statut === 'preavis');
    const paiementsLoc = allPaiements.filter(p => bailsLoc.some(b => b.id === p.bailId));

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelected(null)}
            className="btn btn-sm btn-ghost border border-base-300 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => startEdit(selected)}>
            Modifier
          </Button>
        </div>

        <PageHeader
          title={`${selected.prenom} ${selected.nom}`}
          subtitle="Fiche locataire"
          breadcrumb="Locataires"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
              Identité
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: <Mail size={15} />, value: selected.email },
                { icon: <Phone size={15} />, value: selected.telephone },
              ].map(({ icon, value }) => (
                <div key={value} className="flex items-center gap-3">
                  <span className="text-primary">{icon}</span>
                  <span className="text-sm text-base-content">{value}</span>
                </div>
              ))}
              <div className="flex flex-col gap-1 mt-2">
                {[
                  { label: 'Adresse', value: selected.adresse },
                  { label: 'Date de naissance', value: formatDate(selected.dateNaissance) },
                  { label: "N° pièce d'identité", value: selected.numeroPiece },
                  { label: 'Client depuis', value: formatDate(selected.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2 border-b border-base-300">
                    <div className="text-xs text-base-content/40">{label}</div>
                    <div className="text-sm text-base-content">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {selected.garant && (
            <Card>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
                <div className="flex items-center gap-2"><Shield size={14} /> Garant</div>
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Nom', value: `${selected.garant.prenom} ${selected.garant.nom}` },
                  { label: 'Téléphone', value: selected.garant.telephone },
                  { label: 'Email', value: selected.garant.email },
                ].map(({ label, value }) => (
                  <div key={label} className="py-2 border-b border-base-300">
                    <div className="text-xs text-base-content/40">{label}</div>
                    <div className="text-sm text-base-content">{value}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex flex-col gap-4">
            <Card>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-base-content/40">
                Bail actuel
              </h3>
              {bailActif ? (
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Logement', value: getLogement(bailActif.logementId)?.adresse ?? '' },
                    { label: 'Depuis', value: formatDate(bailActif.dateDebut) },
                    { label: 'Loyer', value: formatMontant(bailActif.loyer + bailActif.charges) },
                    { label: 'Statut', value: bailActif.statut },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm py-1 border-b border-base-300">
                      <span className="text-base-content/60">{label}</span>
                      <span className="text-base-content font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm py-4 text-center text-base-content/40">
                  Aucun bail actif
                </div>
              )}
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-base-content mb-4">Historique des paiements</h3>
          <Table<Paiement>
            columns={[
              { key: 'moisConcerne', label: 'Mois' },
              { key: 'montantDu', label: 'Dû', render: (r: Paiement) => formatMontant(r.montantDu) },
              { key: 'montantPaye', label: 'Payé', render: (r: Paiement) => formatMontant(r.montantPaye) },
              { key: 'datePaiement', label: 'Date paiement', render: (r: Paiement) => r.datePaiement ? formatDate(r.datePaiement) : '—' },
              {
                key: 'statut', label: 'Statut',
                render: (r: Paiement) => (
                  <Badge
                    label={r.statut === 'paye' ? 'Payé' : r.statut === 'en_retard' ? 'En retard' : r.statut === 'partiel' ? 'Partiel' : 'En attente'}
                    variant={r.statut === 'paye' ? 'success' : r.statut === 'en_retard' ? 'danger' : 'warning'}
                  />
                ),
              },
            ]}
            data={paiementsLoc}
          />
        </div>

        <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le locataire">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Prénom" value={editForm.prenom} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} />
              <Input label="Nom" value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <Input label="Email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Téléphone" value={editForm.telephone} onChange={e => setEditForm(f => ({ ...f, telephone: e.target.value }))} />
            <Input label="Adresse" value={editForm.adresse} onChange={e => setEditForm(f => ({ ...f, adresse: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Date de naissance" type="date" value={editForm.dateNaissance} onChange={e => setEditForm(f => ({ ...f, dateNaissance: e.target.value }))} />
              <Input label="N° pièce d'identité" value={editForm.numeroPiece} onChange={e => setEditForm(f => ({ ...f, numeroPiece: e.target.value }))} />
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

  return (
    <div>
      {loading ? (
        <>
          <SkeletonPageHeader />
          <SkeletonTable rows={5} cols={5} />
        </>
      ) : (
      <>
      <PageHeader
        title="Locataires"
        subtitle={`${locataires.length} locataires`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Ajouter
          </Button>
        }
      />

      <Table<Locataire>
        columns={[
          {
            key: 'nom',
            label: 'Locataire',
            render: (r: Locataire) => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-primary text-primary-content">
                  {r.prenom[0]}{r.nom[0]}
                </div>
                <div>
                  <div className="font-semibold text-base-content">{r.prenom} {r.nom}</div>
                  <div className="text-xs text-base-content/40">{r.email}</div>
                </div>
              </div>
            ),
          },
          { key: 'telephone', label: 'Téléphone' },
          {
            key: 'bail',
            label: 'Logement actuel',
            render: (r: Locataire) => {
              const bail = allBaux.find(b => b.locataireId === r.id && (b.statut === 'actif' || b.statut === 'preavis'));
              if (!bail) return <span className="text-base-content/40">—</span>;
              const log = getLogement(bail.logementId);
              return <span className="text-base-content">{log?.adresse ?? '—'}</span>;
            },
          },
          {
            key: 'garant',
            label: 'Garant',
            render: (r: Locataire) => r.garant
              ? <Badge label="Oui" variant="success" />
              : <Badge label="Non" variant="neutral" />,
          },
          { key: 'createdAt', label: 'Depuis', render: (r: Locataire) => formatDate(r.createdAt) },
        ]}
        data={locataires}
        onRowClick={(row: Locataire) => setSelected(row)}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouveau locataire">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Prénom" placeholder="Mariama"
              value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            <Input label="Nom" placeholder="Sylla"
              value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          </div>
          <Input label="Email" type="email" placeholder="email@exemple.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Téléphone" placeholder="+224 6XX XX XX XX"
            value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
          <Input label="Adresse actuelle" placeholder="45 Rue..."
            value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Date de naissance" type="date"
              value={form.dateNaissance} onChange={e => setForm(f => ({ ...f, dateNaissance: e.target.value }))} />
            <Input label="N° pièce d'identité" placeholder="CNI-XXXXXX"
              value={form.numeroPiece} onChange={e => setForm(f => ({ ...f, numeroPiece: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
      </>
      )}
    </div>
  );
}
