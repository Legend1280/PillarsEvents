import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  requestAccess: () => void;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory initialization from localStorage to persist sessions

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    const verifyExistingSession = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (!storedToken || !storedUser) {
          setInitializing(false);
          return;
        }

        // Try to fetch current user using /auth/me
        const res = await fetch('http://localhost:8000/api/auth/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const me = await res.json();
          localStorage.setItem('user', JSON.stringify(me));
          setUser(me);
          return;
        }

        if (res.status === 401) {
          // Attempt refresh if we have a refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('no refresh token');

          const refreshRes = await fetch('http://localhost:8000/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshRes.ok) throw new Error('refresh failed');

          const { token: newToken } = await refreshRes.json();
          localStorage.setItem('token', newToken);

          const retryRes = await fetch('http://localhost:8000/api/auth/me', {
            method: 'GET',
            headers: { Authorization: `Bearer ${newToken}` },
          });

          if (!retryRes.ok) throw new Error('me after refresh failed');

          const me = await retryRes.json();
          localStorage.setItem('user', JSON.stringify(me));
          setUser(me);
          return;
        }

        throw new Error('unexpected me error');
      } catch (_) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
      finally {
        setInitializing(false);
      }
    };

    verifyExistingSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch (_) {
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    } catch (_) {
      // ignore
    }
    setUser(null);
  };

  const requestAccess = () => {
    // In a real app, this would send a request to admin
    alert('Access request sent to administrator. You will be notified when approved.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, requestAccess, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

