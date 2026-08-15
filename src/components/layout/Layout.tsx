import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles: Record<string, string> = {
  '/app':               'Tableau de bord',
  '/app/proprietaires':  'Propriétaires',
  '/app/logements':      'Logements',
  '/app/locataires':     'Locataires',
  '/app/candidatures':   'Candidatures',
  '/app/baux':           'Baux',
  '/app/paiements':      'Paiements',
  '/app/communications': 'Communications',
  '/app/revisions':      'Révisions & Charges',
  '/app/comptabilite':   'Comptabilité',
  '/app/etats-des-lieux':'États des lieux',
  '/app/maintenance':    'Maintenance',
};

export default function Layout() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  // Reconstitue /app ou /app/xxx
  const base = segments.length >= 2 ? `/${segments[0]}/${segments[1]}` : `/${segments[0]}`;
  const title = pageTitles[base] ?? 'Simi Bail';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--color-base-100)' }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar title={title} />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: 'var(--color-base-100)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
