import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H3, Body, Caption } from './Typography';
import { useRouter } from 'expo-router';
import { usePreferences } from '../contexts/PreferencesContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCompare } from '../contexts/CompareContext';
import { supabase } from '../utils/supabase';
import CompactCollegeCard from './CompactCollegeCard';

// use API.url for device-friendly base URL

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  logo_base64?: string;
  images_base64: string[];
  ranking?: number;
  star_rating: number;
  annual_fees: number;
  courses_offered: string[];
  established_year: number;
  university_type: string;
  accreditation: string[];
  campus_size: string;
  total_students: number;
  faculty_count: number;
  placement_percentage: number;
  average_package: number;
  highest_package: number;
  hostel_facilities: boolean;
  library_facilities: boolean;
  sports_facilities: boolean;
  wifi: boolean;
  canteen: boolean;
  medical_facilities: boolean;
  description: string;
  admission_process: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address: string;
  created_at: string;
  recommendation_score?: number;
  match_reasons?: string[];
}

interface RecommendationsSectionProps {
  onViewAll?: () => void;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ onViewAll }) => {
  const router = useRouter();
  const { preferences, browsingHistory, isPreferencesComplete, addToBrowsingHistory } = usePreferences();
  const isDark = false;
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [recommendations, setRecommendations] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isPreferencesComplete) {
      fetchRecommendations();
    } else {
      fetchTrendingColleges();
    }
  }, [user, preferences, isPreferencesComplete]);

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simple heuristic: for now mirror trending until personalization is implemented via RPC
      const { data, error: sbError } = await supabase
        .from('colleges')
        .select('*')
        .order('nirf_rank', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true })
        .limit(5);

      if (sbError) throw sbError;
      setRecommendations((data as any) || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations');
      // Fallback to trending colleges
      fetchTrendingColleges();
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingColleges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: sbError } = await supabase
        .from('colleges')
        .select('*')
        .order('nirf_rank', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true })
        .limit(5);

      if (sbError) throw sbError;
      setRecommendations((data as any) || []);
    } catch (error) {
      console.error('Error fetching trending colleges:', error);
      setError('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPreferences = () => {
    router.push('/preferences-setup');
  };

  const handleCollegePress = (college: College) => {
    addToBrowsingHistory({
      collegeId: college.id,
      action: 'view'
    });
    router.push(`/college/${college.id}`);
  };

  const handleFavoritePress = async (college: College) => {
    if (isFavorite(college.id)) {
      await removeFromFavorites(college.id);
    } else {
      await addToFavorites(college);
      addToBrowsingHistory({
        collegeId: college.id,
        action: 'favorite'
      });
    }
  };

  const handleComparePress = (college: College) => {
    if (isInCompare(college.id)) {
      removeFromCompare(college.id);
    } else {
      addToCompare(college);
      addToBrowsingHistory({
        collegeId: college.id,
        action: 'compare'
      });
    }
  };

  const renderRecommendationCard = (college: College) => (
    <View key={college.id} style={styles.recommendationCard}>
      <CompactCollegeCard 
        college={college} 
        onPress={() => handleCollegePress(college)}
        onFavoritePress={() => handleFavoritePress(college)}
        onComparePress={() => handleComparePress(college)}
        isFavorite={isFavorite(college.id)}
        isInCompare={isInCompare(college.id)}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bulb-outline" size={48} color="#ccc" />
      <Body style={styles.emptyStateTitle}>Get Personalized Recommendations</Body>
      <Caption style={styles.emptyStateSubtitle}>
        Set up your preferences to get AI-powered college recommendations tailored just for you
      </Caption>
      <TouchableOpacity style={styles.setupButton} onPress={handleSetupPreferences}>
        <Body style={styles.setupButtonText}>Setup Preferences</Body>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const sectionTitle = isPreferencesComplete ? 'Recommended for You' : 'Trending Colleges';
  const sectionSubtitle = isPreferencesComplete 
    ? 'Based on your preferences and browsing history'
    : 'Popular colleges among students';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <H3 style={[styles.sectionTitle, isDark && { color: '#E5E7EB' }]}>{sectionTitle}</H3>
          <Caption style={[styles.sectionSubtitle, isDark && { color: '#93A3B8' }]}>{sectionSubtitle}</Caption>
        </View>
        
        {recommendations.length > 0 && (
          <TouchableOpacity onPress={onViewAll}>
            <Body style={[styles.seeAll, isDark && { color: '#7AB8FF' }]}>See All</Body>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Caption style={[styles.loadingText, isDark && { color: '#93A3B8' }]}>Finding perfect colleges for you...</Caption>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#f44336" />
          <Caption style={[styles.errorText, isDark && { color: '#EF9A9A' }]}>{error}</Caption>
          <TouchableOpacity onPress={fetchTrendingColleges} style={styles.retryButton}>
            <Caption style={styles.retryText}>Retry</Caption>
          </TouchableOpacity>
        </View>
      ) : recommendations.length === 0 && !isPreferencesComplete ? (
        renderEmptyState()
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          {recommendations.map(renderRecommendationCard)}
        </ScrollView>
      )}

      {!isPreferencesComplete && recommendations.length > 0 && (
        <View style={styles.preferencesPrompt}>
          <View style={styles.promptContent}>
            <Ionicons name="settings-outline" size={20} color="#2196F3" />
            <Body style={[styles.promptText, isDark && { color: '#7AB8FF' }]}>
              Want better recommendations? Set up your preferences!
            </Body>
          </View>
          <TouchableOpacity onPress={handleSetupPreferences} style={styles.promptButton}>
            <Caption style={styles.promptButtonText}>Setup</Caption>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  seeAll: {
    color: '#2196F3',
    fontSize: 14,
  },
  cardsContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  recommendationCard: {
    marginBottom: 8,
  },
  matchReasonsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  matchReasonsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  matchReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  matchReasonText: {
    fontSize: 10,
    color: '#4CAF50',
    marginLeft: 4,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 8,
    color: '#f44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f44336',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  preferencesPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promptText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 8,
    flex: 1,
  },
  promptButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  promptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RecommendationsSection;
