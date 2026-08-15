import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Building2, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: <Building2 size={18} />, title: 'Parc locatif centralisé', desc: 'Gérez tous vos logements et propriétaires depuis un seul espace.' },
  { icon: <TrendingUp size={18} />, title: 'Suivi financier en temps réel', desc: 'Paiements, reversements et comptabilité automatisés.' },
  { icon: <Shield size={18} />, title: 'Sécurisé et fiable', desc: 'Vos données hébergées en base sécurisée, accessibles à tout moment.' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--color-base-100)' }}
    >
      {/* ── Colonne gauche — hero ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between flex-1 p-14"
        style={{ background: 'var(--color-base-200)', borderRight: '1px solid var(--color-base-300)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-content)' }}
          >
            GL
          </div>
          <span
            className="font-semibold tracking-wide text-sm uppercase"
            style={{ color: 'var(--color-base-content)', opacity: 0.7 }}
          >
            Simi Bail
          </span>
        </div>

        {/* Headline */}
        <div>
          <p
            className="text-sm font-medium mb-6 uppercase tracking-widest"
            style={{ color: 'var(--color-primary)' }}
          >
            Plateforme de gestion immobilière
          </p>

          <h1
            className="font-black leading-tight"
            style={{
              fontSize: 'clamp(2.4rem, 4vw, 3.8rem)',
              color: 'var(--color-base-content)',
              letterSpacing: '-0.02em',
            }}
          >
            Gérez votre parc<br />
            locatif avec<br />
            <em style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>élégance</em>
            {' '}et précision.
          </h1>

          <p
            className="mt-6 text-base leading-relaxed max-w-sm"
            style={{ color: 'var(--color-base-content)', opacity: 0.55 }}
          >
            De la candidature à la comptabilité, automatisez chaque étape de la gestion locative depuis une interface pensée pour les professionnels de l'immobilier.
          </p>

          {/* Features */}
          <div className="mt-10 flex flex-col gap-5">
            {features.map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--color-primary)', color: 'var(--color-primary-content)' }}
                >
                  {f.icon}
                </div>
                <div>
                  <div
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: 'var(--color-base-content)' }}
                  >
                    {f.title}
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--color-base-content)', opacity: 0.5 }}
                  >
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer citation */}
        <p
          className="italic text-sm"
          style={{ color: 'var(--color-base-content)', opacity: 0.35 }}
        >
          "La gestion locative efficace commence par les bons outils."
        </p>
      </div>

      {/* ── Colonne droite — formulaire ───────────────────────────────── */}
      <div className="flex flex-col justify-center flex-1 lg:max-w-md xl:max-w-lg p-8 lg:p-14">

        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-content)' }}
          >
            GL
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--color-base-content)' }}>
            Simi Bail
          </span>
        </div>

        <h2
          className="mb-1 text-3xl font-extrabold"
          style={{ color: 'var(--color-base-content)', letterSpacing: '-0.01em' }}
        >
          Bon retour
        </h2>
        <p
          className="text-sm mb-8"
          style={{ color: 'var(--color-base-content)', opacity: 0.5 }}
        >
          Connectez-vous pour accéder à votre espace de gestion.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-base-content)', opacity: 0.5 }}
            >
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: 'var(--color-base-200)',
                border: '1px solid var(--color-base-300)',
                color: 'var(--color-base-content)',
              }}
              onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-base-300)'; }}
            />
          </div>

          {/* Mot de passe */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-base-content)', opacity: 0.5 }}
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-12"
                style={{
                  background: 'var(--color-base-200)',
                  border: '1px solid var(--color-base-300)',
                  color: 'var(--color-base-content)',
                }}
                onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
                onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-base-300)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                background: 'var(--color-error)',
                color: 'var(--color-error-content)',
                opacity: 0.9,
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 mt-1"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-primary-content)',
            }}
          >
            {loading
              ? <span className="loading loading-spinner loading-sm" />
              : <LogIn size={16} />
            }
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Séparateur déco */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px" style={{ background: 'var(--color-base-300)' }} />
          <span
            className="text-xs uppercase tracking-wider"
            style={{ color: 'var(--color-base-content)', opacity: 0.3 }}
          >
            Accès sécurisé
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-base-300)' }} />
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '100%', label: 'Données chiffrées' },
            { value: '24/7', label: 'Disponibilité' },
            { value: '< 1s', label: 'Temps de réponse' },
          ].map(s => (
            <div key={s.label}>
              <div
                className="text-xl font-extrabold"
                style={{ color: 'var(--color-primary)' }}
              >
                {s.value}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
