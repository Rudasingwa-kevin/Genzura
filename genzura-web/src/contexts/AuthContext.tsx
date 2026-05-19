import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services/auth.service';

interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  initials: string;
  phone?: string;
  location?: string;
  jobTitle?: string;
  language?: string;
  subscriptionPlan?: 'Genzura' | 'Intango' | 'Inkingi';
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<User>;
  register: (data: any) => Promise<User>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processUser = (u: any): User => {
    if (!u) return u;
    const names = u.name?.split(' ') || [];
    return {
      ...u,
      firstName: u.firstName || names[0] || '',
      lastName: u.lastName || names.slice(1).join(' ') || ''
    };
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('genzura_token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(processUser(userData));
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('genzura_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password?: string }) => {
    const data = await authService.login(credentials);
    const processedUser = processUser(data.user);
    setUser(processedUser);
    return processedUser;
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    const processedUser = processUser(response.user);
    setUser(processedUser);
    return processedUser;
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await authService.updateProfile(data);
        const updated = processUser(updatedUser);
        setUser(updated);
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
