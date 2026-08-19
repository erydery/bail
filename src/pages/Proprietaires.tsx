import { useState } from 'react';
import { Plus, Mail, Phone, Building2, Percent, ArrowLeft, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { SkeletonPageHeader, SkeletonCardGrid } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { proprietairesApi, logementsApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { Proprietaire, Logement } from '../types';

export default function Proprietaires() {
  const [selected, setSelected] = useState<Proprietaire | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse: '', iban: '', commissionTaux: '8',
  });
  const [editing, setEditing] = useState<Proprietaire | null>(null);
  const [editForm, setEditForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    adresse: '', iban: '', commissionTaux: '8',
  });

  const { data: proprietaires, loading, refetch: refetchProprietaires } = useApi<Proprietaire[]>(proprietairesApi.list, []);
  const { data: allLogements } = useApi<Logement[]>(logementsApi.list, []);

  const getLogementsByProprietaire = (propId: string) =>
    allLogements.filter(l => l.proprietaireId === propId);

  const handleCreate = async () => {
    await proprietairesApi.create({
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      adresse: form.adresse,
      commissionTaux: Number(form.commissionTaux),
      ...(form.iban.trim() ? { iban: form.iban.trim() } : {}),
    });
    refetchProprietaires();
    setShowModal(false);
    setForm({ prenom: '', nom: '', email: '', telephone: '', adresse: '', iban: '', commissionTaux: '8' });
  };

  const startEdit = (p: Proprietaire) => {
    setEditing(p);
    setEditForm({
      prenom: p.prenom,
      nom: p.nom,
      email: p.email,
      telephone: p.telephone,
      adresse: p.adresse,
      iban: p.iban ?? '',
      commissionTaux: String(p.commissionTaux),
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    await proprietairesApi.update(editing.id, {
      prenom: editForm.prenom,
      nom: editForm.nom,
      email: editForm.email,
      telephone: editForm.telephone,
      adresse: editForm.adresse,
      commissionTaux: Number(editForm.commissionTaux),
      ...(editForm.iban.trim() ? { iban: editForm.iban.trim() } : {}),
    });
    refetchProprietaires();
    setEditing(null);
    setSelected(prev => prev && prev.id === editing.id
      ? { ...prev, ...editForm, commissionTaux: Number(editForm.commissionTaux) }
      : prev
    );
  };

  if (selected) {
    const logs = getLogementsByProprietaire(selected.id);
    const totalLoyers = logs.reduce((sum, l) => sum + l.loyer, 0);
    const logementsOccupes = logs.filter(l => l.statut === 'occupe').length;

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
          subtitle="Fiche propriétaire"
          breadcrumb="Propriétaires"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-sm font-bold text-base-content/40 mb-4 uppercase tracking-wider">
              Coordonnées
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <span className="text-sm text-base-content">{selected.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                <span className="text-sm text-base-content">{selected.telephone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 size={16} className="text-primary" />
                <span className="text-sm text-base-content">{selected.adresse}</span>
              </div>
              <div className="flex items-center gap-3">
                <Percent size={16} className="text-primary" />
                <span className="text-sm text-base-content">Commission : {selected.commissionTaux}%</span>
              </div>
            </div>
            {selected.iban && (
              <div className="mt-4 pt-4 border-t border-base-300">
                <div className="text-xs mb-1 text-base-content/40">IBAN</div>
                <div className="text-sm font-mono text-base-content">{selected.iban}</div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-base-300">
              <div className="text-xs mb-1 text-base-content/40">Client depuis</div>
              <div className="text-sm text-base-content">{formatDate(selected.createdAt)}</div>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-base-content/40">
                Logements
              </div>
              <div className="text-3xl font-bold text-base-content">{logs.length}</div>
              <div className="text-sm mt-1 text-base-content/60">
                {logementsOccupes} occupés · {logs.length - logementsOccupes} libres
              </div>
            </Card>
            <Card>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-base-content/40">
                Loyers totaux / mois
              </div>
              <div className="text-2xl font-bold text-base-content">{formatMontant(totalLoyers)}</div>
            </Card>
            <Card>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-base-content/40">
                Commission mensuelle estimée
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatMontant(Math.round(totalLoyers * selected.commissionTaux / 100))}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-base-content/40">
              Ses logements
            </h3>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-base-content/40">Aucun logement</div>
            ) : (
              <div className="flex flex-col gap-3">
                {logs.map(l => (
                  <div key={l.id} className="p-3 rounded-xl bg-base-100 border border-base-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-base-content">{l.adresse}</span>
                      <Badge
                        label={l.statut === 'occupe' ? 'Occupé' : l.statut === 'libre' ? 'Libre' : 'Travaux'}
                        variant={l.statut === 'occupe' ? 'success' : l.statut === 'libre' ? 'info' : 'warning'}
                      />
                    </div>
                    <div className="text-xs text-base-content/40">
                      {l.surface}m² · {l.nbPieces} pièces · {formatMontant(l.loyer)}/mois
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le propriétaire">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Prénom" value={editForm.prenom} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} />
              <Input label="Nom" value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <Input label="Email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Téléphone" value={editForm.telephone} onChange={e => setEditForm(f => ({ ...f, telephone: e.target.value }))} />
            <Input label="Adresse" value={editForm.adresse} onChange={e => setEditForm(f => ({ ...f, adresse: e.target.value }))} />
            <Input label="IBAN" value={editForm.iban} onChange={e => setEditForm(f => ({ ...f, iban: e.target.value }))} />
            <Input label="Taux de commission (%)" type="number" value={editForm.commissionTaux} onChange={e => setEditForm(f => ({ ...f, commissionTaux: e.target.value }))} />
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
          <SkeletonCardGrid count={6} cols={3} cardHeight="180px" />
        </>
      ) : (
      <>
      <PageHeader
        title="Propriétaires"
        subtitle={`${proprietaires.length} propriétaires gérés`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Ajouter
          </Button>
        }
      />

      {proprietaires.length === 0 && (
        <div className="text-center py-20 text-base-content/40">Aucun propriétaire</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proprietaires.map(p => {
          const logs = getLogementsByProprietaire(p.id);
          const occupe = logs.filter(l => l.statut === 'occupe').length;
          const total = logs.reduce((s, l) => s + l.loyer, 0);
          return (
            <div
              key={p.id}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] bg-base-200 border border-base-300"
              onClick={() => setSelected(p)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold bg-primary text-primary-content">
                    {p.prenom[0]}{p.nom[0]}
                  </div>
                  <div>
                    <div className="font-bold text-base-content">{p.prenom} {p.nom}</div>
                    <div className="text-xs text-base-content/40">Commission {p.commissionTaux}%</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm mb-4 text-base-content/60">
                <div className="flex items-center gap-2">
                  <Mail size={13} /> {p.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} /> {p.telephone}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-base-300">
                <div>
                  <div className="text-xs text-base-content/40">Logements</div>
                  <div className="text-sm font-bold text-base-content">{occupe}/{logs.length} occupés</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-base-content/40">Loyers/mois</div>
                  <div className="text-sm font-bold text-primary">{formatMontant(total)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouveau propriétaire">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Prénom" placeholder="Ibrahim"
              value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            <Input label="Nom" placeholder="Camara"
              value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          </div>
          <Input label="Email" type="email" placeholder="email@exemple.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Téléphone" placeholder="+224 6XX XX XX XX"
            value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
          <Input label="Adresse" placeholder="12 Rue des Palmiers, Conakry"
            value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
          <Input label="IBAN" placeholder="GN00 XXXX XXXX XXXX XXXX"
            value={form.iban} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))} />
          <Input label="Taux de commission (%)" type="number" placeholder="8"
            value={form.commissionTaux} onChange={e => setForm(f => ({ ...f, commissionTaux: e.target.value }))} />
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
