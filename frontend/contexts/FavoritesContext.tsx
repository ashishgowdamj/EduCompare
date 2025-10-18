import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API } from '../utils/api';
import { supabase } from '../utils/supabase';

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  logo_base64?: string;
  ranking?: number;
  star_rating: number;
  annual_fees: number;
  courses_offered: string[];
  university_type: string;
  placement_percentage: number;
  average_package: number;
}

interface FavoritesContextType {
  favorites: College[];
  isLoading: boolean;
  addToFavorites: (college: College) => Promise<void>;
  removeFromFavorites: (collegeId: string) => Promise<void>;
  isFavorite: (collegeId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const refreshFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch favorite mappings
      const { data: favRows, error: favErr } = await supabase
        .from('favorites')
        .select('college_id')
        .eq('user_id', user.id);
      if (favErr) throw favErr;
      const ids = (favRows || []).map(r => r.college_id);
      if (ids.length === 0) {
        setFavorites([]);
        await AsyncStorage.setItem(`favorites_${user.id}`, JSON.stringify([]));
        return;
      }
      // Fetch college objects
      const { data: colleges, error: colErr } = await supabase
        .from('colleges')
        .select('*')
        .in('id', ids);
      if (colErr) throw colErr;
      setFavorites((colleges as any[]) || []);
      await AsyncStorage.setItem(`favorites_${user.id}`, JSON.stringify(colleges || []));
    } catch (e) {
      // Fallback to local cache
      try {
        const localFavorites = await AsyncStorage.getItem(`favorites_${user.id}`);
        if (localFavorites) setFavorites(JSON.parse(localFavorites));
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (college: College) => {
    if (!user) return;

    // Persist to Supabase
    try {
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, college_id: college.id });
      if (error) throw error;
    } catch {}
    const newFavorites = [...favorites, college];
    setFavorites(newFavorites);
    await AsyncStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
  };

  const removeFromFavorites = async (collegeId: string) => {
    if (!user) return;

    try {
      await supabase.from('favorites').delete().match({ user_id: user.id, college_id: collegeId });
    } catch {}
    const newFavorites = favorites.filter(fav => fav.id !== collegeId);
    setFavorites(newFavorites);
    await AsyncStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
  };

  const isFavorite = (collegeId: string): boolean => {
    return favorites.some(fav => fav.id === collegeId);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isLoading,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      refreshFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};