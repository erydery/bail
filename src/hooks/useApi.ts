import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook générique pour appeler une fonction API et gérer l'état loading/data/error.
 *
 * @param fn           La fonction async à appeler
 * @param initialValue Valeur initiale (avant la première réponse). Passer [] pour les listes.
 * @param deps         Dépendances pour le re-fetch (optionnel)
 */
export function useApi<T>(
  fn: () => Promise<T>,
  initialValue: T,
  deps: unknown[] = [],
): UseApiState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fn()
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message ?? 'Erreur'); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { data, loading, error, refetch };
}
