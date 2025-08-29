import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface CompareContextType {
  compareList: College[];
  addToCompare: (college: College) => void;
  removeFromCompare: (collegeId: string) => void;
  isInCompare: (collegeId: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<College[]>([]);

  const addToCompare = async (college: College) => {
    if (compareList.length >= 3) {
      // Maximum 3 colleges for comparison
      return;
    }
    
    if (!compareList.some(c => c.id === college.id)) {
      const newCompareList = [...compareList, college];
      setCompareList(newCompareList);
      // Save to local storage
      try {
        await AsyncStorage.setItem('compareList', JSON.stringify(newCompareList));
      } catch (error) {
        console.error('Error saving compare list:', error);
      }
    }
  };

  const removeFromCompare = async (collegeId: string) => {
    const newCompareList = compareList.filter(c => c.id !== collegeId);
    setCompareList(newCompareList);
    // Save to local storage
    try {
      await AsyncStorage.setItem('compareList', JSON.stringify(newCompareList));
    } catch (error) {
      console.error('Error saving compare list:', error);
    }
  };

  const isInCompare = (collegeId: string): boolean => {
    return compareList.some(c => c.id === collegeId);
  };

  const clearCompare = async () => {
    setCompareList([]);
    try {
      await AsyncStorage.removeItem('compareList');
    } catch (error) {
      console.error('Error clearing compare list:', error);
    }
  };

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};