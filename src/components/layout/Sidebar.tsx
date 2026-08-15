import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, UserCheck, FileText,
  CreditCard, MessageSquare, TrendingUp, Calculator,
  ClipboardList, Wrench, ChevronLeft, ChevronRight, Home,
  Settings, HelpCircle, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navGroups = [
  {
    label: 'ACCUEIL',
    items: [
      { path: '/app', label: 'Tableau de bord', icon: LayoutDashboard },
    ],
  },
  {
    label: 'PARC LOCATIF',
    items: [
      { path: '/app/proprietaires', label: 'Propriétaires', icon: Users },
      { path: '/app/logements',     label: 'Logements',     icon: Building2 },
      { path: '/app/locataires',    label: 'Locataires',    icon: UserCheck },
    ],
  },
  {
    label: 'GESTION',
    items: [
      { path: '/app/candidatures', label: 'Candidatures', icon: Home },
      { path: '/app/baux',         label: 'Baux',         icon: FileText },
      { path: '/app/paiements',    label: 'Paiements',    icon: CreditCard },
    ],
  },
  {
    label: 'AUTOMATISATION',
    items: [
      { path: '/app/communications', label: 'Communications',     icon: MessageSquare },
      { path: '/app/revisions',      label: 'Révisions & Charges', icon: TrendingUp },
      { path: '/app/comptabilite',   label: 'Comptabilité',       icon: Calculator },
    ],
  },
  {
    label: 'TERRAIN',
    items: [
      { path: '/app/etats-des-lieux', label: 'États des lieux', icon: ClipboardList },
      { path: '/app/maintenance',     label: 'Maintenance',     icon: Wrench },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const initiales = user
    ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    : '?';
  const nomComplet = user ? `${user.prenom} ${user.nom}` : '';
  const roleLabel = user?.role === 'admin' ? 'Administrateur' : 'Gestionnaire';


  return (
    <aside
      className="flex flex-col h-screen sticky top-0 z-40"
      style={{
        width: collapsed ? '64px' : '240px',
        minWidth: collapsed ? '64px' : '240px',
        background: 'var(--color-base-200)',
        borderRight: '1px solid var(--color-base-300)',
        transition: 'width 0.25s ease, min-width 0.25s ease',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: '64px',
          borderBottom: '1px solid var(--color-base-300)',
        }}
      >
        {/* Carré logo style SIMI */}
        <div
          className="flex items-center justify-center rounded-lg shrink-0 font-bold text-sm"
          style={{
            width: '36px',
            height: '36px',
            background: 'var(--color-primary)',
            color: 'var(--color-primary-content)',
          }}
        >
          SB
        </div>

        {!collapsed && (
          <div className="overflow-hidden leading-tight">
            <div
              className="font-bold text-sm"
              style={{ color: 'var(--color-base-content)' }}
            >
              SIMI
            </div>
            <div
              className="text-xs font-semibold tracking-wide"
              style={{ color: 'var(--color-primary)' }}
            >
             BAIL
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-lg p-1 transition-colors"
          style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.4'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map(group => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div
                className="px-3 py-1 text-xs font-semibold tracking-widest mb-1"
                style={{ color: 'var(--color-base-content)', opacity: 0.3 }}
              >
                {group.label}
              </div>
            )}
            {group.items.map(({ path, label, icon: Icon }) => {
              const isActive =
                path === '/app'
                  ? location.pathname === '/app' || location.pathname === '/app/'
                  : location.pathname.startsWith(path);

              return (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? label : undefined}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all"
                  style={isActive
                    ? {
                        background: 'var(--color-primary)',
                        color: 'var(--color-primary-content)',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--color-base-content)',
                        opacity: 0.65,
                      }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)';
                      (e.currentTarget as HTMLElement).style.opacity = '1';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.opacity = '0.65';
                    }
                  }}
                >
                  <Icon size={17} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer utilisateur ───────────────────────────── */}
      <div
        className="shrink-0"
        style={{ borderTop: '1px solid var(--color-base-300)' }}
      >
        {/* Icônes settings / help */}
        {!collapsed && (
          <div className="flex items-center gap-1 px-4 py-2">
            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.4'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Settings size={15} />
            </button>
            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.4'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <HelpCircle size={15} />
            </button>
          </div>
        )}

        {/* Avatar utilisateur */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
            style={{
              width: '34px',
              height: '34px',
              background: 'var(--color-primary)',
              color: 'var(--color-primary-content)',
            }}
          >
            {initiales}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <div
                className="text-xs font-semibold truncate"
                style={{ color: 'var(--color-base-content)' }}
              >
                {nomComplet}
              </div>
              <div
                className="text-xs truncate"
                style={{ color: 'var(--color-base-content)', opacity: 0.45 }}
              >
                {roleLabel}
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              title="Se déconnecter"
              className="p-1.5 rounded-lg shrink-0 transition-colors"
              style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.4'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
