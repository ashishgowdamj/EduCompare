import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCompare } from '../../contexts/CompareContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHero from '../../components/HomeHero';
import CategoriesSection from '../../components/CategoriesSection';
import FeaturedColleges from '../../components/FeaturedColleges';
import QuickActions from '../../components/QuickActions';
import FilterModal from '../../components/FilterModal';

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
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
      await searchColleges(true);
    } catch (error) {
      console.error('Error fetching colleges:', error);
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

      const url = `${EXPO_PUBLIC_BACKEND_URL}/api/colleges/search?${queryParams.toString()}`;
      console.log('Fetching from URL:', url);
      
      // Test the URL first
      try {
        const testResponse = await fetch('http://localhost:8000/api/colleges/search?page=1');
        console.log('Test response status:', testResponse.status);
        const testData = await testResponse.json();
        console.log('Test response data:', testData);
      } catch (testError) {
        console.error('Test fetch error:', testError);
      }
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch colleges:', errorText);
        throw new Error(`Failed to fetch colleges: ${response.status} ${response.statusText}`);
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
    // Navigate to college detail page
    router.push(`/college/${college.id}` as any);
  };

  const handleSearch = () => {
    // Reset to first page when searching
    setPage(1);
    searchColleges(true);
  };

  const handleQuickAction = (action: string) => {
    // Using valid routes from the app structure
    switch (action) {
      case 'compare':
        router.push('/(tabs)/compare' as any);
        break;
      case 'saved':
        // Navigate to favorites tab
        router.push('/(tabs)/favorites' as any);
        break;
      case 'exams':
        // Navigate to home with exam filter
        setSearchQuery('exams');
        handleSearch();
        break;
      case 'scholarships':
        // Navigate to home with scholarship filter
        setSearchQuery('scholarships');
        handleSearch();
        break;
      default:
        break;
    }
  };

  const handleCategorySelect = (category: string) => {
    const newSelectedCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newSelectedCategory);
    
    // Apply category filter
    const newFilters = { ...filters };
    if (newSelectedCategory && newSelectedCategory !== 'All') {
      newFilters.universityType = newSelectedCategory;
    } else {
      delete newFilters.universityType;
    }
    setFilters(newFilters);
    setPage(1);
    searchColleges(true);
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
    <TouchableOpacity 
      style={styles.collegeCard}
      onPress={() => handleCollegePress(item)}
    >
      <Text style={styles.collegeName}>{item.name}</Text>
      <Text style={styles.collegeLocation}>{item.city}, {item.state}</Text>
      <Text style={styles.collegeRating}>Rating: {item.star_rating.toFixed(1)} ★</Text>
    </TouchableOpacity>
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#2196F3" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
      >
        {/* Hero Section with Search */}
        <HomeHero 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />

        {/* Quick Actions */}
        <QuickActions onActionPress={handleQuickAction} />

        {/* Categories */}
        <CategoriesSection 
          onSelectCategory={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        {/* Featured Colleges */}
        {colleges.length > 0 && (
          <FeaturedColleges 
            colleges={colleges}
            onViewAll={() => {}}
          />
        )}

        {/* All Colleges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Colleges</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Loading colleges...</Text>
            </View>
          ) : (
            <FlashList
              data={colleges}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.collegeCard}>
                  <Text style={styles.collegeName}>{item.name}</Text>
                  <Text style={styles.collegeLocation}>{item.city}, {item.state}</Text>
                  <Text style={styles.collegeRating}>Rating: {item.star_rating.toFixed(1)} ★</Text>
                </View>
              )}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              estimatedItemSize={150}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No colleges found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Filter Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={24} color="#fff" />
          {Object.keys(filters).length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{Object.keys(filters).length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={applyFilters}
        onClear={clearFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  collegeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collegeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  collegeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  collegeRating: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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