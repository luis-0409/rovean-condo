'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('rovean_user');
    const token = localStorage.getItem('rovean_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const res = await api.post('/auth/login', { email, senha });
    const { token, user } = res.data.data;
    localStorage.setItem('rovean_token', token);
    localStorage.setItem('rovean_user', JSON.stringify(user));
    document.cookie = `rovean_token=${token}; path=/; max-age=${7 * 24 * 3600}`;
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('rovean_token');
    localStorage.removeItem('rovean_user');
    document.cookie = 'rovean_token=; path=/; max-age=0';
    setUser(null);
    window.location.href = '/login';
  };

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
