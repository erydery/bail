import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import LogementsPublic from './pages/LogementsPublic';
import Dashboard from './pages/Dashboard';
import Proprietaires from './pages/Proprietaires';
import Logements from './pages/Logements';
import Locataires from './pages/Locataires';
import Candidatures from './pages/Candidatures';
import Baux from './pages/Baux';
import Paiements from './pages/Paiements';
import Communications from './pages/Communications';
import Revisions from './pages/Revisions';
import Comptabilite from './pages/Comptabilite';
import EtatsDesLieux from './pages/EtatsDesLieux';
import Maintenance from './pages/Maintenance';

// ── Garde de route ────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-base-100)' }}
      >
        <span className="loading loading-spinner loading-lg" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page publique */}
            <Route path="/" element={<Landing />} />

            {/* Logements publics */}
            <Route path="/logements" element={<LogementsPublic />} />
            <Route path="/logements/:id" element={<LogementsPublic />} />

            {/* Authentification */}
            <Route path="/login" element={<Login />} />

            {/* Pages protégées sous /app */}
            <Route path="/app" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="proprietaires"   element={<Proprietaires />} />
              <Route path="logements"       element={<Logements />} />
              <Route path="locataires"      element={<Locataires />} />
              <Route path="candidatures"    element={<Candidatures />} />
              <Route path="baux"            element={<Baux />} />
              <Route path="paiements"       element={<Paiements />} />
              <Route path="communications"  element={<Communications />} />
              <Route path="revisions"       element={<Revisions />} />
              <Route path="comptabilite"    element={<Comptabilite />} />
              <Route path="etats-des-lieux" element={<EtatsDesLieux />} />
              <Route path="maintenance"     element={<Maintenance />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
