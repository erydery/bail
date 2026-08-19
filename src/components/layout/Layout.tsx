import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const segments = location.pathname.split('/').filter(Boolean);
  const base = segments.length >= 2 ? `/${segments[0]}/${segments[1]}` : `/${segments[0]}`;
  const title = pageTitles[base] ?? 'Simi Bail';

  // Ferme le drawer à chaque changement de route sur mobile
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-base-100)' }}>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — cachée sur mobile, visible en drawer quand ouverte */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: 'var(--color-base-100)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
