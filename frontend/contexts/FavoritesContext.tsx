import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API } from '../utils/api';

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
      const response = await fetch(API.url(`/api/favorites/${user.id}`));
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Fallback to local storage
      try {
        const localFavorites = await AsyncStorage.getItem(`favorites_${user.id}`);
        if (localFavorites) {
          setFavorites(JSON.parse(localFavorites));
        }
      } catch (localError) {
        console.error('Error loading local favorites:', localError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (college: College) => {
    if (!user) return;

    try {
      const response = await fetch(API.url('/api/favorites'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          college_id: college.id,
        }),
      });

      if (response.ok) {
        const newFavorites = [...favorites, college];
        setFavorites(newFavorites);
        // Save to local storage as backup
        await AsyncStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      // Fallback to local storage
      const newFavorites = [...favorites, college];
      setFavorites(newFavorites);
      await AsyncStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
    }
  };

  const removeFromFavorites = async (collegeId: string) => {
    if (!user) return;

    try {
      const response = await fetch(API.url(`/api/favorites/${user.id}/${collegeId}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        const newFavorites = favorites.filter(fav => fav.id !== collegeId);
        setFavorites(newFavorites);
        // Save to local storage as backup
        await AsyncStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      // Fallback to local storage
      const newFavorites = favorites.filter(fav => fav.id !== collegeId);
      setFavorites(newFavorites);
      await AsyncStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
    }
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