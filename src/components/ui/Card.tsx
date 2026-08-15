import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className = '', padding = true, style }: CardProps) {
  return (
    <div
      className={`rounded-2xl ${padding ? 'p-5' : ''} ${className}`}
      style={{
        background: 'var(--color-base-200)',
        border: '1px solid var(--color-base-300)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
