import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  requestAccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@pillars.care': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@pillars.care',
      name: 'Admin User',
      hasPostingAccess: true,
    },
  },
  'user@pillars.care': {
    password: 'user123',
    user: {
      id: '2',
      email: 'user@pillars.care',
      name: 'Regular User',
      hasPostingAccess: false,
    },
  },
  'doctor@pillars.care': {
    password: 'doctor123',
    user: {
      id: '3',
      email: 'doctor@pillars.care',
      name: 'Dr. Smith',
      hasPostingAccess: true,
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const requestAccess = () => {
    // In a real app, this would send a request to admin
    alert('Access request sent to administrator. You will be notified when approved.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, requestAccess }}>
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

