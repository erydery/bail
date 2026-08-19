import { useState } from 'react';
import { Plus, ArrowLeft, CheckCircle, XCircle, FileText, Pencil } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { SkeletonPageHeader, SkeletonCardGrid } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { candidaturesApi, logementsApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { Candidature, CandidatureStatut, Logement } from '../types';

const statutConfig: Record<CandidatureStatut, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' }> = {
  en_attente: { label: 'En attente', variant: 'warning' },
  en_etude: { label: 'En étude', variant: 'info' },
  acceptee: { label: 'Acceptée', variant: 'success' },
  refusee: { label: 'Refusée', variant: 'danger' },
};

export default function Candidatures() {
  const [selected, setSelected] = useState<Candidature | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [form, setForm] = useState({
    logementId: '', prenom: '', nom: '', email: '',
    telephone: '', revenus: '', employeur: '',
  });
  const [editing, setEditing] = useState<Candidature | null>(null);
  const [editForm, setEditForm] = useState({
    statut: 'en_attente', notes: '', employeur: '', revenus: '',
  });

  const { data: candidatures, loading, refetch: refetchCandidatures } = useApi<Candidature[]>(candidaturesApi.list, []);
  const { data: allLogements } = useApi<Logement[]>(logementsApi.list, []);

  const getLogement = (id: string) => allLogements.find(l => l.id === id);

  const filtered = candidatures.filter(c =>
    filterStatut === 'tous' ? true : c.statut === filterStatut
  );

  const handleCreate = async () => {
    const revenus = Number(form.revenus);
    const logement = getLogement(form.logementId);
    const loyer = logement ? logement.loyer + logement.charges : 0;
    const tauxEffort = revenus > 0 && loyer > 0 ? Math.round((loyer / revenus) * 100) : 0;
    await candidaturesApi.create({ ...form, revenus, tauxEffort, documents: [] });
    refetchCandidatures();
    setShowModal(false);
  };

  const handleDecision = async (statut: 'acceptee' | 'refusee') => {
    if (!selected) return;
    await candidaturesApi.update(selected.id, { statut });
    refetchCandidatures();
    setSelected(prev => prev ? { ...prev, statut } : null);
  };

  const startEdit = (c: Candidature) => {
    setEditing(c);
    setEditForm({
      statut: c.statut,
      notes: c.notes ?? '',
      employeur: c.employeur,
      revenus: String(c.revenus),
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    await candidaturesApi.update(editing.id, {
      statut: editForm.statut,
      employeur: editForm.employeur,
      revenus: Number(editForm.revenus),
      ...(editForm.notes.trim() ? { notes: editForm.notes.trim() } : {}),
    });
    refetchCandidatures();
    setEditing(null);
    setSelected(prev => prev && prev.id === editing.id
      ? { ...prev, statut: editForm.statut as CandidatureStatut, employeur: editForm.employeur, revenus: Number(editForm.revenus), notes: editForm.notes || prev.notes }
      : prev
    );
  };

  if (selected) {
    const log = getLogement(selected.logementId);
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
          <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => startEdit(selected)}>
            Modifier
          </Button>
        </div>

        <PageHeader
          title={`${selected.prenom} ${selected.nom}`}
          subtitle={`Candidature pour ${log?.adresse}`}
          breadcrumb="Candidatures"
          action={<Badge label={s.label} variant={s.variant} />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
              Dossier candidat
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Email', value: selected.email },
                { label: 'Téléphone', value: selected.telephone },
                { label: 'Employeur', value: selected.employeur },
                { label: 'Revenus mensuels', value: formatMontant(selected.revenus) },
                { label: 'Date candidature', value: formatDate(selected.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="py-2 border-b border-base-300">
                  <div className="text-xs text-base-content/40">{label}</div>
                  <div className="text-sm font-medium text-base-content">{value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
              Analyse financière
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-base-content/60">Taux d'effort</span>
                  <span
                    className={`font-bold ${Number(selected.tauxEffort) > 40 ? 'text-error' : Number(selected.tauxEffort) > 33 ? 'text-warning' : 'text-success'}`}
                  >
                    {selected.tauxEffort}%
                  </span>
                </div>
                <div className="w-full rounded-full h-3 bg-base-300">
                  <div
                    className={`h-3 rounded-full transition-all ${Number(selected.tauxEffort) > 40 ? 'bg-error' : Number(selected.tauxEffort) > 33 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${Math.min(Number(selected.tauxEffort), 100)}%` }}
                  />
                </div>
                <div className="text-xs mt-1 text-base-content/40">
                  {selected.tauxEffort <= 33 ? '✓ Acceptable (≤33%)' :
                   selected.tauxEffort <= 40 ? '⚠ Limite (33-40%)' : '✗ Trop élevé (>40%)'}
                </div>
              </div>

              {log && (
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Loyer demandé', value: formatMontant(log.loyer + log.charges) },
                    { label: 'Revenus × 3', value: formatMontant(selected.revenus * 3) },
                    { label: 'Éligible ×3', value: selected.revenus * 3 >= (log.loyer + log.charges) ? 'Oui ✓' : 'Non ✗' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm py-1 border-b border-base-300">
                      <span className="text-base-content/60">{label}</span>
                      <span className="font-medium text-base-content">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {selected.garant && (
                <div className="p-3 rounded-xl bg-base-100 border border-base-300">
                  <div className="text-xs font-bold mb-2 text-base-content/40">GARANT</div>
                  <div className="text-sm font-semibold text-base-content">{selected.garant.prenom} {selected.garant.nom}</div>
                  {'revenus' in selected.garant && (
                    <div className="text-xs text-base-content/60">Revenus: {formatMontant((selected.garant as any).revenus)}</div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
                Documents fournis
              </h3>
              {selected.documents.length === 0 ? (
                <div className="text-sm py-4 text-center text-base-content/40">
                  Aucun document
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {selected.documents.map(doc => (
                    <div key={doc} className="flex items-center gap-2 p-2 rounded-lg bg-base-100">
                      <FileText size={14} className="text-primary" />
                      <span className="text-sm text-base-content">{doc}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {selected.notes && (
              <Card>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-base-content/40">
                  Notes
                </h3>
                <p className="text-sm text-base-content/60">{selected.notes}</p>
              </Card>
            )}

            {(selected.statut === 'en_attente' || selected.statut === 'en_etude') && (
              <Card>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
                  Décision
                </h3>
                <div className="flex flex-col gap-2">
                  <Button icon={<CheckCircle size={16} />} className="w-full justify-center"
                    onClick={() => handleDecision('acceptee')}>
                    Accepter
                  </Button>
                  <Button variant="danger" icon={<XCircle size={16} />} className="w-full justify-center"
                    onClick={() => handleDecision('refusee')}>
                    Refuser
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier la candidature">
          <div className="flex flex-col gap-4">
            <Select label="Statut" value={editForm.statut} onChange={e => setEditForm(f => ({ ...f, statut: e.target.value }))}
              options={[
                { value: 'en_attente', label: 'En attente' },
                { value: 'en_etude', label: 'En étude' },
                { value: 'acceptee', label: 'Acceptée' },
                { value: 'refusee', label: 'Refusée' },
              ]} />
            <Input label="Employeur" value={editForm.employeur} onChange={e => setEditForm(f => ({ ...f, employeur: e.target.value }))} />
            <Input label="Revenus mensuels (XAF)" type="number" value={editForm.revenus} onChange={e => setEditForm(f => ({ ...f, revenus: e.target.value }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-base-content)', opacity: 0.55 }}>Notes</label>
              <textarea
                rows={3}
                value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none bg-base-100 border border-base-300 text-base-content"
              />
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
          <div className="flex flex-wrap gap-2 mb-6">
            {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-24 rounded-xl animate-pulse" style={{ background: 'var(--color-base-300)' }} />)}
          </div>
          <SkeletonCardGrid count={6} cols={3} cardHeight="200px" />
        </>
      ) : (
      <>
      <PageHeader
        title="Candidatures"
        subtitle={`${candidatures.length} dossiers`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Nouvelle candidature
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'tous', label: 'Toutes' },
          { value: 'en_attente', label: 'En attente' },
          { value: 'en_etude', label: 'En étude' },
          { value: 'acceptee', label: 'Acceptées' },
          { value: 'refusee', label: 'Refusées' },
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

      {filtered.length === 0 && (
        <div className="text-center py-20 text-base-content/40">Aucune candidature</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const log = getLogement(c.logementId);
          const s = statutConfig[c.statut];
          return (
            <div
              key={c.id}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] bg-base-200 border border-base-300"
              onClick={() => setSelected(c)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold bg-primary text-primary-content">
                    {c.prenom[0]}{c.nom[0]}
                  </div>
                  <div>
                    <div className="font-bold text-base-content">{c.prenom} {c.nom}</div>
                    <div className="text-xs text-base-content/40">{c.employeur}</div>
                  </div>
                </div>
                <Badge label={s.label} variant={s.variant} />
              </div>

              <div className="text-sm mb-3 p-2 rounded-lg bg-base-100">
                <span className="text-base-content/40">Logement: </span>
                <span className="text-base-content">{log?.adresse ?? '—'}</span>
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-xs text-base-content/40">Revenus</div>
                  <div className="font-bold text-primary">{formatMontant(c.revenus)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-base-content/40">Taux effort</div>
                  <div className={`font-bold ${Number(c.tauxEffort) > 40 ? 'text-error' : Number(c.tauxEffort) > 33 ? 'text-warning' : 'text-success'}`}>
                    {c.tauxEffort}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-base-content/40">Docs</div>
                  <div className="font-bold text-base-content">{c.documents.length}</div>
                </div>
              </div>
              <div className="text-xs mt-2 text-base-content/40">
                {formatDate(c.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvelle candidature">
        <div className="flex flex-col gap-4">
          <Select label="Logement" value={form.logementId}
            onChange={e => setForm(f => ({ ...f, logementId: e.target.value }))}
            options={[
              { value: '', label: 'Sélectionner un logement...' },
              ...allLogements.filter(l => l.statut === 'libre').map(l => ({
                value: l.id,
                label: `${l.adresse} (${l.type})`,
              })),
            ]} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Prénom" placeholder="Kadiatou"
              value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            <Input label="Nom" placeholder="Diallo"
              value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
          </div>
          <Input label="Email" type="email" placeholder="email@exemple.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Téléphone" placeholder="+224 6XX XX XX XX"
            value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Revenus mensuels (XAF)" type="number" placeholder="600000"
              value={form.revenus} onChange={e => setForm(f => ({ ...f, revenus: e.target.value }))} />
            <Input label="Employeur" placeholder="Ministère de..."
              value={form.employeur} onChange={e => setForm(f => ({ ...f, employeur: e.target.value }))} />
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
