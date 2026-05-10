/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Basic User type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<User>;
  register: (firstName: string, lastName: string, email: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('genzura_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      firstName: 'James',
      lastName: 'Wilson',
      email,
      initials: 'JW',
      role: email.toLowerCase() === 'admin@genzura.law' ? 'admin' : 'user',
    };
    
    setUser(mockUser);
    localStorage.setItem('genzura_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const register = async (firstName: string, lastName: string, email: string) => {
    // Mock register delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      firstName,
      lastName,
      email,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      role: email.toLowerCase() === 'admin@genzura.law' ? 'admin' : 'user',
    };
    
    setUser(mockUser);
    localStorage.setItem('genzura_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('genzura_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    if (updates.firstName || updates.lastName) {
      updatedUser.initials = `${updatedUser.firstName[0]}${updatedUser.lastName[0]}`.toUpperCase();
    }
    setUser(updatedUser);
    localStorage.setItem('genzura_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
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
