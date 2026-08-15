import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, themes } from '../../context/ThemeContext';

export default function ThemePicker() {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = themes.find(t => t.id === themeId) ?? themes[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-ghost btn-sm gap-2"
        title="Changer de thème"
      >
        <Palette size={16} />
        <span className="hidden sm:inline text-xs">{current.name}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'var(--color-base-200)', border: '1px solid var(--color-base-300)' }}
        >
          <div
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
            style={{
              color: 'var(--color-base-content)',
              opacity: 0.5,
              borderBottom: '1px solid var(--color-base-300)',
            }}
          >
            Apparence
          </div>

          <div className="p-1.5">
            {themes.map(th => (
              <button
                key={th.id}
                onClick={() => { setTheme(th.id); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all"
                style={{
                  background: themeId === th.id ? 'var(--color-primary)' : 'transparent',
                  color: themeId === th.id ? 'var(--color-primary-content)' : 'var(--color-base-content)',
                }}
                onMouseEnter={e => {
                  if (themeId !== th.id)
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-base-300)';
                }}
                onMouseLeave={e => {
                  if (themeId !== th.id)
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* Swatches couleurs réelles du thème */}
                <span className="flex gap-0.5 shrink-0">
                  {th.preview.map((color, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ background: color }}
                    />
                  ))}
                </span>

                <span className="flex-1">{th.name}</span>

                {themeId === th.id && <Check size={13} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
