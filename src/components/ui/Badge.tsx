interface BadgeProps {
  label: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'orange';
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, { bg: string }> = {
  success: { bg: 'var(--color-success)'  },
  danger:  { bg: 'var(--color-error)'    },
  warning: { bg: 'var(--color-warning)'  },
  info:    { bg: 'var(--color-info)'     },
  orange:  { bg: 'var(--color-primary)'  },
  neutral: { bg: 'var(--color-base-300)' },
};

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg } = variantStyles[variant];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg + '33', color: bg, border: `1px solid ${bg}44` }}
    >
      {label}
    </span>
  );
}
