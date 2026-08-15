import { Mail, MessageSquare, Send, Settings, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import StatCard from '../components/ui/StatCard';
import { SkeletonPageHeader, SkeletonStatCards, SkeletonTable } from '../components/ui/Skeleton';
import { useApi } from '../hooks/useApi';
import { communicationsApi, locatairesApi } from '../lib/api';
import { formatDate } from '../lib/utils';
import type { Communication, Relance, Locataire } from '../types';

const palierConfig = {
  rappel_amical: { label: 'Rappel amical', variant: 'info' as const },
  mise_en_demeure: { label: 'Mise en demeure', variant: 'warning' as const },
  contentieux: { label: 'Contentieux', variant: 'danger' as const },
};

export default function Communications() {
  const { data: communications, loading } = useApi<Communication[]>(communicationsApi.list, []);
  const { data: relances } = useApi<Relance[]>(communicationsApi.listRelances, []);
  const { data: allLocataires } = useApi<Locataire[]>(locatairesApi.list, []);

  const getLocataire = (id: string) => allLocataires.find(l => l.id === id);

  const envoyes = communications.filter(c => c.statut === 'envoye');
  const quittances = communications.filter(c => c.type === 'quittance');
  const relancesComm = communications.filter(c => c.type === 'relance');
  const totalEnvoyes = envoyes.length;
  const tauxSucces = communications.length > 0
    ? Math.round((envoyes.length / communications.length) * 100)
    : 0;

  return (
    <div>
      {loading ? (
        <>
          <SkeletonPageHeader />
          <SkeletonStatCards count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl p-5 animate-pulse" style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)', minHeight: '300px' }} />
            <div className="flex flex-col gap-4">
              {[1,2,3].map(i => <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)', height: '120px' }} />)}
            </div>
          </div>
        </>
      ) : (
      <>
      <PageHeader
        title="Communications"
        subtitle="Historique des quittances, relances et notifications"
        action={
          <Button icon={<Settings size={16} />} variant="secondary">
            Configurer templates
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total envoyés"
          value={totalEnvoyes}
          icon={<Send size={20} />}
          accentColor="#e85d04"
        />
        <StatCard
          label="Quittances"
          value={quittances.length}
          icon={<Mail size={20} />}
          accentColor="#22c55e"
        />
        <StatCard
          label="Relances"
          value={relancesComm.length}
          icon={<MessageSquare size={20} />}
          accentColor="#ef4444"
        />
        <StatCard
          label="Taux succès"
          value={`${tauxSucces}%`}
          icon={<CheckCircle size={20} />}
          accentColor="#22c55e"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-sm font-bold text-base-content mb-4">Historique des envois</h2>
            {communications.length === 0 ? (
              <div className="text-center py-12 text-base-content/40">Aucune communication</div>
            ) : (
              <Table<Communication>
                columns={[
                  {
                    key: 'type', label: 'Type',
                    render: r => (
                      <div className="flex items-center gap-2">
                        {r.canal === 'email'
                          ? <Mail size={14} className="text-info" />
                          : <MessageSquare size={14} className="text-success" />}
                        <Badge
                          label={r.type === 'quittance' ? 'Quittance' : r.type === 'relance' ? 'Relance' : 'Notif.'}
                          variant={r.type === 'quittance' ? 'success' : r.type === 'relance' ? 'warning' : 'info'}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'locataire', label: 'Destinataire',
                    render: r => {
                      const loc = getLocataire(r.locataireId);
                      return <span className="text-base-content">{loc?.prenom} {loc?.nom}</span>;
                    }
                  },
                  { key: 'objet', label: 'Objet', render: r => <span className="text-base-content/60">{r.objet}</span> },
                  { key: 'date', label: 'Date', render: r => formatDate(r.date) },
                  {
                    key: 'statut', label: 'Statut',
                    render: r => r.statut === 'envoye'
                      ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle size={12} /> Envoyé</span>
                      : <span className="flex items-center gap-1 text-xs text-error"><XCircle size={12} /> Échec</span>
                  },
                ]}
                data={communications}
              />
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="text-sm font-bold text-base-content mb-4">Relances en cours</h2>
            {relances.length === 0 ? (
              <div className="text-center py-8 text-base-content/40">Aucune relance</div>
            ) : (
              <div className="flex flex-col gap-3">
                {relances.map(r => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-base-100 border border-base-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge label={palierConfig[r.palier].label} variant={palierConfig[r.palier].variant} />
                      <span className="text-xs text-base-content/40">{formatDate(r.dateEnvoi)}</span>
                    </div>
                    <div className="text-xs text-base-content/60">
                      Paiement ID: {r.paiementId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-bold text-base-content mb-4">Configuration paliers</h2>
            <div className="flex flex-col gap-3">
              {[
                { palier: 'J+5', label: 'Rappel amical', colorClass: 'bg-info' },
                { palier: 'J+15', label: 'Mise en demeure', colorClass: 'bg-warning' },
                { palier: 'J+30', label: 'Contentieux', colorClass: 'bg-error' },
              ].map(({ palier, label, colorClass }) => (
                <div key={palier} className="flex items-center justify-between py-2 border-b border-base-300">
                  <div>
                    <div className="text-sm text-base-content font-medium">{label}</div>
                    <div className="text-xs text-base-content/40">Après {palier}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full justify-center">
                Modifier
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-bold text-base-content mb-4">Canaux actifs</h2>
            <div className="flex flex-col gap-3">
              {[
                { icon: <Mail size={16} />, label: 'Email', actif: true, colorClass: 'text-info' },
                { icon: <MessageSquare size={16} />, label: 'SMS', actif: true, colorClass: 'text-success' },
              ].map(({ icon, label, actif, colorClass }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={colorClass}>{icon}</span>
                    <span className="text-sm text-base-content">{label}</span>
                  </div>
                  <div
                    className={`w-10 h-5 rounded-full flex items-center px-0.5 ${actif ? 'bg-primary' : 'bg-base-300'}`}
                  >
                    <div
                      className="w-4 h-4 rounded-full bg-white transition-all"
                      style={{ transform: actif ? 'translateX(20px)' : 'translateX(0)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
