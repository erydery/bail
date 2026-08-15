import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  width?: string;
}

interface TableProps<T extends { id: string }> {
  /** Tableau de données — TypeScript infère T depuis ce prop */
  data: T[];
  /** Définition des colonnes, typées sur T */
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export default function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Aucune donnée',
}: TableProps<T>) {
  return (
    <div
      className="overflow-x-auto rounded-2xl"
      style={{ border: '1px solid var(--color-base-300)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--color-base-300)', borderBottom: '1px solid var(--color-base-300)' }}>
            {columns.map(col => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--color-base-content)', opacity: 0.45, width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 text-sm"
                style={{ color: 'var(--color-base-content)', opacity: 0.35, background: 'var(--color-base-200)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const bg = i % 2 === 0 ? 'var(--color-base-200)' : 'var(--color-base-100)';
              return (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    background: bg,
                    borderBottom: '1px solid var(--color-base-300)',
                    cursor: onRowClick ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => {
                    if (onRowClick)
                      (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = bg;
                  }}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className="px-4 py-3"
                      style={{ color: 'var(--color-base-content)' }}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
