import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  unit?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean; label?: string };
  accentColor?: string;
}

// Correspondance hex → couleur CSS sémantique
const colorVar: Record<string, string> = {
  '#e85d04': 'var(--color-primary)',
  '#ef4444': 'var(--color-error)',
  '#22c55e': 'var(--color-success)',
  '#f59e0b': 'var(--color-warning)',
  '#fbbf24': 'var(--color-warning)',
  '#3b82f6': 'var(--color-info)',
  '#a855f7': 'var(--color-secondary)',
  '#06b6d4': 'var(--color-accent)',
  '#4ade80': 'var(--color-success)',
};

export default function StatCard({
  label, value, subtitle, unit, icon, trend, accentColor
}: StatCardProps) {
  const color = (accentColor && colorVar[accentColor]) ?? 'var(--color-primary)';

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: 'var(--color-base-200)',
        border: '1px solid var(--color-base-300)',
      }}
    >
      {/* Ligne supérieure : icône + badge trend */}
      <div className="flex items-start justify-between">
        {/* Icône dans carré coloré style SIMI */}
        <div
          className="rounded-xl p-2 flex items-center justify-center"
          style={{ background: color + '22' }}
        >
          <span style={{ color }}>{icon}</span>
        </div>

        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
            style={{
              background: trend.positive ? 'var(--color-success)' + '22' : 'var(--color-error)' + '22',
              color: trend.positive ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {trend.positive
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />}
            {trend.value}
          </div>
        )}
      </div>

      {/* Label */}
      <div
        className="text-xs font-bold tracking-widest uppercase mt-1"
        style={{ color: 'var(--color-base-content)', opacity: 0.45 }}
      >
        {label}
      </div>

      {/* Grande valeur style SIMI */}
      <div
        className="text-3xl font-extrabold leading-none"
        style={{ color: 'var(--color-base-content)' }}
      >
        {value}
      </div>

      {/* Unité / sous-titre */}
      {(unit || subtitle) && (
        <div
          className="text-xs"
          style={{ color: 'var(--color-base-content)', opacity: 0.5 }}
        >
          {unit ?? subtitle}
        </div>
      )}

      {/* Label comparaison trend */}
      {trend?.label && (
        <div
          className="text-xs"
          style={{ color: trend.positive ? 'var(--color-success)' : 'var(--color-error)', opacity: 0.8 }}
        >
          {trend.label}
        </div>
      )}
    </div>
  );
}
