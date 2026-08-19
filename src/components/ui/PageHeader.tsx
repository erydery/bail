import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumb?: string;
}

export default function PageHeader({ title, subtitle, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        {breadcrumb && (
          <div
            className="text-xs mb-1 font-medium"
            style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
          >
            {breadcrumb}
          </div>
        )}
        <h1
          className="text-2xl font-extrabold"
          style={{ color: 'var(--color-base-content)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-base-content)', opacity: 0.55 }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
