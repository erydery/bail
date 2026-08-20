import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GalaxyBackground from '../components/GalaxyBackground';
import EarthBackground from '../components/EarthBackground';
import {
  Building2, Users, FileText, CreditCard, Wrench, TrendingUp,
  BarChart3, Bell, Shield, ChevronRight, Menu, X, ArrowRight,
  CheckCircle2, Zap, Globe, ChevronDown, ChevronLeft, Quote,
  MapPin, Mail, Phone, Star, Play,
} from 'lucide-react';

// ─── Données ──────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Aperçu', href: '#screenshots' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const FEATURES = [
  { icon: Building2,  title: 'Parc locatif',       desc: 'Gérez logements, propriétaires et locataires depuis un tableau de bord centralisé.' },
  { icon: FileText,   title: 'Baux numériques',     desc: 'Créez, éditez et téléchargez vos contrats de bail au format PDF en quelques clics.' },
  { icon: CreditCard, title: 'Suivi des paiements', desc: 'Historique complet des loyers, alertes de retard et rapprochement automatique.' },
  { icon: Users,      title: 'Candidatures',         desc: 'Recevez les dossiers, analysez le taux d\'effort et décidez en un clic.' },
  { icon: Wrench,     title: 'Maintenance',          desc: 'Tickets de travaux, suivi prestataires et résolution des incidents.' },
  { icon: TrendingUp, title: 'Révisions IRL',        desc: 'Révisions automatiques et régularisation annuelle des charges locatives.' },
  { icon: BarChart3,  title: 'Comptabilité',         desc: 'Vue consolidée de vos revenus, dépenses et rentabilité par logement.' },
  { icon: Bell,       title: 'Assistant IA',         desc: 'Posez vos questions en langage naturel et obtenez des réponses en temps réel.' },
];

const SCREENSHOTS = [
  { src: '/screenshots/dashboard.png',    label: 'Tableau de bord',   desc: 'Vue globale de votre parc : alertes, logements et tickets en temps réel.' },
  { src: '/screenshots/candidature.png',  label: 'Dossier candidat',  desc: 'Analyse financière du candidat avec taux d\'effort et éligibilité.' },
  { src: '/screenshots/bail.png',         label: 'Détail du bail',    desc: 'Toutes les informations du contrat, locataire et logement réunies.' },
  { src: '/screenshots/proprietaire.png', label: 'Fiche propriétaire', desc: 'Portefeuille, loyers totaux et commission estimée par propriétaire.' },
];

const PLANS = [
  {
    name: 'Starter', price: '0', unit: 'Gratuit', desc: 'Pour démarrer sans engagement',
    features: ["Jusqu'à 3 logements", 'Baux & paiements', 'Support email'],
    cta: 'Commencer gratuitement', highlight: false,
  },
  {
    name: 'Pro', price: '9 900', unit: 'XAF / mois', desc: 'Pour les gestionnaires actifs',
    features: ['Logements illimités', 'Toutes les fonctionnalités', 'Révisions IRL auto', 'Comptabilité avancée', 'Support prioritaire'],
    cta: 'Essai gratuit 14 jours', highlight: true,
  },
  {
    name: 'Agence', price: 'Devis', unit: 'Sur mesure', desc: 'Pour les agences immobilières',
    features: ['Multi-utilisateurs', 'API & intégrations', 'Personnalisation marque', 'Accompagnement dédié'],
    cta: 'Nous contacter', highlight: false,
  },
];

const STATS = [
  { value: '2 400+', label: 'Logements gérés',    icon: Building2 },
  { value: '98%',    label: 'Satisfaction client', icon: Star },
  { value: '40h',    label: 'Économisées / mois',  icon: Zap },
  { value: '100%',   label: 'Données sécurisées',  icon: Shield },
];

const TESTIMONIALS = [
  {
    quote: 'Simi Bail a révolutionné la gestion de mes 12 logements. En moins d\'une semaine j\'avais tout migré et les alertes de retard m\'ont déjà fait récupérer 3 loyers impayés.',
    author: 'Jean-Paul Mbarga', role: 'Bailleur privé · Yaoundé', initials: 'JM', rating: 5,
  },
  {
    quote: 'L\'interface est claire, rapide et vraiment adaptée à la réalité camerounaise. Les révisions IRL automatiques m\'économisent des heures chaque trimestre.',
    author: 'Sandrine Nkolo', role: 'Gestionnaire immobilière · Douala', initials: 'SN', rating: 5,
  },
  {
    quote: 'Notre agence gère 80 biens avec Simi Bail. Le support est réactif et les mises à jour régulières montrent une équipe vraiment à l\'écoute.',
    author: 'Patrick Essomba', role: 'Directeur · Agence Immo Akwa', initials: 'PE', rating: 5,
  },
];

const MARQUEE_ITEMS = [
  'Gestion locative', 'Baux numériques', 'Révisions IRL', 'Suivi paiements',
  'Tickets maintenance', 'Comptabilité', 'Candidatures', 'Assistant IA',
  'États des lieux', 'Quittances PDF', 'Alertes retard', 'Rapports financiers',
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return y;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Helpers de style ─────────────────────────────────────────────────────────

const O = '#e85d04'; // orange primary
const O2 = '#f48c06'; // orange secondary
const BG = '#0c1015';
const SURFACE = '#141b22';
const SURFACE2 = '#1a2330';
const BORDER = 'rgba(255,255,255,0.07)';
const TEXT = '#f0f2f5';
const MUTED = 'rgba(240,242,245,0.45)';

const glass = (alpha = 0.5): React.CSSProperties => ({
  background: `rgba(20,27,34,${alpha})`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${BORDER}`,
});

const glowBtn: React.CSSProperties = {
  background: O,
  color: '#fff',
  boxShadow: `0 0 0 0 rgba(232,93,4,0), 0 8px 32px rgba(232,93,4,0.4)`,
};

// ─── Composant : AnimatedBorderButton ────────────────────────────────────────

function AnimatedBorderBtn({ children, href }: { children: React.ReactNode; href?: string }) {
  const inner = (
    <span className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold overflow-visible cursor-pointer transition-all duration-300"
      style={{ border: '1px solid rgba(232,93,4,0.35)', color: TEXT, background: 'transparent' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(232,93,4,0.08)';
        el.style.boxShadow = '0 0 24px rgba(232,93,4,0.18)';
        el.style.borderColor = 'rgba(232,93,4,0.7)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'transparent';
        el.style.boxShadow = 'none';
        el.style.borderColor = 'rgba(232,93,4,0.35)';
      }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 54"
        preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <path d="M27,1 A26,26 0 0 0 1,27 L1,27 A26,26 0 0 0 27,53 L173,53 A26,26 0 0 0 199,27 L199,27 A26,26 0 0 0 173,1 Z"
          fill="none" stroke={O} strokeWidth="1.5"
          strokeDasharray="400 550" strokeDashoffset="400" strokeLinecap="round"
          className="group-hover:[animation:animated-border-path_1.5s_linear_infinite]" />
      </svg>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </span>
  );
  if (href) return <a href={href}>{inner}</a>;
  return <>{inner}</>;
}

// ─── Composant : SectionLabel ────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
      style={{ background: 'rgba(232,93,4,0.1)', border: '1px solid rgba(232,93,4,0.25)', color: O }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: O }} />
      {children}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const scrollY = useScrollY();
  const [open, setOpen] = useState(false);
  const solid = scrollY > 50;

  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
      style={solid
        ? { ...glass(0.85), paddingTop: '10px', paddingBottom: '10px' }
        : { background: 'transparent', padding: '18px 0' }}>
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-transform group-hover:scale-105"
            style={{ background: `linear-gradient(135deg,${O},${O2})`, color: '#fff', boxShadow: `0 4px 16px rgba(232,93,4,0.4)` }}>
            SB
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: TEXT }}>
            Simi<span style={{ color: O }}>Bail</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-1 rounded-full px-2 py-1" style={glass()}>
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href}
                className="px-4 py-2 text-sm rounded-full transition-all duration-200"
                style={{ color: MUTED }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = TEXT; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ color: MUTED }}
            onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
            Connexion
          </Link>
          <Link to="/login"
            className="px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-200"
            style={glowBtn}
            onMouseEnter={e => { e.currentTarget.style.background = '#c44e00'; e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = O; e.currentTarget.style.transform = 'none'; }}>
            Démarrer →
          </Link>
        </div>

        <button className="md:hidden p-2 rounded-xl transition-colors" style={{ color: TEXT, ...glass() }}
          onClick={() => setOpen(o => !o)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-3 mt-2" style={glass(0.95)}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-medium border-b" style={{ color: MUTED, borderColor: BORDER }}>
              {l.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)}
            className="mt-3 py-3.5 text-center text-sm font-bold rounded-xl"
            style={glowBtn}>
            Démarrer gratuitement
          </Link>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: BG }}>
      <GalaxyBackground insideColor={O} outsideColor={O2} />

      {/* Overlay gradient dramatique */}
      <div className="absolute inset-0" style={{ zIndex: 1,
        background: 'linear-gradient(150deg,rgba(12,16,21,0.75) 0%,rgba(12,16,21,0.55) 40%,rgba(12,16,21,0.7) 100%)' }} />

      {/* Lueurs ambiantes */}
      <div className="absolute top-1/3 -left-24 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ zIndex: 2,
        background: `radial-gradient(circle,rgba(232,93,4,0.12) 0%,transparent 65%)`, filter: 'blur(60px)' }} />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ zIndex: 2,
        background: `radial-gradient(circle,rgba(244,140,6,0.08) 0%,transparent 65%)`, filter: 'blur(60px)' }} />

      {/* Dots flottants */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${4 + Math.random() * 4}px`, height: `${4 + Math.random() * 4}px`,
              backgroundColor: i % 3 === 0 ? O : i % 3 === 1 ? O2 : 'rgba(255,255,255,0.3)',
              opacity: 0.3 + Math.random() * 0.3,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animation: `slow-drift ${18 + Math.random() * 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
            }} />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-32 relative w-full" style={{ zIndex: 3 }}>
        <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-16 items-center">

          {/* Colonne gauche */}
          <div className="space-y-8">
            <div className="animate-[fade-in_0.9s_ease-out_both]">
              <SectionLabel>Logiciel de gestion immobilière · Cameroun</SectionLabel>
            </div>

            <h1 className="font-black leading-[1.05] animate-[fade-in_0.9s_ease-out_both] [animation-delay:120ms]"
              style={{ fontSize: 'clamp(3rem,6.5vw,5.5rem)', color: TEXT }}>
              Gérez votre parc<br />
              <span style={{ color: O }}>locatif</span> avec<br />
              <span className="relative inline-block">
                <span style={{ color: TEXT, fontStyle: 'italic' }}>sérénité.</span>
                {/* Soulignement animé */}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" style={{ height: '12px' }}>
                  <path d="M0 8 Q75 2 150 8 Q225 14 300 8" stroke={O} strokeWidth="2.5" strokeLinecap="round" fill="none"
                    style={{ strokeDasharray: 340, strokeDashoffset: 340, animation: 'drawLine 1.2s 0.8s ease-out forwards' }} />
                </svg>
              </span>
            </h1>

            <p className="text-lg leading-relaxed max-w-[520px] animate-[fade-in_0.9s_ease-out_both] [animation-delay:240ms]"
              style={{ color: 'rgba(240,242,245,0.6)' }}>
              De la candidature à la quittance — baux, paiements, révisions IRL, comptabilité et
              assistant IA. Tout ce dont un bailleur camerounais a besoin, dans une seule application.
            </p>

            <div className="flex flex-wrap gap-4 animate-[fade-in_0.9s_ease-out_both] [animation-delay:360ms]">
              <Link to="/login"
                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-all duration-200"
                style={glowBtn}
                onMouseEnter={e => { e.currentTarget.style.background = '#c44e00'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,93,4,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = O; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,4,0.4)'; }}>
                Démarrer gratuitement <ArrowRight size={16} />
              </Link>
              <AnimatedBorderBtn href="#screenshots">
                <Play size={14} /> Voir l'aperçu
              </AnimatedBorderBtn>
            </div>

            {/* Barre de stats */}
            <div className="flex flex-wrap gap-6 pt-4 animate-[fade-in_0.9s_ease-out_both] [animation-delay:480ms]">
              {STATS.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(232,93,4,0.12)', color: O }}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="font-black text-lg leading-none" style={{ color: TEXT }}>{s.value}</div>
                      <div className="text-xs mt-0.5" style={{ color: MUTED }}>{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonne droite — Card mockup */}
          <div className="relative animate-[fade-in_0.9s_ease-out_both] [animation-delay:300ms]">
            {/* Halo derrière */}
            <div className="absolute -inset-8 rounded-[40px] animate-pulse pointer-events-none"
              style={{ background: `radial-gradient(ellipse at center,rgba(232,93,4,0.18) 0%,transparent 70%)`, filter: 'blur(20px)' }} />

            {/* Carte principale */}
            <div className="relative rounded-3xl overflow-hidden" style={{ ...glass(0.7), boxShadow: '0 40px 100px rgba(0,0,0,0.7),0 0 0 1px rgba(232,93,4,0.15)' }}>
              <img src="/screenshots/dashboard.png" alt="Dashboard Simi Bail" className="w-full block" />
              {/* Reflet en bas */}
              <div className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
                style={{ background: 'linear-gradient(to top,rgba(20,27,34,0.6),transparent)' }} />
            </div>

            {/* Badge flottant — statut */}
            <div className="absolute -bottom-5 -left-5 flex items-center gap-3 px-4 py-3 rounded-2xl animate-[float_4s_ease-in-out_infinite]"
              style={{ ...glass(0.9), boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              <div>
                <div className="text-xs font-bold" style={{ color: TEXT }}>Parc en temps réel</div>
                <div className="text-xs" style={{ color: MUTED }}>12 logements actifs</div>
              </div>
            </div>

            {/* Badge flottant — économies */}
            <div className="absolute -top-5 -right-5 px-4 py-3 rounded-2xl text-center animate-[float_4s_ease-in-out_infinite] [animation-delay:600ms]"
              style={{ ...glass(0.9), boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="font-black text-2xl" style={{ color: O }}>40h</div>
              <div className="text-xs" style={{ color: MUTED }}>économisées/mois</div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee bas */}
      <div className="absolute bottom-0 inset-x-0" style={{ zIndex: 3 }}>
        <div className="relative overflow-hidden py-4" style={{ borderTop: `1px solid ${BORDER}`, background: 'rgba(12,16,21,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to right,${BG},transparent)` }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: `linear-gradient(to left,${BG},transparent)` }} />
          <div className="flex animate-[marquee_35s_linear_infinite] whitespace-nowrap">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <div key={i} className="flex items-center gap-3 flex-shrink-0 px-8">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: O, opacity: 0.6 }} />
                <span className="text-sm font-medium" style={{ color: 'rgba(240,242,245,0.35)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#features" className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 transition-all duration-200"
        style={{ zIndex: 4, color: MUTED }}
        onMouseEnter={e => (e.currentTarget.style.color = O)}
        onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
        <span className="text-xs uppercase tracking-widest font-medium">Découvrir</span>
        <ChevronDown size={18} className="animate-bounce" />
      </a>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const { ref, visible } = useInView();
  return (
    <section id="features" ref={ref} className="py-32 relative overflow-hidden" style={{ background: SURFACE }}>
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,rgba(232,93,4,0.05) 0%,transparent 65%)`, filter: 'blur(80px)', top: '-100px' }} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header 2 colonnes */}
        <div className="grid md:grid-cols-2 gap-8 items-end mb-16">
          <div>
            <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <SectionLabel>Fonctionnalités</SectionLabel>
              <h2 className="font-black leading-tight mt-2" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', color: TEXT }}>
                Tout ce qu'il faut pour{' '}
                <span style={{ color: O }}>gérer</span> vos biens.
              </h2>
            </div>
          </div>
          <div className={`transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p style={{ color: MUTED, lineHeight: 1.8 }}>
              Une suite complète conçue pour les bailleurs et agences du Cameroun.
              Chaque module est pensé pour vous faire gagner du temps au quotidien.
            </p>
            <Link to="/login"
              className="inline-flex items-center gap-2 mt-5 text-sm font-semibold transition-colors"
              style={{ color: O }}
              onMouseEnter={e => (e.currentTarget.style.color = O2)}
              onMouseLeave={e => (e.currentTarget.style.color = O)}>
              Tout explorer <ChevronRight size={15} />
            </Link>
          </div>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title}
                className={`group relative rounded-2xl p-6 cursor-default transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ ...glass(), transitionDelay: `${i * 60}ms` }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'rgba(232,93,4,0.07)';
                  el.style.borderColor = 'rgba(232,93,4,0.4)';
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.3),0 0 0 1px rgba(232,93,4,0.2)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = '';
                  el.style.borderColor = '';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = 'none';
                }}>
                {/* Icône avec fond dégradé */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
                  style={{ background: `linear-gradient(135deg,rgba(232,93,4,0.15),rgba(244,140,6,0.08))`, color: O, border: '1px solid rgba(232,93,4,0.2)' }}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-sm mb-2.5" style={{ color: TEXT }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{f.desc}</p>

                {/* Accent coin bas-droite */}
                <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: O, color: '#fff' }}>
                  <ChevronRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Screenshots ──────────────────────────────────────────────────────────────

function Screenshots() {
  const [active, setActive] = useState(0);
  const { ref, visible } = useInView();

  return (
    <section id="screenshots" ref={ref} className="py-32 relative overflow-hidden" style={{ background: BG }}>
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,rgba(232,93,4,0.06) 0%,transparent 65%)`, filter: 'blur(80px)' }} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <SectionLabel>Aperçu</SectionLabel>
          <h2 className="font-black leading-tight mt-2 mb-4" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', color: TEXT }}>
            Une interface pensée pour{' '}
            <span style={{ color: O }}>l'efficacité.</span>
          </h2>
          <p className="max-w-lg mx-auto" style={{ color: MUTED, lineHeight: 1.8 }}>
            Interface sombre, ergonomique et responsive. Retrouvez toutes vos données en quelques clics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Nav tabs */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {SCREENSHOTS.map((s, i) => (
              <button key={s.label} onClick={() => setActive(i)}
                className="text-left rounded-xl px-4 py-3.5 transition-all duration-300 flex-shrink-0 w-56 lg:w-auto"
                style={active === i
                  ? { background: 'rgba(232,93,4,0.1)', border: `1px solid rgba(232,93,4,0.5)`, boxShadow: '0 0 20px rgba(232,93,4,0.1)' }
                  : { ...glass(0.4) }}>
                <div className="flex items-center gap-2 mb-1">
                  {active === i && <span className="w-1.5 h-1.5 rounded-full" style={{ background: O, flexShrink: 0 }} />}
                  <div className="font-bold text-sm" style={{ color: active === i ? O : TEXT }}>{s.label}</div>
                </div>
                <div className="text-xs leading-relaxed" style={{ color: MUTED }}>{s.desc}</div>
              </button>
            ))}
          </div>

          {/* Image avec cadre */}
          <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ border: `1px solid ${BORDER}`, boxShadow: '0 40px 100px rgba(0,0,0,0.6),0 0 0 1px rgba(232,93,4,0.1)' }}>
            {/* Barre de navigateur simulée */}
            <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: SURFACE2, borderBottom: `1px solid ${BORDER}` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
              <div className="mx-3 flex-1 rounded-md px-3 py-1 text-xs" style={{ background: 'rgba(255,255,255,0.05)', color: MUTED }}>
                app.simibail.cm
              </div>
            </div>
            <img key={active} src={SCREENSHOTS[active].src} alt={SCREENSHOTS[active].label}
              className="w-full block animate-[fade-in_0.4s_ease-out_both]" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const { ref, visible } = useInView();
  const next = () => setIdx(i => (i + 1) % TESTIMONIALS.length);
  const prev = () => setIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const t = TESTIMONIALS[idx];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: SURFACE }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full"
          style={{ background: `radial-gradient(circle,rgba(232,93,4,0.05) 0%,transparent 65%)`, filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <SectionLabel>Témoignages</SectionLabel>
          <h2 className="font-black leading-tight mt-2" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', color: TEXT }}>
            Ils font confiance à{' '}
            <span style={{ color: O }}>Simi Bail.</span>
          </h2>
        </div>

        {/* Carousel */}
        <div className={`max-w-3xl mx-auto transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative rounded-3xl p-10 md:p-14"
            style={{ ...glass(0.7), border: `1px solid rgba(232,93,4,0.25)`, boxShadow: '0 0 60px rgba(232,93,4,0.07),0 40px 80px rgba(0,0,0,0.4)' }}>

            {/* Guillemet décoratif */}
            <div className="absolute -top-5 left-10 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg,${O},${O2})`, boxShadow: `0 4px 20px rgba(232,93,4,0.5)` }}>
              <Quote size={18} color="#fff" />
            </div>

            {/* Étoiles */}
            <div className="flex gap-1 mb-6 pt-2">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={16} fill={O} color={O} />
              ))}
            </div>

            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8"
              style={{ color: TEXT, fontStyle: 'italic' }}>
              « {t.quote} »
            </blockquote>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg,rgba(232,93,4,0.3),rgba(244,140,6,0.15))`, color: O, border: `2px solid rgba(232,93,4,0.4)` }}>
                {t.initials}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: TEXT }}>{t.author}</div>
                <div className="text-xs mt-0.5" style={{ color: MUTED }}>{t.role}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={glass()}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `rgba(232,93,4,0.12)`; (e.currentTarget as HTMLElement).style.borderColor = `rgba(232,93,4,0.4)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
              <ChevronLeft size={16} color={TEXT} />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ height: '8px', width: i === idx ? '28px' : '8px', background: i === idx ? O : BORDER }} />
              ))}
            </div>

            <button onClick={next} className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={glass()}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `rgba(232,93,4,0.12)`; (e.currentTarget as HTMLElement).style.borderColor = `rgba(232,93,4,0.4)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}>
              <ChevronRight size={16} color={TEXT} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const { ref, visible } = useInView();
  return (
    <section id="pricing" ref={ref} className="py-32 relative overflow-hidden" style={{ background: BG }}>
      <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,rgba(232,93,4,0.06) 0%,transparent 65%)`, filter: 'blur(80px)' }} />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <SectionLabel>Tarifs</SectionLabel>
          <h2 className="font-black leading-tight mt-2 mb-4" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', color: TEXT }}>
            Simple, transparent,{' '}
            <span style={{ color: O }}>sans surprise.</span>
          </h2>
          <p className="max-w-md mx-auto" style={{ color: MUTED, lineHeight: 1.8 }}>
            Commencez gratuitement. Évoluez quand vous en avez besoin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {PLANS.map((plan, i) => (
            <div key={plan.name}
              className={`rounded-2xl p-8 flex flex-col relative transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{
                transitionDelay: `${i * 100}ms`,
                ...(plan.highlight
                  ? { background: 'rgba(232,93,4,0.07)', border: `2px solid ${O}`, transform: 'scale(1.04) translateY(-14px)', boxShadow: `0 0 60px rgba(232,93,4,0.15),0 40px 80px rgba(0,0,0,0.4)` }
                  : glass()),
              }}>

              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-bold tracking-wider"
                  style={{ background: `linear-gradient(135deg,${O},${O2})`, color: '#fff', boxShadow: `0 4px 20px rgba(232,93,4,0.5)` }}>
                  LE PLUS POPULAIRE
                </div>
              )}

              <div className="mb-7">
                <div className="font-bold text-lg mb-1" style={{ color: TEXT }}>{plan.name}</div>
                <div className="text-xs mb-5" style={{ color: MUTED }}>{plan.desc}</div>

                <div className="flex items-end gap-2">
                  {plan.price === 'Devis'
                    ? <span className="font-black text-3xl" style={{ color: TEXT }}>Sur devis</span>
                    : <>
                        <span className="font-black leading-none" style={{ fontSize: '2.8rem', color: TEXT }}>{plan.price}</span>
                        <span className="text-sm mb-1.5 font-medium" style={{ color: MUTED }}>XAF / mois</span>
                      </>}
                </div>
              </div>

              <ul className="flex flex-col gap-3.5 flex-1 mb-8">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(240,242,245,0.8)' }}>
                    <CheckCircle2 size={15} style={{ color: O, flexShrink: 0, marginTop: '2px' }} />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link to="/login"
                className="w-full py-3.5 rounded-xl text-center text-sm font-bold transition-all duration-200"
                style={plan.highlight
                  ? { background: O, color: '#fff', boxShadow: `0 4px 20px rgba(232,93,4,0.4)` }
                  : { ...glass(), color: 'rgba(240,242,245,0.7)' }}
                onMouseEnter={e => { if (plan.highlight) { e.currentTarget.style.background = '#c44e00'; e.currentTarget.style.transform = 'translateY(-1px)'; } else { e.currentTarget.style.borderColor = `rgba(232,93,4,0.5)`; e.currentTarget.style.color = TEXT; } }}
                onMouseLeave={e => { if (plan.highlight) { e.currentTarget.style.background = O; e.currentTarget.style.transform = 'none'; } else { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = 'rgba(240,242,245,0.7)'; } }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trust Strip ──────────────────────────────────────────────────────────────

function TrustStrip() {
  const TRUST = [
    { icon: Shield, title: 'Données sécurisées',     desc: 'Hébergement chiffré, sauvegardes automatiques quotidiennes.' },
    { icon: Globe,  title: 'Conçu pour le Cameroun', desc: 'Loyers en XAF, baux conformes au droit camerounais.' },
    { icon: Zap,    title: 'Support réactif',          desc: 'Une équipe disponible pour vous accompagner à chaque étape.' },
  ];

  return (
    <section className="py-16 px-6 relative" style={{ background: SURFACE, borderTop: `1px solid ${BORDER}` }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x"
          style={{ '--tw-divide-opacity': 1, '--tw-divide-color': BORDER } as React.CSSProperties}>
          {TRUST.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4 py-6 md:py-0 md:px-8 first:pl-0 last:pr-0">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(232,93,4,0.1)', color: O, border: '1px solid rgba(232,93,4,0.2)' }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: TEXT }}>{item.title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: MUTED }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function Contact() {
  const { ref, visible } = useInView();
  const [form, setForm] = useState({ nom: '', email: '', message: '' });

  const contactInfo = [
    { icon: Mail,   label: 'Email',        value: 'contact@simibail.cm',  href: 'mailto:contact@simibail.cm' },
    { icon: Phone,  label: 'Téléphone',    value: '+237 6XX XXX XXX',     href: 'tel:+237600000000' },
    { icon: MapPin, label: 'Localisation', value: 'Yaoundé, Cameroun',   href: '#' },
  ];

  return (
    <section id="contact" ref={ref} className="py-32 relative overflow-hidden" style={{ background: BG }}>
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle,rgba(232,93,4,0.05) 0%,transparent 65%)`, filter: 'blur(80px)' }} />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <SectionLabel>Contact</SectionLabel>
          <h2 className="font-black leading-tight mt-2 mb-4" style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', color: TEXT }}>
            Parlons de votre{' '}
            <span style={{ color: O }}>parc locatif.</span>
          </h2>
          <p className="max-w-md mx-auto" style={{ color: MUTED, lineHeight: 1.8 }}>
            Une question ? Un projet ? Notre équipe vous répond sous 24h.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Formulaire */}
          <div className={`rounded-3xl p-8 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ ...glass(0.7), border: `1px solid rgba(232,93,4,0.2)` }}>
            <form className="space-y-5" onSubmit={e => e.preventDefault()}>
              {([
                { id: 'nom',   label: 'Nom',   type: 'text',  ph: 'Votre nom...',    key: 'nom' },
                { id: 'email', label: 'Email', type: 'email', ph: 'votre@email.cm', key: 'email' },
              ] as { id: string; label: string; type: string; ph: string; key: 'nom' | 'email' }[]).map(field => (
                <div key={field.id}>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: MUTED }}>{field.label}</label>
                  <input id={field.id} type={field.type} required placeholder={field.ph}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-xl outline-none transition-all text-sm"
                    style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
                    onFocus={e => e.currentTarget.style.borderColor = O}
                    onBlur={e => e.currentTarget.style.borderColor = BORDER} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: MUTED }}>Message</label>
                <textarea rows={5} required placeholder="Votre message..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-xl outline-none transition-all text-sm resize-none"
                  style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT }}
                  onFocus={e => e.currentTarget.style.borderColor = O}
                  onBlur={e => e.currentTarget.style.borderColor = BORDER} />
              </div>
              <button type="submit"
                className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={glowBtn}
                onMouseEnter={e => { e.currentTarget.style.background = '#c44e00'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = O; e.currentTarget.style.transform = 'none'; }}>
                Envoyer le message <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Infos */}
          <div className={`space-y-5 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="rounded-3xl p-7" style={glass()}>
              <h3 className="font-bold mb-5" style={{ color: TEXT }}>Coordonnées</h3>
              <div className="space-y-2">
                {contactInfo.map(item => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href}
                      className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200"
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(232,93,4,0.06)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(232,93,4,0.1)', color: O }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: MUTED }}>{item.label}</div>
                        <div className="text-sm font-medium" style={{ color: TEXT }}>{item.value}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl p-7" style={{ ...glass(), border: `1px solid rgba(232,93,4,0.3)` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
                <span className="font-bold text-sm" style={{ color: TEXT }}>Disponible pour nouveaux clients</span>
              </div>
              <p className="text-sm" style={{ color: MUTED, lineHeight: 1.8 }}>
                Onboarding rapide en moins de 48h. Votre parc locatif sera configuré et opérationnel dès le premier jour.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCta() {
  return (
    <section className="py-32 px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#08090b 0%,#0c1015 100%)', minHeight: '520px' }}>
      <EarthBackground />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1,
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%,rgba(232,93,4,0.08) 0%,transparent 60%),radial-gradient(ellipse at center,rgba(0,0,0,0) 30%,rgba(8,9,11,0.9) 100%)' }} />

      <div className="max-w-2xl mx-auto text-center relative" style={{ zIndex: 2 }}>
        <SectionLabel>Passez à l'action</SectionLabel>
        <h2 className="font-black leading-tight my-6" style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', color: TEXT }}>
          Prêt à simplifier votre gestion avec{' '}
          <span style={{ color: O }}>Simi Bail ?</span>
        </h2>
        <p className="mb-10 text-sm" style={{ color: MUTED, lineHeight: 1.9 }}>
          Rejoignez les bailleurs camerounais qui gagnent des heures chaque semaine
          grâce à <strong style={{ color: O }}>Simi Bail</strong>.
          Aucune carte bancaire requise pour commencer.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/login"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-sm transition-all duration-200"
            style={glowBtn}
            onMouseEnter={e => { e.currentTarget.style.background = '#c44e00'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(232,93,4,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = O; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(232,93,4,0.4)'; }}>
            Commencer gratuitement <ChevronRight size={16} />
          </Link>
          <AnimatedBorderBtn href="#contact">Nous contacter</AnimatedBorderBtn>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const links = [
    { href: '#features',    label: 'Fonctionnalités' },
    { href: '#screenshots', label: 'Aperçu' },
    { href: '#pricing',     label: 'Tarifs' },
    { href: '#contact',     label: 'Contact' },
  ];

  return (
    <footer className="py-12 px-6" style={{ background: '#080909', borderTop: `1px solid ${BORDER}` }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2.5 justify-center md:justify-start mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm"
                style={{ background: `linear-gradient(135deg,${O},${O2})`, color: '#fff' }}>SB</div>
              <span className="font-bold text-base" style={{ color: TEXT }}>Simi<span style={{ color: O }}>Bail</span></span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(240,242,245,0.25)' }}>
              © {new Date().getFullYear()} Simi Bail — Fait  pour les bailleurs du Cameroun
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            {links.map(l => (
              <a key={l.href} href={l.href} className="text-sm transition-colors" style={{ color: MUTED }}
                onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}>
                {l.label}
              </a>
            ))}
          </nav>

          <Link to="/login" className="text-sm font-semibold transition-all duration-200 flex items-center gap-1.5"
            style={{ color: O }}
            onMouseEnter={e => { e.currentTarget.style.color = O2; e.currentTarget.style.gap = '8px'; }}
            onMouseLeave={e => { e.currentTarget.style.color = O; }}>
            Accéder à l'application <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes animated-border-path {
          0%   { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: -550; }
        }
      `}</style>
      <Navbar />
      <Hero />
      <Features />
      <Screenshots />
      <Testimonials />
      <Pricing />
      <TrustStrip />
      <Contact />
      <FinalCta />
      <Footer />
    </div>
  );
}
