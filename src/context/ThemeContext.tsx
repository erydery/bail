import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface ThemeOption {
  id: string;
  name: string;
  /** Couleurs de prévisualisation [bg, primary, text] */
  preview: [string, string, string];
}

export const themes: ThemeOption[] = [
  { id: 'simi',        name: 'Orange (défaut)', preview: ['#222222', '#e85d04', '#e8e8e8'] },
  { id: 'simi-violet', name: 'Violet',          preview: ['#16162a', '#7c3aed', '#e2e2ff'] },
  { id: 'simi-bleu',   name: 'Bleu',            preview: ['#0e1e38', '#0ea5e9', '#cce4ff'] },
  { id: 'simi-vert',   name: 'Vert',            preview: ['#132019', '#22c55e', '#d4f5e0'] },
  { id: 'simi-clair',  name: 'Clair',           preview: ['#ffffff', '#e85d04', '#1a1a1a'] },
];

interface ThemeContextValue {
  themeId: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'simi',
  setTheme: () => {},
});

const STORAGE_KEY = 'gl-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) ?? 'simi';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setTheme: setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
