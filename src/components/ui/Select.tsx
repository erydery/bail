import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, options, className = '', ...props }: SelectProps) {
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
      <select
        className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none appearance-none cursor-pointer ${className}`}
        style={{
          background: 'var(--color-base-100)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-base-300)'}`,
          color: 'var(--color-base-content)',
        }}
        onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
        onBlur={e => { (e.target as HTMLElement).style.borderColor = error ? 'var(--color-error)' : 'var(--color-base-300)'; }}
        {...props}
      >
        {options.map(o => (
          <option
            key={o.value}
            value={o.value}
            style={{ background: 'var(--color-base-200)', color: 'var(--color-base-content)' }}
          >
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</span>}
    </div>
  );
}
