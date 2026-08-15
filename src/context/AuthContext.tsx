import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, token, type AuthUser } from '../lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login:  (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, loading: true,
  login: async () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaure la session depuis le token stocké
  useEffect(() => {
    const t = token.get();
    if (!t) { setLoading(false); return; }
    authApi.me()
      .then(setUser)
      .catch(() => token.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    token.set(res.token);
    setUser(res.user);
  };

  const logout = () => {
    token.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
