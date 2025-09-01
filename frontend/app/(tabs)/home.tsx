import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCompare } from '../../contexts/CompareContext';
import CollegeCard from '../../components/CollegeCard';
import FilterModal from '../../components/FilterModal';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  logo_base64?: string;
  ranking?: number;
  star_rating: number;
  annual_fees: number;
  courses_offered: string[];
  university_type: string;
  placement_percentage: number;
  average_package: number;
  highest_package: number;
  hostel_facilities: boolean;
  wifi: boolean;
  sports_facilities: boolean;
  library_facilities: boolean;
  canteen: boolean;
  medical_facilities: boolean;
  established_year: number;
  total_students: number;
  description: string;
}

interface CollegeSearchResponse {
  colleges: College[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface Filters {
  minFees?: number;
  maxFees?: number;
  city?: string;
  state?: string;
  minRating?: number;
  maxRating?: number;
  universityType?: string;
  courses?: string[];
  rankingFrom?: number;
  rankingTo?: number;
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [popularSearches] = useState([
    'IIT', 'NIT', 'IIIT', 'Engineering', 'Medical', 'MBA', 'Delhi', 'Mumbai', 'Bangalore'
  ]);

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const router = useRouter();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Initialize dummy data first
      await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/init-data`, {
        method: 'POST',
      });
      
      await searchColleges(true);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchColleges = async (reset = false) => {
    if (reset) {
      setPage(1);
      setHasMore(true);
    }
    
    setSearchLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (searchQuery.trim()) {
        queryParams.append('q', searchQuery.trim());
      }
      
      // Apply filters
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.minFees) queryParams.append('min_fees', filters.minFees.toString());
      if (filters.maxFees) queryParams.append('max_fees', filters.maxFees.toString());
      if (filters.minRating) queryParams.append('min_rating', filters.minRating.toString());
      if (filters.maxRating) queryParams.append('max_rating', filters.maxRating.toString());
      if (filters.universityType) queryParams.append('university_type', filters.universityType);
      if (filters.rankingFrom) queryParams.append('ranking_from', filters.rankingFrom.toString());
      if (filters.rankingTo) queryParams.append('ranking_to', filters.rankingTo.toString());
      if (filters.courses?.length) queryParams.append('courses', filters.courses.join(','));

      queryParams.append('page', (reset ? 1 : page).toString());
      queryParams.append('limit', '10');

      const response = await fetch(
        `${EXPO_PUBLIC_BACKEND_URL}/api/colleges/search?${queryParams.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch colleges');
      }
      
      const data: CollegeSearchResponse = await response.json();
      
      if (reset) {
        setColleges(data.colleges);
      } else {
        setColleges(prev => [...prev, ...data.colleges]);
      }
      
      setHasMore(data.page < data.total_pages);
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error searching colleges:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await searchColleges(true);
    setRefreshing(false);
  }, [searchQuery, filters]);

  const loadMore = () => {
    if (!searchLoading && hasMore) {
      searchColleges(false);
    }
  };

  const handleFavoriteToggle = (college: College) => {
    if (isFavorite(college.id)) {
      removeFromFavorites(college.id);
    } else {
      addToFavorites(college);
    }
  };

  const handleCompareToggle = (college: College) => {
    if (isInCompare(college.id)) {
      removeFromCompare(college.id);
    } else {
      addToCompare(college);
    }
  };

  const handleCollegePress = (college: College) => {
    router.push(`/college/${college.id}`);
  };

  const applyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setShowFilters(false);
    setTimeout(() => {
      searchColleges(true);
    }, 300);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setShowFilters(false);
    setTimeout(() => {
      searchColleges(true);
    }, 300);
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
    setTimeout(() => {
      searchColleges(true);
    }, 100);
  };

  const renderCollegeItem = ({ item }: { item: College }) => (
    <CollegeCard
      college={item}
      onPress={() => handleCollegePress(item)}
      onFavoritePress={() => handleFavoriteToggle(item)}
      onComparePress={() => handleCompareToggle(item)}
      isFavorite={isFavorite(item.id)}
      isInCompare={isInCompare(item.id)}
    />
  );

  const renderFooter = () => {
    if (!searchLoading || colleges.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2196F3" />
        <Text style={styles.footerLoaderText}>Loading more colleges...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Preparing your college search...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }] }>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your College</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons 
            name="options" 
            size={24} 
            color={Object.keys(filters).length > 0 ? "#2196F3" : "#666"} 
          />
          {Object.keys(filters).length > 0 && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search colleges, courses, cities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => searchColleges(true)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              searchColleges(true);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Popular Searches */}
      {searchQuery.length === 0 && (
        <View style={styles.popularContainer}>
          <Text style={styles.popularTitle}>Popular Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
            <View style={styles.popularTags}>
              {popularSearches.map((term, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularTag}
                  onPress={() => handlePopularSearch(term)}
                >
                  <Text style={styles.popularTagText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {colleges.length} college{colleges.length !== 1 ? 's' : ''} found
        </Text>
        {searchLoading && colleges.length === 0 && (
          <ActivityIndicator size="small" color="#2196F3" />
        )}
      </View>

      {/* College List */}
      <View style={styles.listContainer}>
        <FlashList
          data={colleges}
          renderItem={renderCollegeItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          estimatedItemSize={200}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No colleges found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search criteria or filters
              </Text>
              {Object.keys(filters).length > 0 && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={applyFilters}
        onClear={clearFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    position: 'relative',
    padding: 8,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#FF5722',
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  popularContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  popularScroll: {
    paddingBottom: 16,
  },
  popularTags: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  popularTag: {
    backgroundColor: '#f0f7ff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  popularTagText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  resultsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  footerLoader: {
    alignItems: 'center',
    padding: 16,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});