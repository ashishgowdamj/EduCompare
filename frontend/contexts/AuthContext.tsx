import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  dob?: string; // ISO date string YYYY-MM-DD
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isFirstTime: boolean;
  setFirstTimeComplete: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const firstTimeData = await AsyncStorage.getItem('isFirstTime');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      if (firstTimeData === 'false') {
        setIsFirstTime(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const authUser = data.user;
    if (!authUser) throw new Error('Login failed');
    // ensure profile row exists
    try {
      await supabase.from('profiles').upsert({ id: authUser.id, name: authUser.email?.split('@')[0] || null }).select().single();
    } catch {}
    const userData: User = { id: authUser.id, name: authUser.email?.split('@')[0] || '', email: authUser.email || '' };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const authUser = data.user;
    if (!authUser) return; // if email confirmation required
    try {
      await supabase.from('profiles').upsert({ id: authUser.id, name }).select().single();
    } catch {}
    const userData: User = { id: authUser.id, name: name || (authUser.email?.split('@')[0] || ''), email: authUser.email || '' };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await supabase.auth.signOut().catch(() => {});
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    setUser(prev => {
      const next = prev ? { ...prev, ...updates } : null;
      if (next) {
        AsyncStorage.setItem('user', JSON.stringify(next)).catch(() => {});
      }
      return next;
    });
  };

  const setFirstTimeComplete = async () => {
    await AsyncStorage.setItem('isFirstTime', 'false');
    setIsFirstTime(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isFirstTime,
      setFirstTimeComplete,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};