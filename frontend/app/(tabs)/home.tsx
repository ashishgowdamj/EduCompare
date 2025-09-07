import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, RefreshControl, TouchableOpacity, SafeAreaView, FlatList, Dimensions, Modal, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Mock environment variables
const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Components
import HomeHero from '../../components/HomeHero';
import FeaturedColleges from '../../components/FeaturedColleges';
import QuickActions from '../../components/QuickActions';
import CategoriesSection from '../../components/CategoriesSection';
import FilterModal from '../../components/FilterModal';
import CollegeCard from '../../components/CollegeCard';
import RecommendationsSection from '../../components/RecommendationsSection';
import DeadlineTracker from '../../components/DeadlineTracker';
import UpdatesFeed from '../../components/UpdatesFeed';
import ApplicationProgress from '../../components/ApplicationProgress';
import SmartQuickActions from '../../components/SmartQuickActions';

// Types
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
  rankingFrom?: number;
  rankingTo?: number;
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

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State for filters
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // State for search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [colleges, setColleges] = useState<College[]>([]);
  const [popularSearches] = useState([
    'IIT', 'NIT', 'IIIT', 'Engineering', 'Medical', 'MBA', 'Delhi', 'Mumbai', 'Bangalore'
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Mock favorites and compare hooks
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<Set<string>>(new Set());

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);
  const isInCompareList = useCallback((id: string) => compareList.has(id), [compareList]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareList(prev => {
      const newCompareList = new Set(prev);
      if (newCompareList.has(id)) {
        newCompareList.delete(id);
      } else if (newCompareList.size < 3) { // Limit to 3 comparisons
        newCompareList.add(id);
      }
      return newCompareList;
    });
  }, []);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    // Configure foreground behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ 
        shouldShowAlert: true, 
        shouldPlaySound: false, 
        shouldSetBadge: false,
        // Newer SDK fields
        shouldShowBanner: true as any,
        shouldShowList: true as any,
      })
    });

    const registerAsync = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') return;

        const tokenResponse = await Notifications.getExpoPushTokenAsync();
        setExpoPushToken(tokenResponse.data);
      } catch (e) {
        console.log('Notifications permission/token error:', e);
      }
    };

    registerAsync();

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      setUnreadCount((c) => c + 1);
    });
    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      setUnreadCount(0);
      router.push('/notifications' as any);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
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
      if (activeFilters.city) queryParams.append('city', activeFilters.city);
      if (activeFilters.state) queryParams.append('state', activeFilters.state);
      if (activeFilters.minFees) queryParams.append('min_fees', activeFilters.minFees.toString());
      if (activeFilters.maxFees) queryParams.append('max_fees', activeFilters.maxFees.toString());
      if (activeFilters.minRating) queryParams.append('min_rating', activeFilters.minRating.toString());
      if (activeFilters.maxRating) queryParams.append('max_rating', activeFilters.maxRating.toString());
      if (activeFilters.universityType) queryParams.append('university_type', activeFilters.universityType);
      if (activeFilters.rankingFrom) queryParams.append('ranking_from', activeFilters.rankingFrom.toString());
      if (activeFilters.rankingTo) queryParams.append('ranking_to', activeFilters.rankingTo.toString());
      if (activeFilters.courses?.length) queryParams.append('courses', activeFilters.courses.join(','));

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
  }, [searchQuery, activeFilters]);

  const loadMore = () => {
    if (!searchLoading && hasMore) {
      searchColleges(false);
    }
  };

  const handleFavoriteToggle = (collegeId: string) => {
    toggleFavorite(collegeId);
  };

  const handleCompareToggle = (collegeId: string) => {
    toggleCompare(collegeId);
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
        // Navigate to dedicated Exams screen
        router.push('/exams' as any);
        break;
      case 'scholarships':
        // Navigate to dedicated Scholarships screen
        router.push('/scholarships' as any);
        break;
      default:
        break;
    }
  };

  const handleCategorySelect = (category: string) => {
    const newSelectedCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newSelectedCategory);

    // Apply category filter
    const newFilters = { ...activeFilters };
    if (newSelectedCategory && newSelectedCategory !== 'All') {
      newFilters.universityType = newSelectedCategory;
    } else {
      delete newFilters.universityType;
    }
    setActiveFilters(newFilters);
    setPage(1);
    searchColleges(true);
  };

  const applyFilters = (newFilters: Record<string, any>) => {
    setActiveFilters(newFilters);
    setShowFilterModal(false);
    setPage(1);
    searchColleges(true);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setShowFilterModal(false);
    setPage(1);
    searchColleges(true);
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

  // Render filter modal
  const renderFilterModal = () => (
    <FilterModal
      visible={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      onApply={(filters) => {
        setActiveFilters(filters);
        setShowFilterModal(false);
        searchColleges(true);
      }}
      onClear={() => {
        setActiveFilters({});
        setShowFilterModal(false);
        searchColleges(true);
      }}
      filters={activeFilters}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading colleges...</Text>
      </View>
    );
  }

  const renderListHeader = () => (
    <View>
      {/* Enhanced Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="school" size={24} color="#2196F3" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Colleges</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="location" size={24} color="#4CAF50" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="library" size={24} color="#FF9800" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>100+</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Personalized Dashboard Components */}
        <SmartQuickActions />
        <View style={styles.sectionDivider} />
        
        <DeadlineTracker />
        <View style={styles.sectionDivider} />
        
        <ApplicationProgress />
        <View style={styles.sectionDivider} />
        
        <UpdatesFeed />
        <View style={styles.sectionDivider} />

        <CategoriesSection
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
        <View style={styles.sectionDivider} />

        <RecommendationsSection
          onViewAll={() => setSelectedCategory('All')}
        />
        <View style={styles.sectionDivider} />

        <FeaturedColleges
          colleges={colleges.slice(0, 5)}
          onViewAll={() => setSelectedCategory('All')}
        />
        <View style={styles.sectionDivider} />

        <QuickActions
          onActionPress={handleQuickAction}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Colleges</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Ionicons name="school-outline" size={48} color="#ccc" />
      <Text style={styles.emptyStateText}>No colleges found</Text>
      <Text style={styles.emptyStateSubtext}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" translucent />
      
      {/* Enhanced Fixed Header */}
      <LinearGradient
        colors={['#2196F3', '#1976D2', '#1565C0']}
        style={[styles.stickyHeader, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.stickyHeaderTitle}>College Finder</Text>
              <Text style={styles.stickyHeaderSubtitle}>Find your perfect college match</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton} onPress={() => { setUnreadCount(0); router.push('/notifications' as any); }}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Enhanced Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search colleges, courses, or locations..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <Ionicons name="options-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>

          {/* Enhanced Popular Searches */}
          <View style={styles.popularSearchesContainer}>
            <Text style={styles.popularTitle}>Popular searches</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularTags}
              style={styles.popularScrollView}
            >
              {popularSearches.map((term, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularTag}
                  onPress={() => handlePopularSearch(term)}
                >
                  <Text style={styles.popularTagText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={colleges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CollegeCard
            college={item}
            isFavorite={isFavorite(item.id)}
            isInCompare={isInCompareList(item.id)}
            onPress={() => handleCollegePress(item)}
            onFavoritePress={() => handleFavoriteToggle(item.id)}
            onComparePress={() => handleCompareToggle(item.id)}
          />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
          />
        }
        contentContainerStyle={styles.flatListContent}
      />

      <TouchableOpacity
        style={[styles.filterFAB, Object.keys(activeFilters).length > 0 && { backgroundColor: '#FF9800' }]}
        onPress={() => setShowFilterModal(true)}
      >
        <Ionicons name="filter" size={24} color="#fff" />
        {Object.keys(activeFilters).length > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{Object.keys(activeFilters).length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAECEE',
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  filterFAB: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
    shadowRadius: 3.84,
    zIndex: 10,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
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
  collegeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  collegeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  collegeRating: {
    fontSize: 14,
    color: '#FFC107',
    marginBottom: 8,
  },
  footerLoader: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoaderText: {
    marginTop: 10,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  flatListContent: {
    paddingBottom: 100, // Space for FAB
    paddingTop: 8,
  },
  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  // Enhanced Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: '100%',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  // Enhanced Popular Searches
  popularSearchesContainer: {
    width: '100%',
  },
  popularTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontWeight: '600',
  },
  popularTags: {
    paddingRight: 20,
  },
  popularTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  popularTagText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  // Enhanced Stats Section
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 6,
    flexDirection: 'column',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  // Enhanced Sticky Header
  stickyHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'stretch',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stickyHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  stickyHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  notificationBadgeText: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    color: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 4,
    fontSize: 10,
    fontWeight: '700',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: 'transparent',
    marginVertical: 8,
  },
  popularScrollView: {
    maxHeight: 40,
  },
});

export default HomeScreen;