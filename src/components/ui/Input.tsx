import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-base-content)', opacity: 0.55 }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-base-content)', opacity: 0.4 }}
          >
            {icon}
          </span>
        )}
        <input
          className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${icon ? 'pl-10' : ''} ${className}`}
          style={{
            background: 'var(--color-base-100)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-base-300)'}`,
            color: 'var(--color-base-content)',
          }}
          onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.target as HTMLElement).style.outline = 'none'; }}
          onBlur={e => { (e.target as HTMLElement).style.borderColor = error ? 'var(--color-error)' : 'var(--color-base-300)'; }}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>
      )}
    </div>
  );
}
