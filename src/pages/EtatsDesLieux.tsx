import { useState } from 'react';
import { Plus, ArrowLeft, CheckCircle, Clock, Image } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { SkeletonPageHeader, SkeletonCardGrid } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { etatsDesLieuxApi, bauxApi, locatairesApi, logementsApi } from '../lib/api';
import { formatDate } from '../lib/utils';
import type { EtatDesLieux, PieceEDL, Bail, Locataire, Logement } from '../types';

const etatConfig = {
  bon: { label: 'Bon état', variant: 'success' as const },
  usage: { label: 'Usage normal', variant: 'info' as const },
  degrade: { label: 'Dégradé', variant: 'warning' as const },
  manquant: { label: 'Manquant', variant: 'danger' as const },
};

const pieceDefaut: PieceEDL = { nom: '', etat: 'bon', observations: '', photos: [] };

export default function EtatsDesLieux() {
  const [selected, setSelected] = useState<EtatDesLieux | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pieces, setPieces] = useState<PieceEDL[]>([
    { ...pieceDefaut, nom: 'Entrée' },
    { ...pieceDefaut, nom: 'Séjour' },
  ]);
  const [edlForm, setEdlForm] = useState({ bailId: '', type: 'entree', date: '' });

  const { data: etatsDesLieux, loading, refetch: refetchEdl } = useApi<EtatDesLieux[]>(etatsDesLieuxApi.list, []);
  const { data: allBaux } = useApi<Bail[]>(bauxApi.list, []);
  const { data: allLocataires } = useApi<Locataire[]>(locatairesApi.list, []);
  const { data: allLogements } = useApi<Logement[]>(logementsApi.list, []);

  const getBail = (id: string) => allBaux.find(b => b.id === id);
  const getLocataire = (id: string) => allLocataires.find(l => l.id === id);
  const getLogement = (id: string) => allLogements.find(l => l.id === id);

  const addPiece = () => setPieces(p => [...p, { ...pieceDefaut }]);

  const handleCreate = async () => {
    await etatsDesLieuxApi.create({
      ...edlForm,
      pieces,
      observations: '',
      signatureLocataire: false,
      signatureAgent: false,
    });
    refetchEdl();
    setShowModal(false);
    setPieces([{ ...pieceDefaut, nom: 'Entrée' }, { ...pieceDefaut, nom: 'Séjour' }]);
  };

  const activeBaux = allBaux.filter(b => b.statut === 'actif' || b.statut === 'preavis');

  if (selected) {
    const bail = getBail(selected.bailId);
    const loc = bail ? getLocataire(bail.locataireId) : null;
    const log = bail ? getLogement(bail.logementId) : null;

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelected(null)}
            className="btn btn-sm btn-ghost border border-base-300 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Retour
          </button>
        </div>

        <PageHeader
          title={`EDL ${selected.type === 'entree' ? "d'entrée" : 'de sortie'}`}
          subtitle={`${loc?.prenom} ${loc?.nom} — ${log?.adresse}`}
          breadcrumb="États des lieux"
          action={
            <Badge
              label={selected.type === 'entree' ? 'Entrée' : 'Sortie'}
              variant={selected.type === 'entree' ? 'success' : 'warning'}
            />
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-base-content/40">
              Informations
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Date', value: formatDate(selected.date) },
                { label: 'Locataire', value: `${loc?.prenom} ${loc?.nom}` },
                { label: 'Logement', value: log?.adresse ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="py-2 text-sm border-b border-base-300">
                  <div className="text-xs mb-0.5 text-base-content/40">{label}</div>
                  <div className="text-base-content">{value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-base-content/40">
              Signatures
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Signature locataire', done: selected.signatureLocataire },
                { label: 'Signature agent', done: selected.signatureAgent },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-base-content/60">{label}</span>
                  {done
                    ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle size={14} /> Signé</span>
                    : <span className="flex items-center gap-1 text-xs text-warning"><Clock size={14} /> En attente</span>
                  }
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-base-content/40">
              Résumé
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(
                selected.pieces.reduce((acc, p) => {
                  acc[p.etat] = (acc[p.etat] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([etat, count]) => (
                <div key={etat} className="flex items-center justify-between text-sm">
                  <Badge label={etatConfig[etat as keyof typeof etatConfig]?.label ?? etat} variant={etatConfig[etat as keyof typeof etatConfig]?.variant ?? 'neutral'} />
                  <span className="font-bold text-base-content">{count} pièce{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
            {selected.observations && (
              <div className="mt-3 pt-3 border-t border-base-300">
                <div className="text-xs mb-1 text-base-content/40">Observations générales</div>
                <div className="text-sm text-base-content/60">{selected.observations}</div>
              </div>
            )}
          </Card>
        </div>

        <h3 className="text-sm font-bold text-base-content mb-4">Détail par pièce ({selected.pieces.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selected.pieces.map((piece, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-base-content">{piece.nom}</h4>
                <Badge label={etatConfig[piece.etat].label} variant={etatConfig[piece.etat].variant} />
              </div>
              <div className="h-24 rounded-xl flex items-center justify-center mb-3 bg-base-100">
                <Image size={24} className="text-base-300" />
              </div>
              <p className="text-sm text-base-content/60">
                {piece.observations || 'Aucune observation'}
              </p>
            </Card>
          ))}
        </div>
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
        title="États des lieux"
        subtitle={`${etatsDesLieux.length} états des lieux`}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Nouvel EDL
          </Button>
        }
      />

      {etatsDesLieux.length === 0 ? (
        <div className="text-center py-20 text-base-content/40">
          Aucun état des lieux enregistré
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {etatsDesLieux.map(edl => {
            const bail = getBail(edl.bailId);
            const loc = bail ? getLocataire(bail.locataireId) : null;
            const log = bail ? getLogement(bail.logementId) : null;
            const bonEtat = edl.pieces.filter(p => p.etat === 'bon').length;

            return (
              <div
                key={edl.id}
                className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] bg-base-200 border border-base-300"
                onClick={() => setSelected(edl)}
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge
                    label={edl.type === 'entree' ? "EDL Entrée" : 'EDL Sortie'}
                    variant={edl.type === 'entree' ? 'success' : 'warning'}
                  />
                  <span className="text-xs text-base-content/40">{formatDate(edl.date)}</span>
                </div>
                <div className="font-bold text-base-content mb-1">{loc?.prenom} {loc?.nom}</div>
                <div className="text-xs mb-4 text-base-content/40">{log?.adresse}</div>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-base-300">
                  <span className="text-base-content/60">{edl.pieces.length} pièces</span>
                  <span className="text-success">{bonEtat}/{edl.pieces.length} bon état</span>
                </div>
                <div className="flex gap-3 mt-2">
                  {edl.signatureLocataire && edl.signatureAgent ? (
                    <Badge label="Signé" variant="success" />
                  ) : (
                    <Badge label="Signature en attente" variant="warning" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvel état des lieux" width="680px">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Bail concerné" value={edlForm.bailId}
              onChange={e => setEdlForm(f => ({ ...f, bailId: e.target.value }))}
              options={[
                { value: '', label: 'Sélectionner...' },
                ...activeBaux.map(b => {
                  const loc = getLocataire(b.locataireId);
                  const log = getLogement(b.logementId);
                  return { value: b.id, label: loc && log ? `${loc.prenom} ${loc.nom} — ${log.adresse}` : b.id };
                }),
              ]} />
            <Select label="Type" value={edlForm.type}
              onChange={e => setEdlForm(f => ({ ...f, type: e.target.value }))}
              options={[
                { value: 'entree', label: "État des lieux d'entrée" },
                { value: 'sortie', label: 'État des lieux de sortie' },
              ]} />
          </div>
          <Input label="Date de l'EDL" type="date"
            value={edlForm.date} onChange={e => setEdlForm(f => ({ ...f, date: e.target.value }))} />

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                Pièces
              </label>
              <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={addPiece}>
                Ajouter pièce
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {pieces.map((piece, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-base-100 border border-base-300">
                  <Input placeholder="Nom pièce" value={piece.nom} onChange={e => {
                    const next = [...pieces];
                    next[i] = { ...next[i], nom: e.target.value };
                    setPieces(next);
                  }} />
                  <Select
                    value={piece.etat}
                    options={[
                      { value: 'bon', label: 'Bon état' },
                      { value: 'usage', label: 'Usage normal' },
                      { value: 'degrade', label: 'Dégradé' },
                      { value: 'manquant', label: 'Manquant' },
                    ]}
                    onChange={e => {
                      const next = [...pieces];
                      next[i] = { ...next[i], etat: e.target.value as PieceEDL['etat'] };
                      setPieces(next);
                    }}
                  />
                  <Input placeholder="Observations" value={piece.observations} onChange={e => {
                    const next = [...pieces];
                    next[i] = { ...next[i], observations: e.target.value };
                    setPieces(next);
                  }} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Enregistrer l'EDL</Button>
          </div>
        </div>
      </Modal>
      </>
      )}
    </div>
  );
}
