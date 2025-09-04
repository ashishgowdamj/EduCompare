import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface UserPreferences {
  // Academic Profile
  academicPercentage?: number;
  preferredCourses: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  
  // Location Preferences
  preferredStates: string[];
  preferredCities: string[];
  locationRadius?: number; // km from current location
  
  // College Type Preferences
  universityTypes: string[]; // Government, Private, Deemed
  
  // Other Preferences
  minRating?: number;
  placementPriority: number; // 1-5 scale
  feesPriority: number; // 1-5 scale
  rankingPriority: number; // 1-5 scale
  
  // Entrance Exams
  entranceExams: string[];
  examScores?: { [examName: string]: number };
}

export interface BrowsingHistory {
  collegeId: string;
  timestamp: number;
  action: 'view' | 'favorite' | 'compare' | 'search';
  duration?: number; // seconds spent viewing
}

interface PreferencesContextType {
  preferences: UserPreferences;
  browsingHistory: BrowsingHistory[];
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  addToBrowsingHistory: (item: Omit<BrowsingHistory, 'timestamp'>) => Promise<void>;
  clearBrowsingHistory: () => Promise<void>;
  isPreferencesComplete: boolean;
}

const defaultPreferences: UserPreferences = {
  preferredCourses: [],
  budgetRange: { min: 0, max: 1000000 },
  preferredStates: [],
  preferredCities: [],
  universityTypes: [],
  placementPriority: 3,
  feesPriority: 3,
  rankingPriority: 3,
  entranceExams: [],
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistory[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPreferences();
      loadBrowsingHistory();
    } else {
      setPreferences(defaultPreferences);
      setBrowsingHistory([]);
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const stored = await AsyncStorage.getItem(`preferences_${user.id}`);
      if (stored) {
        const parsedPreferences = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsedPreferences });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadBrowsingHistory = async () => {
    if (!user) return;
    
    try {
      const stored = await AsyncStorage.getItem(`browsing_history_${user.id}`);
      if (stored) {
        const history = JSON.parse(stored);
        // Keep only last 100 items and last 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const filteredHistory = history
          .filter((item: BrowsingHistory) => item.timestamp > thirtyDaysAgo)
          .slice(-100);
        setBrowsingHistory(filteredHistory);
      }
    } catch (error) {
      console.error('Error loading browsing history:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    
    try {
      await AsyncStorage.setItem(`preferences_${user.id}`, JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const addToBrowsingHistory = async (item: Omit<BrowsingHistory, 'timestamp'>) => {
    if (!user) return;
    
    const newItem: BrowsingHistory = {
      ...item,
      timestamp: Date.now(),
    };
    
    const updatedHistory = [...browsingHistory, newItem].slice(-100); // Keep last 100 items
    setBrowsingHistory(updatedHistory);
    
    try {
      await AsyncStorage.setItem(`browsing_history_${user.id}`, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving browsing history:', error);
    }
  };

  const clearBrowsingHistory = async () => {
    if (!user) return;
    
    setBrowsingHistory([]);
    try {
      await AsyncStorage.removeItem(`browsing_history_${user.id}`);
    } catch (error) {
      console.error('Error clearing browsing history:', error);
    }
  };

  const isPreferencesComplete = Boolean(
    preferences.preferredCourses.length > 0 &&
    preferences.budgetRange.max > 0 &&
    (preferences.preferredStates.length > 0 || preferences.preferredCities.length > 0)
  );

  return (
    <PreferencesContext.Provider value={{
      preferences,
      browsingHistory,
      updatePreferences,
      addToBrowsingHistory,
      clearBrowsingHistory,
      isPreferencesComplete,
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
