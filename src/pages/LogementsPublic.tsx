import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Maximize2, BedDouble, Zap,
  ChevronRight, X, CheckCircle2, Search, SlidersHorizontal,
  ArrowLeft, Phone, Mail, User, Link2, Copy, Check,
} from 'lucide-react';
import type { Logement } from '../types';

// Type enrichi avec les infos du propriétaire
interface LogementPublic extends Logement {
  proprietaire?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function formatMontant(n: number) {
  return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);
}

const TYPE_LABELS: Record<string, string> = {
  appartement:      'Appartement',
  maison:           'Maison',
  studio:           'Studio',
  local_commercial: 'Local commercial',
};

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';

// ── Formulaire de candidature ─────────────────────────────────────────────────
interface CandidatureForm {
  nom: string; prenom: string; email: string; telephone: string;
  revenus: string; employeur: string;
  hasGarant: boolean;
  garantNom: string; garantPrenom: string; garantRevenus: string;
  notes: string;
}

const EMPTY_FORM: CandidatureForm = {
  nom: '', prenom: '', email: '', telephone: '',
  revenus: '', employeur: '',
  hasGarant: false,
  garantNom: '', garantPrenom: '', garantRevenus: '',
  notes: '',
};

function ModalCandidature({
  logement,
  onClose,
}: {
  logement: LogementPublic;
  onClose: () => void;
}) {
  const [form, setForm]       = useState<CandidatureForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: keyof CandidatureForm, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.telephone || !form.revenus || !form.employeur) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        logementId: logement.id,
        nom:        form.nom,
        prenom:     form.prenom,
        email:      form.email,
        telephone:  form.telephone,
        revenus:    Number(form.revenus),
        employeur:  form.employeur,
        notes:      form.notes || undefined,
      };
      if (form.hasGarant && form.garantNom && form.garantPrenom && form.garantRevenus) {
        body.garant = {
          nom:     form.garantNom,
          prenom:  form.garantPrenom,
          revenus: Number(form.garantRevenus),
        };
      }
      const res = await fetch(`${BASE}/api/public/candidatures`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Erreur inconnue');
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-y-auto"
        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <h2 className="font-bold text-white text-lg">Postuler pour ce logement</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {logement.adresse} — {formatMontant(logement.loyer)}/mois
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <CheckCircle2 size={48} color="#22c55e" />
            <h3 className="font-bold text-white text-xl">Candidature envoyée !</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Votre dossier a été transmis. Nous vous contacterons sous 48h.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: '#22c55e', color: '#fff' }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-5">
            {/* Infos personnelles */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#22c55e' }}>
                Informations personnelles
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(['prenom', 'nom'] as const).map(k => (
                  <div key={k}>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {k === 'prenom' ? 'Prénom *' : 'Nom *'}
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder={k === 'prenom' ? 'Jean' : 'Dupont'}
                      value={form[k]}
                      onChange={e => set(k, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Email *</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="jean@email.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Téléphone *</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="+237 6XX XXX XXX"
                    value={form.telephone}
                    onChange={e => set('telephone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Situation professionnelle */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#22c55e' }}>
                Situation professionnelle
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Employeur *</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Nom de l'entreprise"
                    value={form.employeur}
                    onChange={e => set('employeur', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Revenus mensuels (XAF) *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="350000"
                    value={form.revenus}
                    onChange={e => set('revenus', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Garant (optionnel) */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={form.hasGarant}
                  onChange={e => set('hasGarant', e.target.checked)}
                  className="accent-green-500 w-4 h-4"
                />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#22c55e' }}>
                  Ajouter un garant
                </span>
              </label>
              {form.hasGarant && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Prénom garant</label>
                    <input
                      className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      value={form.garantPrenom}
                      onChange={e => set('garantPrenom', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Nom garant</label>
                    <input
                      className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      value={form.garantNom}
                      onChange={e => set('garantNom', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Revenus garant</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      value={form.garantRevenus}
                      onChange={e => set('garantRevenus', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Message optionnel */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Message (optionnel)
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="Présentez-vous brièvement..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{ background: '#22c55e', color: '#fff', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Envoi...' : 'Envoyer ma candidature'}
                {!loading && <ChevronRight size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bouton copier le lien ─────────────────────────────────────────────────────
function CopyLinkButton({ logementId }: { logementId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/logements/${logementId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback pour les navigateurs sans clipboard API
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
      style={{
        background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
        color: copied ? '#22c55e' : 'rgba(255,255,255,0.7)',
      }}
      title="Copier le lien pour partager"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Lien copié !' : 'Copier le lien'}
    </button>
  );
}

// ── Détail logement ───────────────────────────────────────────────────────────
function DetailLogement({
  logement,
  onBack,
  onCandidater,
}: {
  logement: LogementPublic;
  onBack: () => void;
  onCandidater: () => void;
}) {
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = logement.photos.length > 0 ? logement.photos : [PLACEHOLDER_IMG];

  return (
    <div className="min-h-screen" style={{ background: '#111', color: '#fff' }}>
      {/* Navbar simplifiée */}
      <div className="sticky top-0 z-40 px-6 h-16 flex items-center justify-between"
        style={{ background: 'rgba(17,17,17,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <ArrowLeft size={16} /> Retour aux logements
        </button>
        <div className="flex items-center gap-2">
          <CopyLinkButton logementId={logement.id} />
          <button
            onClick={onCandidater}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
            style={{ background: '#22c55e', color: '#fff' }}
          >
            Postuler <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Galerie photos */}
        <div className="mb-8">
          <div className="rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: '16/7' }}>
            <img
              src={photos[activePhoto]}
              alt={logement.adresse}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
            />
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className="flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all"
                  style={{ border: activePhoto === i ? '2px solid #22c55e' : '2px solid transparent' }}
                >
                  <img src={p} alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Infos principales */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                  {TYPE_LABELS[logement.type]}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  Disponible
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mb-1">{logement.adresse}</h1>
              <p className="flex items-center gap-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <MapPin size={14} /> {logement.ville} {logement.codePostal}
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Maximize2 size={16} />, label: 'Surface', val: `${logement.surface} m²` },
                { icon: <BedDouble size={16} />, label: 'Pièces', val: `${logement.nbPieces} pièce${logement.nbPieces > 1 ? 's' : ''}` },
                { icon: <Building2 size={16} />, label: 'Type', val: TYPE_LABELS[logement.type] },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex justify-center mb-1" style={{ color: '#22c55e' }}>{item.icon}</div>
                  <div className="text-white font-bold text-sm">{item.val}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {logement.description && (
              <div>
                <h3 className="font-bold text-white mb-2">Description</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {logement.description}
                </p>
              </div>
            )}

            {/* Infos contact propriétaire */}
            {logement.proprietaire && (
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <h3 className="font-bold text-white mb-4 text-sm">Contact</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                    {logement.proprietaire.prenom[0]}{logement.proprietaire.nom[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {logement.proprietaire.prenom} {logement.proprietaire.nom}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Propriétaire</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <a href={`tel:${logement.proprietaire.telephone}`}
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
                    <Phone size={14} style={{ color: '#22c55e' }} />
                    {logement.proprietaire.telephone}
                  </a>
                  <a href={`mailto:${logement.proprietaire.email}`}
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
                    <Mail size={14} style={{ color: '#22c55e' }} />
                    {logement.proprietaire.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Panneau latéral — prix + CTA */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-6 sticky top-24"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="mb-4">
                <div className="text-3xl font-black text-white">{formatMontant(logement.loyer)}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>par mois (hors charges)</div>
              </div>
              <div className="flex flex-col gap-2 mb-5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <div className="flex justify-between">
                  <span>Charges</span>
                  <span className="text-white font-medium">{formatMontant(logement.charges)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dépôt de garantie</span>
                  <span className="text-white font-medium">{formatMontant(logement.depotGarantie)}</span>
                </div>
                <div className="flex justify-between border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <span className="font-semibold text-white">Total 1er mois</span>
                  <span className="text-white font-bold">
                    {formatMontant(logement.loyer + logement.charges + logement.depotGarantie)}
                  </span>
                </div>
              </div>
              <button
                onClick={onCandidater}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#22c55e', color: '#fff', boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#16a34a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#22c55e')}
              >
                Postuler maintenant
              </button>
              <div className="flex flex-col gap-2 mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <div className="flex items-center gap-2"><User size={12} /><span>Réponse sous 48h</span></div>
                <div className="flex items-center gap-2"><Phone size={12} /><span>Contact téléphonique possible</span></div>
                <div className="flex items-center gap-2"><Mail size={12} /><span>Confirmation par email</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function LogementsPublic() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [logements, setLogements]       = useState<LogementPublic[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState<string>('');
  const [selected, setSelected]         = useState<LogementPublic | null>(null);
  const [candidater, setCandidater]     = useState<LogementPublic | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/public/logements`)
      .then(r => r.json())
      .then((data: LogementPublic[]) => {
        setLogements(data);
        if (id) {
          const found = data.find((l: LogementPublic) => l.id === id);
          if (found) setSelected(found);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const openLogement = (l: LogementPublic) => {
    setSelected(l);
    navigate(`/logements/${l.id}`, { replace: true });
  };

  const closeLogement = () => {
    setSelected(null);
    navigate('/logements', { replace: true });
  };

  // Filtrage
  const filtered = logements.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.adresse.toLowerCase().includes(q) || l.ville.toLowerCase().includes(q);
    const matchType   = !filterType || l.type === filterType;
    return matchSearch && matchType;
  });

  // Vue détail
  if (selected) {
    return (
      <>
        <DetailLogement
          logement={selected}
          onBack={closeLogement}
          onCandidater={() => setCandidater(selected)}
        />
        {candidater && (
          <ModalCandidature logement={candidater} onClose={() => setCandidater(null)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#111', color: '#fff' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-40 px-6 h-16 flex items-center justify-between"
        style={{ background: 'rgba(17,17,17,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }}>
            SB
          </div>
          <span className="font-bold text-white tracking-tight">
            Simi<span style={{ color: '#22c55e' }}> Bail</span>
          </span>
        </Link>
      </header>

      {/* Hero */}
      <div className="py-16 px-6 text-center"
        style={{ background: 'linear-gradient(180deg,#0d1a12 0%,#111 100%)' }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#22c55e' }}>
          Logements disponibles
        </p>
        <h1 className="font-black text-white mb-3" style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>
          Trouvez votre prochain logement
        </h1>
        <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Consultez nos logements disponibles et postulez directement en ligne.
        </p>

        {/* Barre de recherche */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="flex-1 flex items-center gap-2 px-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Search size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input
              className="flex-1 py-3 bg-transparent text-white text-sm outline-none placeholder-white/30"
              placeholder="Ville, adresse..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <SlidersHorizontal size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <select
              className="bg-transparent text-white text-sm outline-none py-3 cursor-pointer"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="" style={{ background: '#1a1a1a' }}>Tous les types</option>
              <option value="appartement" style={{ background: '#1a1a1a' }}>Appartement</option>
              <option value="maison" style={{ background: '#1a1a1a' }}>Maison</option>
              <option value="studio" style={{ background: '#1a1a1a' }}>Studio</option>
              <option value="local_commercial" style={{ background: '#1a1a1a' }}>Local commercial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille de logements */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-t-green-500 animate-spin"
              style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#22c55e' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun logement disponible pour le moment.</p>
          </div>
        ) : (
          <>
            <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {filtered.length} logement{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(logement => {
                const photo = logement.photos[0] ?? PLACEHOLDER_IMG;
                return (
                  <div
                    key={logement.id}
                    className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.transform = 'none';
                    }}
                    onClick={() => openLogement(logement)}
                  >
                    {/* Photo */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img
                        src={photo}
                        alt={logement.adresse}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'rgba(34,197,94,0.85)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                          Disponible
                        </span>
                      </div>
                      {logement.photos.length > 1 && (
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs"
                          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                          +{logement.photos.length - 1} photos
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-sm truncate">{logement.adresse}</h3>
                          <p className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            <MapPin size={11} /> {logement.ville}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                          {TYPE_LABELS[logement.type]}
                        </span>
                      </div>

                      {/* Caractéristiques */}
                      <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        <span className="flex items-center gap-1"><Maximize2 size={11} />{logement.surface} m²</span>
                        <span className="flex items-center gap-1"><BedDouble size={11} />{logement.nbPieces} p.</span>
                        {logement.charges > 0 && (
                          <span className="flex items-center gap-1"><Zap size={11} />Charges incluses</span>
                        )}
                      </div>

                      {/* Prix + boutons */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white font-black text-base">{formatMontant(logement.loyer)}</span>
                          <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>/mois</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/logements/${logement.id}`); }}
                            className="p-1.5 rounded-full transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                            title="Copier le lien"
                            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                          >
                            <Link2 size={13} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setCandidater(logement); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                            style={{ background: '#22c55e', color: '#fff' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#16a34a')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#22c55e')}
                          >
                            Postuler <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal candidature */}
      {candidater && (
        <ModalCandidature logement={candidater} onClose={() => setCandidater(null)} />
      )}
    </div>
  );
}
