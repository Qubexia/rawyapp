'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../lib/auth';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = () => {
      const token = getToken();
      if (token) {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse user', e);
          }
        }
      } else if (pathname !== '/login') {
         router.push('/login');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [pathname, router]);

  const login = (token: string, userData: User) => {
    setToken(token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
    router.push('/');
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem('admin_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
