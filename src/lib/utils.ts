export const formatMontant = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'decimal' }).format(n) + ' XAF';

export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
