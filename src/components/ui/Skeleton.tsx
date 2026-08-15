import type { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

/** Bloc animé générique */
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: 'var(--color-base-300)', ...style }}
    />
  );
}

/** Ligne de texte */
export function SkeletonLine({ width = '100%', height = '14px' }: { width?: string; height?: string }) {
  return <Skeleton style={{ width, height, borderRadius: '6px' }} />;
}

/** Carte skeleton avec lignes internes — pour les grilles de cards */
export function SkeletonCard({ lines = 3, height = '160px' }: { lines?: number; height?: string }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)', height }}
    >
      <SkeletonLine width="60%" height="16px" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i % 2 === 0 ? '90%' : '70%'} />
      ))}
    </div>
  );
}

/** Ligne de tableau skeleton */
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-base-300)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3" style={{ background: i % 2 === 0 ? 'var(--color-base-200)' : 'var(--color-base-100)' }}>
          <Skeleton style={{ height: '14px', width: i === 0 ? '70%' : '50%', borderRadius: '6px' }} />
        </td>
      ))}
    </tr>
  );
}

/** Tableau complet skeleton */
export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--color-base-300)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--color-base-300)' }}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton style={{ height: '12px', width: '60%', borderRadius: '4px' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Grille de cards skeleton */
export function SkeletonCardGrid({ count = 6, cols = 3, cardHeight = '180px' }: { count?: number; cols?: number; cardHeight?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={cardHeight} />
      ))}
    </div>
  );
}

/** StatCards skeleton (rangée de KPIs) */
export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4 mb-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)', minHeight: '90px' }}>
          <SkeletonLine width="55%" height="12px" />
          <SkeletonLine width="40%" height="28px" />
          <SkeletonLine width="65%" height="11px" />
        </div>
      ))}
    </div>
  );
}

/** Header de page skeleton */
export function SkeletonPageHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-col gap-2">
        <SkeletonLine width="200px" height="24px" />
        <SkeletonLine width="120px" height="14px" />
      </div>
      <Skeleton style={{ width: '130px', height: '38px', borderRadius: '12px' }} />
    </div>
  );
}
