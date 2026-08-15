import { useState } from 'react';
import { TrendingUp, Calculator, Plus, AlertCircle } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import StatCard from '../components/ui/StatCard';
import { useApi } from '../hooks/useApi';
import { revisionsApi, bauxApi, locatairesApi, logementsApi } from '../lib/api';
import { formatMontant, formatDate } from '../lib/utils';
import type { RevisionLoyer, RegularisationCharges, ChargeLocative, Bail, Locataire, Logement } from '../types';

export default function Revisions() {
  const [activeTab, setActiveTab] = useState<'revisions' | 'charges'>('revisions');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showRegulModal, setShowRegulModal] = useState(false);
  const [revForm, setRevForm] = useState({ bailId: '', ancienLoyer: '', indiceIRL: '', indiceRef: '' });
  const [regulForm, setRegulForm] = useState({ bailId: '', periode: '', provisionsPercues: '', chargesReelles: '' });

  const { data: revisionsLoyer, refetch: refetchRevisions } = useApi<RevisionLoyer[]>(revisionsApi.list, []);
  const { data: regularisations, refetch: refetchReguls } = useApi<RegularisationCharges[]>(revisionsApi.listRegularisations, []);
  const { data: chargesLocatives } = useApi<ChargeLocative[]>(revisionsApi.listCharges, []);
  const { data: allBaux } = useApi<Bail[]>(bauxApi.list, []);
  const { data: allLocataires } = useApi<Locataire[]>(locatairesApi.list, []);
  const { data: allLogements } = useApi<Logement[]>(logementsApi.list, []);

  const getBail = (id: string) => allBaux.find(b => b.id === id);
  const getLocataire = (id: string) => allLocataires.find(l => l.id === id);
  const getLogement = (id: string) => allLogements.find(l => l.id === id);

  const revisionsAppliquees = revisionsLoyer.filter(r => r.applique);
  const totalSoldeRestitue = regularisations.filter(r => r.solde > 0).reduce((s, r) => s + r.solde, 0);
  const revisionsAvecTaux = revisionsLoyer.filter(r => r.tauxVariation != null && !isNaN(Number(r.tauxVariation)));
  const tauxMoyen = revisionsAvecTaux.length > 0
    ? (revisionsAvecTaux.reduce((s, r) => s + Number(r.tauxVariation), 0) / revisionsAvecTaux.length).toFixed(1)
    : '0';

  const handleRevision = async () => {
    const ancienLoyer = Number(revForm.ancienLoyer);
    const indiceIRL = Number(revForm.indiceIRL);
    const indiceRef = Number(revForm.indiceRef);
    const tauxVariation = indiceRef > 0 ? Number(((indiceIRL - indiceRef) / indiceRef * 100).toFixed(2)) : 0;
    const nouveauLoyer = Math.round(ancienLoyer * (1 + tauxVariation / 100));
    await revisionsApi.create({ bailId: revForm.bailId, date: new Date().toISOString().slice(0, 10), ancienLoyer, nouveauLoyer, indiceIRL, tauxVariation, applique: false });
    refetchRevisions();
    setShowRevisionModal(false);
  };

  const handleRegularisation = async () => {
    const provisionsPercues = Number(regulForm.provisionsPercues);
    const chargesReelles = Number(regulForm.chargesReelles);
    await revisionsApi.createRegularisation({ bailId: regulForm.bailId, periode: regulForm.periode, provisionsPercues, chargesReelles, solde: provisionsPercues - chargesReelles });
    refetchReguls();
    setShowRegulModal(false);
  };

  const activeBaux = allBaux.filter(b => b.statut === 'actif');

  return (
    <div>
      <PageHeader
        title="Révisions & Charges"
        subtitle="Révisions de loyer IRL et régularisations annuelles"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Calculator size={16} />} onClick={() => setShowRegulModal(true)}>Régularisation</Button>
            <Button icon={<Plus size={16} />} onClick={() => setShowRevisionModal(true)}>Révision loyer</Button>
          </div>
        }
      />

      {revisionsLoyer.some(r => !r.applique) && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 bg-warning/10 border border-warning/30">
          <AlertCircle size={18} className="text-warning" />
          <span className="text-sm text-warning">
            {revisionsLoyer.filter(r => !r.applique).length} révision(s) en attente d'application
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Révisions effectuées" value={revisionsAppliquees.length} icon={<TrendingUp size={20} />} accentColor="#e85d04" />
        <StatCard label="Augmentation moyenne" value={`+${tauxMoyen}%`} icon={<TrendingUp size={20} />} accentColor="#22c55e" />
        <StatCard label="Régularisations" value={regularisations.length} icon={<Calculator size={20} />} accentColor="#3b82f6" />
        <StatCard label="Solde restitué" value={formatMontant(totalSoldeRestitue)} icon={<Calculator size={20} />} accentColor="#22c55e" />
      </div>

      <div className="flex gap-2 mb-6">
        {[{ value: 'revisions', label: 'Révisions de loyer' }, { value: 'charges', label: 'Régularisations charges' }].map(t => (
          <button key={t.value} onClick={() => setActiveTab(t.value as typeof activeTab)}
            className={activeTab === t.value ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'revisions' && (
        revisionsLoyer.length === 0
          ? <div className="text-center py-20 text-base-content/40">Aucune révision</div>
          : <Table<RevisionLoyer>
              columns={[
                {
                  key: 'bail', label: 'Locataire / Logement',
                  render: (r: RevisionLoyer) => {
                    const bail = getBail(r.bailId);
                    const loc = bail ? getLocataire(bail.locataireId) : null;
                    const log = bail ? getLogement(bail.logementId) : null;
                    return (
                      <div>
                        <div className="font-semibold text-base-content">{loc?.prenom} {loc?.nom}</div>
                        <div className="text-xs text-base-content/40">{log?.adresse}</div>
                      </div>
                    );
                  },
                },
                { key: 'date', label: 'Date', render: (r: RevisionLoyer) => formatDate(r.date) },
                { key: 'ancienLoyer', label: 'Ancien loyer', render: (r: RevisionLoyer) => formatMontant(r.ancienLoyer) },
                { key: 'nouveauLoyer', label: 'Nouveau loyer', render: (r: RevisionLoyer) => <span className="font-bold text-primary">{formatMontant(r.nouveauLoyer)}</span> },
                { key: 'indiceIRL', label: 'Indice IRL', render: (r: RevisionLoyer) => Number(r.indiceIRL).toFixed(2) },
                { key: 'tauxVariation', label: 'Variation', render: (r: RevisionLoyer) => <span className="text-success">+{r.tauxVariation}%</span> },
                { key: 'applique', label: 'Statut', render: (r: RevisionLoyer) => <Badge label={r.applique ? 'Appliqué' : 'En attente'} variant={r.applique ? 'success' : 'warning'} /> },
              ]}
              data={revisionsLoyer}
            />
      )}

      {activeTab === 'charges' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-base-content mb-3">Régularisations</h3>
            {regularisations.length === 0
              ? <div className="text-center py-12 text-base-content/40">Aucune régularisation</div>
              : <Table<RegularisationCharges>
                  columns={[
                    {
                      key: 'bail', label: 'Bail',
                      render: (r: RegularisationCharges) => {
                        const bail = getBail(r.bailId);
                        const loc = bail ? getLocataire(bail.locataireId) : null;
                        return <span className="text-base-content">{loc?.prenom} {loc?.nom}</span>;
                      },
                    },
                    { key: 'periode', label: 'Période' },
                    { key: 'provisionsPercues', label: 'Provisions', render: (r: RegularisationCharges) => formatMontant(r.provisionsPercues) },
                    { key: 'chargesReelles', label: 'Réelles', render: (r: RegularisationCharges) => formatMontant(r.chargesReelles) },
                    {
                      key: 'solde', label: 'Solde',
                      render: (r: RegularisationCharges) => (
                        <span className={`font-bold ${r.solde > 0 ? 'text-success' : 'text-error'}`}>
                          {r.solde > 0 ? '+' : ''}{formatMontant(r.solde)}
                        </span>
                      ),
                    },
                    { key: 'statut', label: 'Statut', render: (r: RegularisationCharges) => <Badge label={r.statut} variant={r.statut === 'reglee' ? 'success' : 'warning'} /> },
                  ]}
                  data={regularisations}
                />
            }
          </div>

          <div>
            <h3 className="text-sm font-bold text-base-content mb-3">Charges réelles saisies</h3>
            {chargesLocatives.length === 0
              ? <div className="text-center py-12 text-base-content/40">Aucune charge saisie</div>
              : <Table<ChargeLocative>
                  columns={[
                    { key: 'logement', label: 'Logement', render: (r: ChargeLocative) => <span className="text-base-content">{getLogement(r.logementId)?.adresse ?? '—'}</span> },
                    { key: 'periode', label: 'Année' },
                    { key: 'typeCharge', label: 'Type' },
                    { key: 'montantReel', label: 'Montant', render: (r: ChargeLocative) => formatMontant(r.montantReel) },
                  ]}
                  data={chargesLocatives}
                />
            }
          </div>
        </div>
      )}

      <Modal open={showRevisionModal} onClose={() => setShowRevisionModal(false)} title="Nouvelle révision de loyer">
        <div className="flex flex-col gap-4">
          <Select label="Bail concerné" value={revForm.bailId}
            onChange={e => setRevForm(f => ({ ...f, bailId: e.target.value }))}
            options={[
              { value: '', label: 'Sélectionner un bail...' },
              ...activeBaux.map(b => {
                const loc = getLocataire(b.locataireId);
                const log = getLogement(b.logementId);
                return { value: b.id, label: loc && log ? `${loc.prenom} ${loc.nom} — ${log.adresse}` : b.id };
              }),
            ]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ancien loyer (XAF)" type="number" placeholder="430000"
              value={revForm.ancienLoyer} onChange={e => setRevForm(f => ({ ...f, ancienLoyer: e.target.value }))} />
            <Input label="Indice IRL actuel" type="number" placeholder="136.82"
              value={revForm.indiceIRL} onChange={e => setRevForm(f => ({ ...f, indiceIRL: e.target.value }))} />
          </div>
          <Input label="Indice IRL de référence (N-1)" type="number" placeholder="132.23"
            value={revForm.indiceRef} onChange={e => setRevForm(f => ({ ...f, indiceRef: e.target.value }))} />
          {revForm.ancienLoyer && revForm.indiceIRL && revForm.indiceRef && (
            <div className="p-3 rounded-xl bg-base-100 border border-base-300">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Nouveau loyer calculé</span>
                <span className="font-bold text-success">
                  {formatMontant(Math.round(Number(revForm.ancienLoyer) * Number(revForm.indiceIRL) / Number(revForm.indiceRef)))}
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowRevisionModal(false)}>Annuler</Button>
            <Button onClick={handleRevision}>Créer la révision</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showRegulModal} onClose={() => setShowRegulModal(false)} title="Calcul de régularisation des charges">
        <div className="flex flex-col gap-4">
          <Select label="Bail concerné" value={regulForm.bailId}
            onChange={e => setRegulForm(f => ({ ...f, bailId: e.target.value }))}
            options={[
              { value: '', label: 'Sélectionner...' },
              ...activeBaux.map(b => {
                const loc = getLocataire(b.locataireId);
                return { value: b.id, label: loc ? `${loc.prenom} ${loc.nom}` : b.id };
              }),
            ]} />
          <Input label="Période (année)" type="number" placeholder="2024"
            value={regulForm.periode} onChange={e => setRegulForm(f => ({ ...f, periode: e.target.value }))} />
          <Input label="Provisions perçues (XAF)" type="number" placeholder="600000"
            value={regulForm.provisionsPercues} onChange={e => setRegulForm(f => ({ ...f, provisionsPercues: e.target.value }))} />
          <Input label="Charges réelles totales (XAF)" type="number" placeholder="580000"
            value={regulForm.chargesReelles} onChange={e => setRegulForm(f => ({ ...f, chargesReelles: e.target.value }))} />
          {regulForm.provisionsPercues && regulForm.chargesReelles && (
            <div className="p-3 rounded-xl bg-base-100 border border-base-300">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Solde</span>
                {(() => {
                  const solde = Number(regulForm.provisionsPercues) - Number(regulForm.chargesReelles);
                  return (
                    <span className={`font-bold ${solde >= 0 ? 'text-success' : 'text-error'}`}>
                      {solde >= 0 ? '+' : ''}{formatMontant(solde)} ({solde >= 0 ? 'à rembourser' : 'à réclamer'})
                    </span>
                  );
                })()}
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowRegulModal(false)}>Annuler</Button>
            <Button onClick={handleRegularisation}>Valider et notifier</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
