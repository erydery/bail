import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children?: ReactNode;
}

const sizeClass: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary', size = 'md', icon, children, className = '', style: extStyle, ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: 'var(--color-primary)', color: 'var(--color-primary-content)', border: 'none' }
      : variant === 'secondary'
      ? { background: 'var(--color-base-200)', color: 'var(--color-base-content)', border: '1px solid var(--color-base-300)' }
      : variant === 'danger'
      ? { background: 'var(--color-error)', color: 'var(--color-error-content)', border: 'none', opacity: 0.9 }
      : { background: 'transparent', color: 'var(--color-base-content)', border: 'none', opacity: 0.6 };

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-150 cursor-pointer
                  hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                  ${sizeClass[size]} ${className}`}
      style={{ ...baseStyle, ...extStyle }}
      onMouseEnter={e => {
        if (variant === 'ghost')
          (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)';
      }}
      onMouseLeave={e => {
        if (variant === 'ghost')
          (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
