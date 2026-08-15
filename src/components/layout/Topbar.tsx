import {  Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import ThemePicker from '../ui/ThemePicker';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();

  const initiales = user
    ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    : '?';
  const nomComplet = user ? `${user.prenom} ${user.nom}` : '';
  const roleLabel = user?.role === 'admin' ? 'Administrateur' : 'Gestionnaire';

  return (
    <header
      className="flex items-center gap-4 px-6 sticky top-0 z-30 shrink-0"
      style={{
        height: '64px',
        background: 'var(--color-base-100)',
        borderBottom: '1px solid var(--color-base-300)',
      }}
    >
      {/* ── Barre de recherche ───────────────────────────── */}
      <div
        className="flex items-center gap-3 flex-1 max-w-md rounded-xl px-4"
        style={{
          height: '40px',
          background: 'var(--color-base-200)',
          border: '1px solid var(--color-base-300)',
        }}
      >
        <Search size={14} style={{ color: 'var(--color-base-content)', opacity: 0.4 }} />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1"
          style={{ color: 'var(--color-base-content)' }}
        />
        <kbd
          className="text-xs px-1.5 py-0.5 rounded font-mono"
          style={{ background: 'var(--color-base-300)', color: 'var(--color-base-content)', opacity: 0.6 }}
        >
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      {/* ── Page title ──────────────────────────────────── */}
      <span
        className="text-sm font-medium hidden lg:block"
        style={{ color: 'var(--color-base-content)', opacity: 0.45 }}
      >
        {title}
      </span>

      {/* ── Actions droite ──────────────────────────────── */}
      <div className="flex items-center gap-1">
        <ThemePicker />

    

       

        {/* Séparateur */}
        <div className="w-px h-7 mx-1" style={{ background: 'var(--color-base-300)' }} />

        {/* Avatar + infos utilisateur */}
        <div className="flex items-center gap-2.5 pl-1">
          <div
            className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--color-primary)',
              color: 'var(--color-primary-content)',
            }}
          >
            {initiales}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--color-base-content)' }}>
              {nomComplet}
            </div>
            <div className="text-xs leading-tight" style={{ color: 'var(--color-base-content)', opacity: 0.5 }}>
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="w-px h-7 mx-1" style={{ background: 'var(--color-base-300)' }} />

        {/* Bouton logout */}
        <button
          onClick={logout}
          title="Se déconnecter"
          className="rounded-xl p-2 transition-colors"
          style={{ color: 'var(--color-base-content)', opacity: 0.55 }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.opacity = '1';
            (e.currentTarget as HTMLElement).style.background = 'var(--color-error)';
            (e.currentTarget as HTMLElement).style.color = 'var(--color-error-content)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = '0.55';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--color-base-content)';
          }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
