import type {
  Proprietaire, Logement, Locataire, Candidature,
  Bail, Paiement, Communication, Relance,
  RevisionLoyer, ChargeLocative, RegularisationCharges,
  Depense, Reversement, EtatDesLieux, Maintenance,
} from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ── Token storage ─────────────────────────────────────────────────────────
export const token = {
  get: () => localStorage.getItem('gl_token'),
  set: (t: string) => localStorage.setItem('gl_token', t),
  clear: () => localStorage.removeItem('gl_token'),
};

// ── Core fetch wrapper ────────────────────────────────────────────────────
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = token.get();
  if (t) headers['Authorization'] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json();
  if (!res.ok) {
    const msg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  get:    <T>(path: string)                    => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown)     => request<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown)     => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body: unknown)     => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                    => request<T>('DELETE', path),
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) => api.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password }),
  register: (data: RegisterData)              => api.post<{ token: string; user: AuthUser }>('/api/auth/register', data),
  me:       ()                                => api.get<AuthUser>('/api/auth/me'),
};

// ── Resource APIs ─────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get<Record<string, number>>('/api/dashboard/stats'),
};

export const proprietairesApi = {
  list:   ()                       => api.get<Proprietaire[]>('/api/proprietaires'),
  get:    (id: string)             => api.get<Proprietaire>(`/api/proprietaires/${id}`),
  create: (d: unknown)             => api.post<Proprietaire>('/api/proprietaires', d),
  update: (id: string, d: unknown) => api.put<Proprietaire>(`/api/proprietaires/${id}`, d),
  delete: (id: string)             => api.delete<void>(`/api/proprietaires/${id}`),
};

export const logementsApi = {
  list:   ()                       => api.get<Logement[]>('/api/logements'),
  get:    (id: string)             => api.get<Logement>(`/api/logements/${id}`),
  create: (d: unknown)             => api.post<Logement>('/api/logements', d),
  update: (id: string, d: unknown) => api.put<Logement>(`/api/logements/${id}`, d),
  delete: (id: string)             => api.delete<void>(`/api/logements/${id}`),
};

export const locatairesApi = {
  list:   ()                       => api.get<Locataire[]>('/api/locataires'),
  get:    (id: string)             => api.get<Locataire>(`/api/locataires/${id}`),
  create: (d: unknown)             => api.post<Locataire>('/api/locataires', d),
  update: (id: string, d: unknown) => api.put<Locataire>(`/api/locataires/${id}`, d),
  delete: (id: string)             => api.delete<void>(`/api/locataires/${id}`),
};

export const candidaturesApi = {
  list:   ()                       => api.get<Candidature[]>('/api/candidatures'),
  get:    (id: string)             => api.get<Candidature>(`/api/candidatures/${id}`),
  create: (d: unknown)             => api.post<Candidature>('/api/candidatures', d),
  update: (id: string, d: unknown) => api.put<Candidature>(`/api/candidatures/${id}`, d),
  delete: (id: string)             => api.delete<void>(`/api/candidatures/${id}`),
};

export const bauxApi = {
  list:   ()                       => api.get<Bail[]>('/api/baux'),
  get:    (id: string)             => api.get<Bail>(`/api/baux/${id}`),
  create: (d: unknown)             => api.post<Bail>('/api/baux', d),
  update: (id: string, d: unknown) => api.put<Bail>(`/api/baux/${id}`, d),
  delete: (id: string)             => api.delete<void>(`/api/baux/${id}`),
};

export const paiementsApi = {
  list: (params?: { bailId?: string; mois?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<Paiement[]>(`/api/paiements${q ? '?' + q : ''}`);
  },
  get:    (id: string)             => api.get<Paiement>(`/api/paiements/${id}`),
  create: (d: unknown)             => api.post<Paiement>('/api/paiements', d),
  update: (id: string, d: unknown) => api.put<Paiement>(`/api/paiements/${id}`, d),
};

export const communicationsApi = {
  list:          ()           => api.get<Communication[]>('/api/communications'),
  create:        (d: unknown) => api.post<Communication>('/api/communications', d),
  listRelances:  ()           => api.get<Relance[]>('/api/communications/relances'),
  createRelance: (d: unknown) => api.post<Relance>('/api/communications/relances', d),
};

export const revisionsApi = {
  list:                ()           => api.get<RevisionLoyer[]>('/api/revisions'),
  create:              (d: unknown) => api.post<RevisionLoyer>('/api/revisions', d),
  listCharges:         ()           => api.get<ChargeLocative[]>('/api/revisions/charges'),
  createCharge:        (d: unknown) => api.post<ChargeLocative>('/api/revisions/charges', d),
  listRegularisations: ()           => api.get<RegularisationCharges[]>('/api/revisions/regularisations'),
  createRegularisation:(d: unknown) => api.post<RegularisationCharges>('/api/revisions/regularisations', d),
};

export const comptabiliteApi = {
  listDepenses:      ()                       => api.get<Depense[]>('/api/comptabilite/depenses'),
  createDepense:     (d: unknown)             => api.post<Depense>('/api/comptabilite/depenses', d),
  listReversements:  ()                       => api.get<Reversement[]>('/api/comptabilite/reversements'),
  createReversement: (d: unknown)             => api.post<Reversement>('/api/comptabilite/reversements', d),
  updateReversement: (id: string, d: unknown) => api.put<Reversement>(`/api/comptabilite/reversements/${id}`, d),
};

export const etatsDesLieuxApi = {
  list:   ()                       => api.get<EtatDesLieux[]>('/api/etats-des-lieux'),
  get:    (id: string)             => api.get<EtatDesLieux>(`/api/etats-des-lieux/${id}`),
  create: (d: unknown)             => api.post<EtatDesLieux>('/api/etats-des-lieux', d),
  update: (id: string, d: unknown) => api.put<EtatDesLieux>(`/api/etats-des-lieux/${id}`, d),
};

export const maintenanceApi = {
  list:   ()                       => api.get<Maintenance[]>('/api/maintenance'),
  get:    (id: string)             => api.get<Maintenance>(`/api/maintenance/${id}`),
  create: (d: unknown)             => api.post<Maintenance>('/api/maintenance', d),
  update: (id: string, d: unknown) => api.put<Maintenance>(`/api/maintenance/${id}`, d),
  delete: (id: string)             => api.delete<void>(`/api/maintenance/${id}`),
};

// ── Types locaux ──────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'gestionnaire';
  avatar?: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: 'admin' | 'gestionnaire';
}
