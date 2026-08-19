import { useState, useRef } from 'react';
import { Plus, Maximize2, DoorOpen, ArrowLeft, Building2, Pencil, Upload, X, ChevronLeft, ChevronRight, ImagePlus, ExternalLink, Copy, Check } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { SkeletonPageHeader, SkeletonCardGrid } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { logementsApi, proprietairesApi, bauxApi, locatairesApi, maintenanceApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { Logement, Proprietaire, Bail, Locataire, Maintenance } from '../types';

// ── Cloudinary unsigned upload ────────────────────────────────────────────
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error('Upload Cloudinary échoué');
  const data = await res.json();
  return data.secure_url as string;
}

// ── Galerie de photos ─────────────────────────────────────────────────────
function PhotoGallery({
  photos,
  logementId,
  onUpdate,
}: {
  photos: string[];
  logementId: string;
  onUpdate: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadToCloudinary));
      const newPhotos = [...photos, ...urls];
      await logementsApi.update(logementId, { photos: newPhotos });
      onUpdate(newPhotos);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (idx: number) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    await logementsApi.update(logementId, { photos: newPhotos });
    onUpdate(newPhotos);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-base-100 border border-base-300">
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightbox(i)}
            />
            <button
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 btn btn-xs btn-circle bg-base-100/80 border-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Bouton ajouter */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-base-300 flex flex-col items-center justify-center gap-1 text-base-content/40 hover:border-primary hover:text-primary transition-colors"
        >
          {uploading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <ImagePlus size={20} />
              <span className="text-xs">Ajouter</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          {lightbox > 0 && (
            <button
              className="absolute left-4 btn btn-circle btn-ghost text-white"
              onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 1) - 1); }}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {lightbox < photos.length - 1 && (
            <button
              className="absolute right-4 btn btn-circle btn-ghost text-white"
              onClick={e => { e.stopPropagation(); setLightbox(l => (l ?? 0) + 1); }}
            >
              <ChevronRight size={24} />
            </button>
          )}
          <img
            src={photos[lightbox]}
            alt="Aperçu"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Upload inline dans le formulaire (avant création) ────────────────────
function PhotoUploadField({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadToCloudinary));
      onChange([...photos, ...urls]);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="text-sm font-medium mb-2 text-base-content/70">Photos</div>
      <div className="flex flex-wrap gap-2">
        {photos.map((url, i) => (
          <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-base-300">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
              className="absolute top-0.5 right-0.5 btn btn-xs btn-circle bg-base-100/80 border-0"
            >
              <X size={8} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-16 h-16 rounded-lg border-2 border-dashed border-base-300 flex items-center justify-center text-base-content/40 hover:border-primary hover:text-primary transition-colors"
        >
          {uploading ? <span className="loading loading-spinner loading-xs" /> : <Upload size={16} />}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}

// ── Labels ────────────────────────────────────────────────────────────────
const statutLabels = {
  occupe: { label: 'Occupé', variant: 'success' as const },
  libre: { label: 'Libre', variant: 'info' as const },
  en_travaux: { label: 'Travaux', variant: 'warning' as const },
};
const typeLabels: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  studio: 'Studio',
  local_commercial: 'Local commercial',
};

// ── Bouton copier lien (admin) ────────────────────────────────────────────
function CopyLinkAdminButton({ logementId }: { logementId: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const url = `${window.location.origin}/logements/${logementId}`;
    try { await navigator.clipboard.writeText(url); }
    catch { const el = document.createElement('textarea'); el.value = url; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="btn btn-sm btn-ghost border border-base-300 flex items-center gap-2"
      style={{ color: copied ? 'var(--color-success)' : undefined }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copié !' : 'Copier le lien'}
    </button>
  );
}

// ── Page principale ───────────────────────────────────────────────────────
export default function Logements() {
  const [selected, setSelected] = useState<Logement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatut, setFilterStatut] = useState('tous');
  const [editing, setEditing] = useState<Logement | null>(null);
  const [editForm, setEditForm] = useState({
    adresse: '', ville: '', codePostal: '', type: 'appartement',
    statut: 'libre', surface: '', nbPieces: '', loyer: '', charges: '',
    depotGarantie: '', proprietaireId: '',
  });
  const [form, setForm] = useState({
    adresse: '', ville: '', codePostal: '', type: 'appartement',
    statut: 'libre', surface: '', nbPieces: '', loyer: '', charges: '',
    depotGarantie: '', proprietaireId: '',
  });
  const [formPhotos, setFormPhotos] = useState<string[]>([]);

  const { data: logements, loading, refetch: refetchLogements } = useApi<Logement[]>(logementsApi.list, []);
  const { data: proprietaires } = useApi<Proprietaire[]>(proprietairesApi.list, []);
  const { data: allBaux } = useApi<Bail[]>(bauxApi.list, []);
  const { data: allLocataires } = useApi<Locataire[]>(locatairesApi.list, []);
  const { data: allMaintenances } = useApi<Maintenance[]>(maintenanceApi.list, []);

  const filtered = logements.filter(l =>
    filterStatut === 'tous' ? true : l.statut === filterStatut
  );

  const handleCreate = async () => {
    await logementsApi.create({
      proprietaireId: form.proprietaireId,
      adresse: form.adresse,
      ville: form.ville,
      codePostal: form.codePostal,
      type: form.type,
      statut: form.statut,
      surface: Number(form.surface),
      nbPieces: Number(form.nbPieces),
      loyer: Number(form.loyer),
      charges: Number(form.charges),
      depotGarantie: Number(form.depotGarantie),
      photos: formPhotos,
    });
    refetchLogements();
    setShowModal(false);
    setForm({ adresse: '', ville: '', codePostal: '', type: 'appartement', statut: 'libre', surface: '', nbPieces: '', loyer: '', charges: '', depotGarantie: '', proprietaireId: '' });
    setFormPhotos([]);
  };

  const startEdit = (l: Logement) => {
    setEditing(l);
    setEditForm({
      adresse: l.adresse, ville: l.ville, codePostal: l.codePostal,
      type: l.type, statut: l.statut, surface: String(l.surface),
      nbPieces: String(l.nbPieces), loyer: String(l.loyer),
      charges: String(l.charges), depotGarantie: String(l.depotGarantie),
      proprietaireId: l.proprietaireId,
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    await logementsApi.update(editing.id, {
      adresse: editForm.adresse, ville: editForm.ville, codePostal: editForm.codePostal,
      type: editForm.type, statut: editForm.statut,
      surface: Number(editForm.surface), nbPieces: Number(editForm.nbPieces),
      loyer: Number(editForm.loyer), charges: Number(editForm.charges),
      depotGarantie: Number(editForm.depotGarantie), proprietaireId: editForm.proprietaireId,
    });
    refetchLogements();
    setEditing(null);
    setSelected(prev => prev && prev.id === editing.id
      ? { ...prev, ...editForm, type: editForm.type as import('../types').LogementType, statut: editForm.statut as import('../types').LogementStatut, surface: Number(editForm.surface), nbPieces: Number(editForm.nbPieces), loyer: Number(editForm.loyer), charges: Number(editForm.charges), depotGarantie: Number(editForm.depotGarantie) }
      : prev
    );
  };

  // ── Vue détail ──────────────────────────────────────────────────────────
  if (selected) {
    const prop = proprietaires.find(p => p.id === selected.proprietaireId);
    const bailActif = allBaux.find(b => b.logementId === selected.id && (b.statut === 'actif' || b.statut === 'preavis'));
    const locataire = bailActif ? allLocataires.find(l => l.id === bailActif.locataireId) : null;
    const tickets = allMaintenances.filter(m => m.logementId === selected.id);
    const photos = (selected.photos ?? []) as string[];

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelected(null)} className="btn btn-sm btn-ghost border border-base-300 flex items-center gap-2">
            <ArrowLeft size={16} /> Retour
          </button>
          <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => startEdit(selected)}>
            Modifier
          </Button>
          {selected.statut === 'libre' && (
            <>
              <a
                href={`/logements/${selected.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost border border-base-300 flex items-center gap-2 text-primary"
              >
                <ExternalLink size={14} /> Voir page publique
              </a>
              <CopyLinkAdminButton logementId={selected.id} />
            </>
          )}
        </div>

        <PageHeader
          title={selected.adresse}
          subtitle={`${typeLabels[selected.type]} · ${selected.ville}`}
          breadcrumb="Logements"
          action={<Badge label={statutLabels[selected.statut].label} variant={statutLabels[selected.statut].variant} />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Caractéristiques */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">Caractéristiques</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Type', value: typeLabels[selected.type] },
                { label: 'Surface', value: `${selected.surface} m²` },
                { label: 'Pièces', value: selected.nbPieces },
                { label: 'Code postal', value: selected.codePostal },
                { label: 'Loyer', value: formatMontant(selected.loyer) },
                { label: 'Charges', value: formatMontant(selected.charges) },
                { label: 'Dépôt garantie', value: formatMontant(selected.depotGarantie) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-base-content/40">{label}</div>
                  <div className="text-sm font-semibold text-base-content">{value}</div>
                </div>
              ))}
            </div>
            {prop && (
              <div className="mt-4 pt-4 border-t border-base-300">
                <div className="text-xs mb-1 text-base-content/40">Propriétaire</div>
                <div className="text-sm font-semibold text-base-content">{prop.prenom} {prop.nom}</div>
                <div className="text-xs text-base-content/60">{prop.telephone}</div>
              </div>
            )}
          </Card>

          {/* Bail actif */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">Bail actif</h3>
            {bailActif && locataire ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-primary text-primary-content">
                    {locataire.prenom[0]}{locataire.nom[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-base-content">{locataire.prenom} {locataire.nom}</div>
                    <div className="text-xs text-base-content/40">{locataire.telephone}</div>
                  </div>
                </div>
                {[
                  { label: 'Type bail', value: bailActif.type === 'nu' ? 'Bail nu' : 'Bail meublé' },
                  { label: 'Début', value: formatDate(bailActif.dateDebut) },
                  { label: 'Loyer', value: formatMontant(bailActif.loyer) },
                  { label: 'Charges', value: formatMontant(bailActif.charges) },
                  { label: 'Échéance', value: `Le ${bailActif.jourEcheance} du mois` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-base-300">
                    <span className="text-sm text-base-content/60">{label}</span>
                    <span className="text-sm font-semibold text-base-content">{value}</span>
                  </div>
                ))}
                <Badge label={bailActif.statut === 'preavis' ? 'En préavis' : 'Actif'} variant={bailActif.statut === 'preavis' ? 'warning' : 'success'} />
              </div>
            ) : (
              <div className="py-8 text-center text-base-content/40">Aucun bail actif</div>
            )}
          </Card>

          {/* Maintenance */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">Maintenance ({tickets.length})</h3>
            {tickets.length === 0 ? (
              <div className="py-8 text-center text-base-content/40">Aucun ticket</div>
            ) : (
              <div className="flex flex-col gap-3">
                {tickets.map(t => (
                  <div key={t.id} className="p-3 rounded-xl bg-base-100 border border-base-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-base-content">{t.titre}</span>
                      <Badge label={t.priorite} variant={t.priorite === 'urgente' ? 'danger' : t.priorite === 'haute' ? 'warning' : 'info'} />
                    </div>
                    <div className="text-xs text-base-content/40">
                      {formatDate(t.dateSignalement)}{t.cout ? ` · ${formatMontant(t.cout)}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Galerie photos */}
        <Card className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-base-content/40">
            Photos ({photos.length})
          </h3>
          <PhotoGallery
            photos={photos}
            logementId={selected.id}
            onUpdate={urls => setSelected(s => s ? { ...s, photos: urls } : s)}
          />
        </Card>

        {/* Modal modifier */}
        <Modal open={!!editing} onClose={() => setEditing(null)} title="Modifier le logement">
          <div className="flex flex-col gap-4">
            <Input label="Adresse" value={editForm.adresse} onChange={e => setEditForm(f => ({ ...f, adresse: e.target.value }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Ville" value={editForm.ville} onChange={e => setEditForm(f => ({ ...f, ville: e.target.value }))} />
              <Input label="Code postal" value={editForm.codePostal} onChange={e => setEditForm(f => ({ ...f, codePostal: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Type" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                options={[{ value: 'appartement', label: 'Appartement' }, { value: 'maison', label: 'Maison' }, { value: 'studio', label: 'Studio' }, { value: 'local_commercial', label: 'Local commercial' }]} />
              <Select label="Statut" value={editForm.statut} onChange={e => setEditForm(f => ({ ...f, statut: e.target.value }))}
                options={[{ value: 'libre', label: 'Libre' }, { value: 'occupe', label: 'Occupé' }, { value: 'en_travaux', label: 'En travaux' }]} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Surface (m²)" type="number" value={editForm.surface} onChange={e => setEditForm(f => ({ ...f, surface: e.target.value }))} />
              <Input label="Nb pièces" type="number" value={editForm.nbPieces} onChange={e => setEditForm(f => ({ ...f, nbPieces: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Loyer (XAF)" type="number" value={editForm.loyer} onChange={e => setEditForm(f => ({ ...f, loyer: e.target.value }))} />
              <Input label="Charges (XAF)" type="number" value={editForm.charges} onChange={e => setEditForm(f => ({ ...f, charges: e.target.value }))} />
            </div>
            <Input label="Dépôt de garantie (XAF)" type="number" value={editForm.depotGarantie} onChange={e => setEditForm(f => ({ ...f, depotGarantie: e.target.value }))} />
            <Select label="Propriétaire" value={editForm.proprietaireId}
              onChange={e => setEditForm(f => ({ ...f, proprietaireId: e.target.value }))}
              options={[{ value: '', label: 'Sélectionner...' }, ...proprietaires.map(p => ({ value: p.id, label: `${p.prenom} ${p.nom}` }))]} />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Annuler</Button>
              <Button onClick={handleEdit}>Enregistrer</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ── Vue liste ───────────────────────────────────────────────────────────
  return (
    <div>
      {loading ? (
        <>
          <SkeletonPageHeader />
          <div className="flex flex-wrap gap-2 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-8 w-20 rounded-xl animate-pulse" style={{ background: 'var(--color-base-300)' }} />)}
          </div>
          <SkeletonCardGrid count={6} cols={3} cardHeight="260px" />
        </>
      ) : (
        <>
          <PageHeader
            title="Logements"
            subtitle={`${logements.length} logements dans le parc`}
            action={<Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Ajouter</Button>}
          />

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { value: 'tous', label: 'Tous' },
              { value: 'libre', label: 'Libres' },
              { value: 'occupe', label: 'Occupés' },
              { value: 'en_travaux', label: 'Travaux' },
            ].map(f => (
              <button key={f.value} onClick={() => setFilterStatut(f.value)}
                className={filterStatut === f.value ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}>
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-base-content/40">Aucun logement</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(l => {
              const prop = proprietaires.find(p => p.id === l.proprietaireId);
              const photos = (l.photos ?? []) as string[];
              const coverPhoto = photos[0];
              return (
                <div
                  key={l.id}
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] bg-base-200 border border-base-300"
                  onClick={() => setSelected(l)}
                >
                  {/* Cover photo */}
                  <div className="h-36 overflow-hidden bg-base-100 relative">
                    {coverPhoto ? (
                      <img src={coverPhoto} alt={l.adresse} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={40} className="text-base-300" />
                      </div>
                    )}
                    {photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded-full px-2 py-0.5">
                        +{photos.length - 1}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-base-content">{l.adresse}</div>
                        <div className="text-xs text-base-content/40">{l.ville}</div>
                      </div>
                      <Badge label={statutLabels[l.statut].label} variant={statutLabels[l.statut].variant} />
                    </div>
                    <div className="flex gap-4 text-sm mb-3 text-base-content/60">
                      <span className="flex items-center gap-1"><Maximize2 size={13} /> {l.surface}m²</span>
                      <span className="flex items-center gap-1"><DoorOpen size={13} /> {l.nbPieces}p</span>
                      <span className="capitalize">{typeLabels[l.type]}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-base-300">
                      <div>
                        <div className="text-xs text-base-content/40">Loyer</div>
                        <div className="font-bold text-primary">{formatMontant(l.loyer)}</div>
                      </div>
                      {prop && (
                        <div className="text-right">
                          <div className="text-xs text-base-content/40">Propriétaire</div>
                          <div className="text-sm text-base-content">{prop.prenom} {prop.nom}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal nouveau logement */}
          <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouveau logement">
            <div className="flex flex-col gap-4">
              <Input label="Adresse" placeholder="45 Rue Kakimbo"
                value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Ville" placeholder="Conakry"
                  value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
                <Input label="Code postal" placeholder="001"
                  value={form.codePostal} onChange={e => setForm(f => ({ ...f, codePostal: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  options={[{ value: 'appartement', label: 'Appartement' }, { value: 'maison', label: 'Maison' }, { value: 'studio', label: 'Studio' }, { value: 'local_commercial', label: 'Local commercial' }]} />
                <Select label="Statut" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}
                  options={[{ value: 'libre', label: 'Libre' }, { value: 'occupe', label: 'Occupé' }, { value: 'en_travaux', label: 'En travaux' }]} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Surface (m²)" type="number" placeholder="85"
                  value={form.surface} onChange={e => setForm(f => ({ ...f, surface: e.target.value }))} />
                <Input label="Nb pièces" type="number" placeholder="3"
                  value={form.nbPieces} onChange={e => setForm(f => ({ ...f, nbPieces: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Loyer (XAF)" type="number" placeholder="450000"
                  value={form.loyer} onChange={e => setForm(f => ({ ...f, loyer: e.target.value }))} />
                <Input label="Charges (XAF)" type="number" placeholder="50000"
                  value={form.charges} onChange={e => setForm(f => ({ ...f, charges: e.target.value }))} />
              </div>
              <Input label="Dépôt de garantie (XAF)" type="number" placeholder="900000"
                value={form.depotGarantie} onChange={e => setForm(f => ({ ...f, depotGarantie: e.target.value }))} />
              <Select label="Propriétaire" value={form.proprietaireId}
                onChange={e => setForm(f => ({ ...f, proprietaireId: e.target.value }))}
                options={[{ value: '', label: 'Sélectionner...' }, ...proprietaires.map(p => ({ value: p.id, label: `${p.prenom} ${p.nom}` }))]} />

              {/* Upload photos */}
              <PhotoUploadField photos={formPhotos} onChange={setFormPhotos} />

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
