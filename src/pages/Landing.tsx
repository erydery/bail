import { useState, useEffect } from 'react';
import GalaxyBackground from '../components/GalaxyBackground';
import EarthBackground from '../components/EarthBackground';
import { Link } from 'react-router-dom';
import {
  Building2, Users, FileText, CreditCard, Wrench, TrendingUp,
  BarChart3, Bell, Shield, ChevronRight, Star, Menu, X, ArrowRight,
  CheckCircle2, Zap, Globe,
} from 'lucide-react';

// ============================================================
// 1. HOOKS PERSONNALISÉS
// ============================================================

/**
 * Hook qui retourne la position de défilement vertical de la fenêtre.
 * Utile pour l'effet de transparence de la navbar.
 */
function useScrollY() {
  const [y, setY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return y;
}

// ============================================================
// 2. DONNÉES STATIQUES
// ============================================================

/** Liens principaux de la navigation */
const NAV_LINKS = [
  { label: 'Logements disponibles', href: '/logements' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Aperçu', href: '#screenshots' },
  { label: 'Tarifs', href: '#pricing' },
];

/** Liste des fonctionnalités avec icônes (accent unique, cohérent avec l'identité du site) */
const FEATURES = [
  {
    icon: <Building2 size={20} />,
    title: 'Parc locatif',
    desc: 'Gérez l\'ensemble de vos logements, propriétaires et locataires depuis un tableau de bord centralisé.',
  },
  {
    icon: <FileText size={20} />,
    title: 'Baux numériques',
    desc: 'Créez, éditez et téléchargez vos contrats de bail au format PDF en quelques clics.',
  },
  {
    icon: <CreditCard size={20} />,
    title: 'Suivi des paiements',
    desc: 'Historique complet des loyers, alertes de retard et rapprochement bancaire automatique.',
  },
  {
    icon: <Users size={20} />,
    title: 'Candidatures',
    desc: 'Recevez les dossiers candidats, analysez le taux d\'effort et prenez vos décisions en un clic.',
  },
  {
    icon: <Wrench size={20} />,
    title: 'Maintenance',
    desc: 'Ouvrez des tickets de travaux, suivez les prestataires et la résolution des incidents.',
  },
  {
    icon: <TrendingUp size={20} />,
    title: 'Révisions & Charges',
    desc: 'Révisions IRL automatiques et régularisation annuelle des charges locatives.',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Comptabilité',
    desc: 'Vue consolidée de vos revenus, dépenses et rentabilité par logement.',
  },
  {
    icon: <Bell size={20} />,
    title: 'Communications',
    desc: 'Envoyez des quittances, relances et courriers directement depuis l\'application.',
  },
];

/** Captures d'écran pour l'aperçu */
const SCREENSHOTS = [
  {
    src: '/screenshots/dashboard.png',
    label: 'Tableau de bord',
    desc: 'Vue globale de votre parc : alertes, logements et tickets de maintenance en temps réel.',
  },
  {
    src: '/screenshots/candidature.png',
    label: 'Dossier candidat',
    desc: 'Analyse financière automatique du candidat avec taux d\'effort et éligibilité.',
  },
  {
    src: '/screenshots/bail.png',
    label: 'Détail du bail',
    desc: 'Toutes les informations du contrat, du locataire et du logement réunies.',
  },
  {
    src: '/screenshots/proprietaire.png',
    label: 'Fiche propriétaire',
    desc: 'Portefeuille, loyers totaux et commission mensuelle estimée par propriétaire.',
  },
];

/** Offres tarifaires */
const PLANS = [
  {
    name: 'Starter',
    price: '0',
    desc: 'Pour démarrer sans engagement',
    features: ['Jusqu\'à 3 logements', 'Baux & paiements', 'Support email'],
    cta: 'Commencer gratuitement',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '9 900',
    desc: 'Pour les gestionnaires actifs',
    features: [
      'Logements illimités',
      'Toutes les fonctionnalités',
      'Révisions IRL auto',
      'Comptabilité avancée',
      'Support prioritaire',
    ],
    cta: 'Essai gratuit 14 jours',
    highlight: true,
  },
  {
    name: 'Agence',
    price: 'Sur devis',
    desc: 'Pour les agences immobilières',
    features: ['Multi-utilisateurs', 'API & intégrations', 'Personnalisation marque', 'Accompagnement dédié'],
    cta: 'Nous contacter',
    highlight: false,
  },
];

/** Statistiques affichées dans la section Hero */
const STATS = [
  { value: '2 400+', label: 'Logements gérés' },
  { value: '98%', label: 'Satisfaction client' },
  { value: '40h', label: 'Économisées / mois' },
  { value: '100%', label: 'Données sécurisées' },
];

/** Éléments de confiance pour la section TrustStrip */
const TRUST_ITEMS = [
  {
    icon: <Shield size={20} />,
    title: 'Données sécurisées',
    desc: 'Hébergement chiffré, sauvegardes automatiques quotidiennes.',
  },
  {
    icon: <Globe size={20} />,
    title: 'Conçu pour le Cameroun',
    desc: 'Loyers en XAF, baux conformes au droit camerounais.',
  },
  {
    icon: <Star size={20} fill="#f59e0b" />,
    title: 'Support réactif',
    desc: 'Une équipe disponible pour vous accompagner à chaque étape.',
  },
];

// ============================================================
// 3. COMPOSANTS DE L'INTERFACE
// ============================================================

// ---------- 3.1 Navbar ----------
function Navbar() {
  const scrollY = useScrollY();
  const [open, setOpen] = useState(false);
  const solid = scrollY > 40;

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: solid ? 'rgba(17,17,17,0.92)' : 'transparent',
        backdropFilter: solid ? 'blur(16px)' : 'none',
        borderBottom: solid ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }}
          >
            SB
          </div>
          <span className="font-bold text-white tracking-tight">
            Simi<span style={{ color: '#22c55e' }}> Bail</span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Boutons d'action */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium rounded-full transition-colors"
            style={{ color: 'rgba(255,255,255,0.8)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          >
            Connexion
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 text-sm font-semibold rounded-full transition-all"
            style={{ background: '#22c55e', color: '#fff' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#16a34a')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#22c55e')}
          >
            Démarrer →
          </Link>
        </div>

        {/* Bouton menu mobile */}
        <button className="md:hidden text-white" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div
          className="md:hidden px-6 pb-6 flex flex-col gap-3"
          style={{ background: 'rgba(17,17,17,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="mt-2 py-3 text-center text-sm font-semibold rounded-xl"
            style={{ background: '#22c55e', color: '#fff' }}
          >
            Démarrer gratuitement
          </Link>
        </div>
      )}
    </header>
  );
}

// ---------- 3.2 Hero ----------
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Background 3D galaxie */}
      <GalaxyBackground insideColor="#22c55e" outsideColor="#3b82f6" />

      {/* Overlay sombre léger — laisse passer la galaxie */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(160deg, rgba(5,15,8,0.55) 0%, rgba(5,5,5,0.45) 50%, rgba(5,10,20,0.55) 100%)',
        }}
      />

      {/* Effets de lumière */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          zIndex: 2,
          background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          zIndex: 2,
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Contenu principal */}
      <div className="relative flex flex-col items-center w-full" style={{ zIndex: 3 }}>
        {/* Badge */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
          style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)', color: '#22c55e' }}
        >
          <Zap size={13} fill="#22c55e" />
          <span className="text-xs font-semibold tracking-widest uppercase">Logiciel de gestion immobilière</span>
        </div>

        {/* Titre principal */}
        <h1 className="text-center font-black leading-none mb-6" style={{ maxWidth: 780 }}>
          <span className="block text-white" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
            Gérez votre parc
          </span>
          <span className="block" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', color: '#22c55e' }}>
            locatif sans effort.
          </span>
        </h1>

        {/* Description */}
        <p
          className="text-center mb-10 max-w-xl"
          style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', lineHeight: 1.7 }}
        >
          De la candidature à la quittance, en passant par les révisions IRL et la comptabilité —
          tout ce dont un bailleur camerounais a besoin, dans une seule application.
        </p>

        {/* Appels à l'action */}
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link
            to="/login"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all"
            style={{ background: '#22c55e', color: '#fff', boxShadow: '0 0 30px rgba(34,197,94,0.35)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#16a34a';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#22c55e';
              e.currentTarget.style.transform = 'none';
            }}
          >
            Démarrer gratuitement <ArrowRight size={15} />
          </Link>
          <a
            href="#screenshots"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm border transition-all"
            style={{
              borderColor: 'rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              background: 'rgba(255,255,255,0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
            }}
          >
            Voir l'aperçu
          </a>
        </div>

        {/* Statistiques — barre unique avec séparateurs plutôt que 4 cartes isolées */}
        <div
          className="flex flex-wrap w-full max-w-3xl mb-16 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex-1 min-w-[45%] sm:min-w-0 text-center px-4 py-5 ${
                index === 0 ? '' : 'border-t sm:border-t-0 sm:border-l'
              }`}
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="font-black text-2xl text-white">{stat.value}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Aperçu du tableau de bord */}
        <div className="relative w-full max-w-5xl">
          <div
            className="rounded-2xl overflow-hidden shadow-2xl border"
            style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}
          >
            <img
              src="/screenshots/dashboard.png"
              alt="Tableau de bord Simi Bail"
              className="w-full object-cover"
              style={{ display: 'block' }}
            />
          </div>
          <div
            className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #111, transparent)' }}
          />
        </div>
      </div>
    </section>
  );
}

// ---------- 3.3 Fonctionnalités ----------
function Features() {
  return (
    <section id="features" className="py-28 px-6" style={{ background: '#111' }}>
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#22c55e' }}>
            FONCTIONNALITÉS
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-black text-white leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', maxWidth: 480 }}>
              Tout ce qu'il faut pour gérer vos biens.
            </h2>
            <p className="max-w-xs text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Une suite complète conçue pour les bailleurs et agences du Cameroun.
            </p>
          </div>
        </div>

        {/* Grille uniforme — même carte, même traitement pour les 8 fonctionnalités.
            Le seul accent est le vert de marque, cohérent avec le reste du site. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="relative rounded-2xl p-5 transition-all duration-200 cursor-default"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.borderColor = 'rgba(34,197,94,0.35)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
              >
                {feature.icon}
              </div>
              <h3 className="font-bold text-white mb-2 text-sm">{feature.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- 3.4 Aperçu des captures d'écran ----------
function Screenshots() {
  const [active, setActive] = useState(0);

  return (
    <section
      id="screenshots"
      className="py-28 px-6"
      style={{ background: 'linear-gradient(180deg, #111 0%, #0d1a12 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#22c55e' }}>
            APERÇU
          </p>
          <h2 className="font-black text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Une interface pensée pour l'efficacité.
          </h2>
          <p className="max-w-lg mx-auto text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Interface sombre, ergonomique et responsive. Retrouvez toutes vos données
            en quelques clics depuis n'importe quel appareil.
          </p>
        </div>

        {/* Disposition en deux colonnes : liste de navigation à gauche, capture à droite —
            remplace l'ancien empilement pastilles + légende flottante par une lecture
            simultanée du titre, de la description et de l'image */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Navigation */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {SCREENSHOTS.map((screenshot, index) => (
              <button
                key={screenshot.label}
                onClick={() => setActive(index)}
                className="text-left rounded-xl px-4 py-3 transition-all flex-shrink-0 w-56 lg:w-auto"
                style={
                  active === index
                    ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                <div className="font-bold text-sm mb-1" style={{ color: active === index ? '#22c55e' : '#fff' }}>
                  {screenshot.label}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {screenshot.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Affichage de la capture */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
          >
            <img
              key={active}
              src={SCREENSHOTS[active].src}
              alt={SCREENSHOTS[active].label}
              className="w-full object-cover"
              style={{ display: 'block' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 3.5 Tarifs ----------
function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6" style={{ background: '#0d1a12' }}>
      <div className="max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#22c55e' }}>
            TARIFS
          </p>
          <h2 className="font-black text-white leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Simple, transparent, sans surprise.
          </h2>
          <p className="max-w-md mx-auto text-sm" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Commencez gratuitement. Évoluez quand vous en avez besoin.
          </p>
        </div>

        {/* Grille des offres — alignée sur la base, l'offre Pro est surélevée pour
            que la hiérarchie se lise dans l'espace plutôt que dans le seul badge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-7 flex flex-col transition-all relative"
              style={
                plan.highlight
                  ? {
                      background: 'rgba(34,197,94,0.08)',
                      border: '1.5px solid #22c55e',
                      transform: 'scale(1.03) translateY(-12px)',
                    }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ background: '#22c55e', color: '#fff' }}
                >
                  LE PLUS POPULAIRE
                </div>
              )}

              <div className="mb-6">
                <div className="font-bold text-white text-lg mb-1">{plan.name}</div>
                <div className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {plan.desc}
                </div>
                <div className="flex items-end gap-1">
                  {plan.price === 'Sur devis' ? (
                    <span className="font-black text-2xl text-white">Sur devis</span>
                  ) : (
                    <>
                      <span className="font-black text-white" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                        {plan.price}
                      </span>
                      <span className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        XAF / mois
                      </span>
                    </>
                  )}
                </div>
              </div>

              <ul className="flex flex-col gap-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <CheckCircle2 size={15} color="#22c55e" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/login"
                className="w-full py-3 rounded-xl text-center text-sm font-semibold transition-all"
                style={
                  plan.highlight
                    ? { background: '#22c55e', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }
                }
                onMouseEnter={(e) => {
                  if (plan.highlight) e.currentTarget.style.background = '#16a34a';
                }}
                onMouseLeave={(e) => {
                  if (plan.highlight) e.currentTarget.style.background = '#22c55e';
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- 3.6 Confiance ----------
function TrustStrip() {
  return (
    <section className="py-16 px-6" style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Barre horizontale avec séparateurs plutôt qu'une grille à trois colonnes espacées */}
        <div className="flex flex-col md:flex-row">
          {TRUST_ITEMS.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-start gap-4 flex-1 py-4 md:py-0 md:px-6 ${
                index === 0 ? '' : 'border-t md:border-t-0 md:border-l'
              }`}
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
              >
                {item.icon}
              </div>
              <div>
                <div className="font-bold text-white text-sm mb-1">{item.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- 3.7 Appel à l'action final ----------
function FinalCta() {
  return (
    <section
      className="py-28 px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020d05 0%, #020810 100%)', minHeight: '520px' }}
    >
      {/* Globe terrestre 3D en arrière-plan */}
      <EarthBackground />

      {/* Overlay pour lisibilité */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(2,8,16,0.85) 100%)',
        }}
      />

      {/* Contenu */}
      <div className="max-w-2xl mx-auto text-center relative" style={{ zIndex: 2 }}>
        <h2 className="font-black text-white mb-6 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
          Prêt à simplifier votre gestion avec Simi Bail ?
        </h2>
        <p className="mb-10 text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
          Rejoignez les bailleurs camerounais qui ont déjà gagné des heures chaque semaine
          grâce à <strong style={{ color: '#22c55e' }}>Simi Bail</strong>.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-9 py-4 rounded-full font-bold text-sm transition-all"
          style={{ background: '#22c55e', color: '#fff', boxShadow: '0 0 50px rgba(34,197,94,0.3)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#16a34a';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#22c55e';
            e.currentTarget.style.transform = 'none';
          }}
        >
          Commencer maintenant <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  );
}

// ---------- 3.8 Pied de page ----------
function Footer() {
  return (
    <footer className="px-6 py-10" style={{ background: '#0d1209', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }}
          >
            GL
          </div>
          <span className="font-bold text-white text-sm">
            Gestion<span style={{ color: '#22c55e' }}>Locative</span>
          </span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} Simi Bail — Fait avec pour les bailleurs du Cameroun
        </p>
        <Link to="/login" className="text-xs font-medium transition-colors" style={{ color: '#22c55e' }}>
          Accéder à l'application →
        </Link>
      </div>
    </footer>
  );
}

// ============================================================
// 4. PAGE PRINCIPALE
// ============================================================

/**
 * Page d'accueil (Landing page) du site.
 * Assemble tous les composants pour former une page complète.
 */
export default function Landing() {
  return (
    <div style={{ background: '#111', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <Features />
      <Screenshots />
      <Pricing />
      <TrustStrip />
      <FinalCta />
      <Footer />
    </div>
  );
}