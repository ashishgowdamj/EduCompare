import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, RefreshControl, TouchableOpacity, SafeAreaView, FlatList, Dimensions, Modal, TextInput, Platform, Image, Animated } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreferences } from '../../contexts/PreferencesContext';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Backend URL: use env if provided, else derive from Expo host (LAN IP) with default port 8000
const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoClient?.hostUri ?? '';
const lanHost = hostUri ? hostUri.split(':')[0] : 'localhost';
const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || `http://${lanHost}:8000`;

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
// SideDrawer removed per request

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
  const isDark = false;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { preferences } = usePreferences();

  // State for filters
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // State for search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  type SuggestionType = 'college' | 'popular' | 'recent' | 'cta' | 'header';
  type Suggestion = { label: string; city?: string; logo_base64?: string; type: SuggestionType };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'relevance'|'ranking'|'fees_low'|'fees_high'|'rating_high'>('relevance');
  const [showSortModal, setShowSortModal] = useState(false);
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
  // Drawer state removed
  const [appliedPrefSeed, setAppliedPrefSeed] = useState(false);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const shimmer = useRef(new Animated.Value(0.6)).current;

  // Start shimmer pulse for skeletons
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.6, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

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

  // Seed filters from PreferencesContext once on mount when available
  useEffect(() => {
    if (appliedPrefSeed) return;
    const hasCourse = (preferences?.preferredCourses || []).length > 0;
    const hasCity = (preferences?.preferredCities || []).length > 0;
    const hasState = (preferences?.preferredStates || []).length > 0;
    if (hasCourse || hasCity || hasState) {
      const seeded: Record<string, any> = { ...activeFilters };
      if (hasCourse) seeded.courses = preferences.preferredCourses;
      if (hasCity) seeded.city = preferences.preferredCities[0];
      if (hasState) seeded.state = preferences.preferredStates[0];
      setActiveFilters(seeded);
      setAppliedPrefSeed(true);
      setPage(1);
      searchColleges(true);
    }
  }, [preferences]);

  // Load recent searches once
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('recent_searches');
        if (stored) setRecentSearches(JSON.parse(stored));
      } catch {}
    })();
  }, []);

  // Debounced suggestions for smart search (merge local + server) with abort
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) {
        const base = recentSearches.slice(0, 6).map((s) => ({ label: s, type: 'recent' as const }));
        const grouped: Suggestion[] = base.length ? [{ label: 'Recent', type: 'header' }, ...base] : [];
        setSuggestions(grouped);
        setShowSuggestions(recentSearches.length > 0);
        return;
      }
      const startsWith = (s: string) => s.toLowerCase().startsWith(q);
      const contains = (s: string) => s.toLowerCase().includes(q);
      const rankSort = (a: string, b: string) => {
        const aw = startsWith(a) ? 0 : 1;
        const bw = startsWith(b) ? 0 : 1;
        if (aw !== bw) return aw - bw;
        return a.localeCompare(b);
      };
      const popularLocals: Suggestion[] = popularSearches
        .filter(contains)
        .sort(rankSort)
        .map((s) => ({ label: s, type: 'popular' }));
      const recentLocals: Suggestion[] = recentSearches
        .filter(contains)
        .sort(rankSort)
        .map((s) => ({ label: s, type: 'recent' }));
      const local: Suggestion[] = [];
      if (popularLocals.length) local.push({ label: 'Popular', type: 'header' }, ...popularLocals);
      if (recentLocals.length) local.push({ label: 'Recent', type: 'header' }, ...recentLocals);
      // Server suggestions
      const fetchServer = async () => {
        try {
          // Abort in-flight request
          if (suggestAbortRef.current) suggestAbortRef.current.abort();
          const controller = new AbortController();
          suggestAbortRef.current = controller;
          const url = `${EXPO_PUBLIC_BACKEND_URL}/api/colleges/search?q=${encodeURIComponent(q)}&limit=5`;
          const res = await fetch(url, { signal: controller.signal });
          if (res.ok) {
            const data: any = await res.json();
            const serverItems: Suggestion[] = (data.colleges || [])
              .map((c: any) => ({
                label: c.name,
                city: [c.city, c.state].filter(Boolean).join(', '),
                logo_base64: c.logo_base64,
                type: 'college' as const,
              }))
              .filter((s: Suggestion) => !!s.label);
            const grouped: Suggestion[] = serverItems.length ? [{ label: 'Colleges', type: 'header' }, ...serverItems] : [];
            // Add local groups beneath server results
            const cta: Suggestion = { label: `Search for “${searchQuery.trim()}”`, type: 'cta' };
            const finalList = [...grouped, ...local].slice(0, 12);
            setSuggestions(finalList.concat(cta));
            setShowSuggestions(finalList.length > 0);
          } else {
            const cta: Suggestion = { label: `Search for “${searchQuery.trim()}”`, type: 'cta' };
            const fallback = local.slice(0, 10);
            setSuggestions(fallback.concat(cta));
            setShowSuggestions(fallback.length > 0);
          }
        } catch (e: any) {
          if (e?.name === 'AbortError') return; // ignore aborted
          const cta: Suggestion = { label: `Search for “${searchQuery.trim()}”`, type: 'cta' };
          const fallback = local.slice(0, 10);
          setSuggestions(fallback.concat(cta));
          setShowSuggestions(fallback.length > 0);
        }
      };
      if (q.length >= 2) fetchServer(); else {
        const cta: Suggestion = { label: `Search for “${searchQuery.trim()}”`, type: 'cta' };
        const fallback = local.slice(0, 10);
        setSuggestions(fallback.concat(cta));
        setShowSuggestions(fallback.length > 0);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, recentSearches]);

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

    const receivedSub = Notifications.addNotificationReceivedListener(async (notif) => {
      setUnreadCount((c) => c + 1);
      try {
        const item = {
          id: String(Date.now()),
          title: notif.request.content.title || 'Notification',
          body: notif.request.content.body || '',
          data: notif.request.content.data || {},
          date: Date.now(),
          read: false,
        };
        const stored = await AsyncStorage.getItem('notifications');
        const arr = stored ? JSON.parse(stored) : [];
        const next = [item, ...arr].slice(0, 100);
        await AsyncStorage.setItem('notifications', JSON.stringify(next));
      } catch (e) {
        console.log('store notification error', e);
      }
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

      // Sorting
      if (sortBy && sortBy !== 'relevance') queryParams.append('sort', sortBy);

      const url = `${EXPO_PUBLIC_BACKEND_URL}/api/colleges/search?${queryParams.toString()}`;
      console.log('Fetching from URL:', url);

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
    // persist recent searches
    const term = searchQuery.trim();
    if (term.length > 0) {
      const next = [term, ...recentSearches.filter(t => t.toLowerCase() !== term.toLowerCase())].slice(0, 8);
      setRecentSearches(next);
      AsyncStorage.setItem('recent_searches', JSON.stringify(next)).catch(() => {});
    }
    setShowSuggestions(false);
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

  // Active filter chips helpers
  const removeFilter = (key: string, value?: any) => {
    const next = { ...activeFilters } as any;
    if (key === 'courses' && Array.isArray(next.courses)) {
      next.courses = next.courses.filter((c: string) => c !== value);
      if (next.courses.length === 0) delete next.courses;
    } else {
      delete next[key];
    }
    setActiveFilters(next);
    setPage(1);
    searchColleges(true);
  };

  const renderActiveFilterChips = () => {
    const chips: { key: string; label: string; value?: any }[] = [];
    if (activeFilters.city) chips.push({ key: 'city', label: `City: ${activeFilters.city}` });
    if (activeFilters.state) chips.push({ key: 'state', label: `State: ${activeFilters.state}` });
    if (activeFilters.universityType) chips.push({ key: 'universityType', label: `Type: ${activeFilters.universityType}` });
    if (activeFilters.minFees || activeFilters.maxFees) {
      const min = activeFilters.minFees ? Math.round(activeFilters.minFees/100000*10)/10 : null;
      const max = activeFilters.maxFees ? Math.round(activeFilters.maxFees/100000*10)/10 : null;
      const range = `${min !== null ? `${min}L` : ''}${min!==null||max!==null ? '–' : ''}${max !== null ? `${max}L` : ''}`;
      chips.push({ key: 'fees', label: `Fees: ${range}` });
    }
    if (activeFilters.minRating || activeFilters.maxRating) {
      const parts = [] as string[];
      if (activeFilters.minRating) parts.push(`≥ ${Number(activeFilters.minRating).toFixed(1)}★`);
      if (activeFilters.maxRating) parts.push(`≤ ${Number(activeFilters.maxRating).toFixed(1)}★`);
      chips.push({ key: 'rating', label: `Rating: ${parts.join(' ')}` });
    }
    if (activeFilters.rankingFrom || activeFilters.rankingTo) {
      const from = activeFilters.rankingFrom ?? '';
      const to = activeFilters.rankingTo ?? '';
      chips.push({ key: 'ranking', label: `Rank: ${from}–${to}` });
    }
    if (Array.isArray(activeFilters.courses) && activeFilters.courses.length) {
      activeFilters.courses.forEach((course: string) => chips.push({ key: 'courses', label: course, value: course }));
    }

    if (chips.length === 0) return null;

    return (
      <View style={styles.activeChipsRow}>
        {chips.map((chip, idx) => (
          <View key={`${chip.key}-${chip.label}-${idx}`} style={[styles.filterChip, isDark && { backgroundColor: 'rgba(37,99,235,0.15)', borderColor: 'rgba(37,99,235,0.35)' }]}>
            <Text style={styles.filterChipText}>{chip.label}</Text>
            <TouchableOpacity onPress={() => {
              if (chip.key === 'fees') {
                removeFilter('minFees'); removeFilter('maxFees');
              } else if (chip.key === 'rating') {
                removeFilter('minRating'); removeFilter('maxRating');
              } else if (chip.key === 'ranking') {
                removeFilter('rankingFrom'); removeFilter('rankingTo');
              } else if (chip.key === 'courses') {
                removeFilter('courses', chip.value);
              } else {
                removeFilter(chip.key);
              }
            }} style={styles.filterChipClose}>
              <Ionicons name="close" size={14} color="#1976D2" />
            </TouchableOpacity>
          </View>
        ))}
        {chips.length > 1 && (
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: '#E8F0FE', borderColor: '#C5D6FD' }]} onPress={clearFilters}>
            <Ionicons name="close-circle" size={14} color="#1976D2" />
            <Text style={[styles.filterChipText, { color: '#1976D2', marginLeft: 4 }]}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
      <View style={[styles.container, isDark && { backgroundColor: '#0B1320' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
        {/* Skeleton sticky header */}
        <LinearGradient
          colors={["#2196F3", "#1976D2", "#1565C0"]}
          style={[styles.stickyHeader, { paddingTop: insets.top + 10 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonSubtitle} />
              </View>

          {/* Active filter chips */}
          {renderActiveFilterChips()}
              <View style={styles.skeletonBell} />
            </View>
            <View style={styles.searchContainer}>
              <View style={{ width: 18, height: 18, backgroundColor: '#EAECEE', borderRadius: 9, marginRight: 12 }} />
              <View style={{ flex: 1, height: 36, backgroundColor: '#EAECEE', borderRadius: 8 }} />
              <View style={{ width: 28, height: 28, backgroundColor: '#EAECEE', borderRadius: 6, marginLeft: 8 }} />
            </View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Skeleton cards */}
          {[...Array(5)].map((_, idx) => (
            <Animated.View key={idx} style={[styles.skeletonCard, { opacity: shimmer }]}>
              <View style={styles.skeletonLogo} />
              <View style={{ flex: 1 }}>
                <View style={styles.skeletonLineWide} />
                <View style={styles.skeletonLine} />
                <View style={styles.skeletonLine} />
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    );
  }

  const renderListHeader = () => (
    <View>
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

        {searchLoading ? (
          <Animated.View style={[styles.sectionCard, { opacity: shimmer }]}>
            <View style={styles.skeletonLineWide} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
          </Animated.View>
        ) : (
          <RecommendationsSection
            onViewAll={() => setSelectedCategory('All')}
          />
        )}
        <View style={styles.sectionDivider} />

        {searchLoading ? (
          <Animated.View style={[styles.sectionCard, { opacity: shimmer }]}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[...Array(3)].map((_, idx) => (
                <View key={idx} style={{ width: 120 }}>
                  <View style={{ width: '100%', height: 70, backgroundColor: '#EAECEE', borderRadius: 10, marginBottom: 8 }} />
                  <View style={styles.skeletonLine} />
                </View>
              ))}
            </View>
          </Animated.View>
        ) : null}
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
    <View style={[styles.container, isDark && { backgroundColor: '#0B1320' }]}>
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
              returnKeyType="search"
              blurOnSubmit
              onFocus={() => setShowSuggestions(true)}
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
            <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
              <Ionicons name="swap-vertical" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>

          {showSuggestions && (
            <View style={[styles.suggestionsContainer, isDark && { backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.08)' }]}>
              {suggestions.length === 0 ? (
                <View style={styles.suggestionItem}>
                  <Text style={styles.suggestionTextMuted}>Start typing to search...</Text>
                </View>
              ) : (
                suggestions.map((s, i) => {
                  if (s.type === 'header') {
                    return (
                      <View key={`hdr-${s.label}-${i}`} style={styles.suggestionHeader}>
                        <Text style={styles.suggestionHeaderText}>{s.label}</Text>
                      </View>
                    );
                  }
                  if (s.type === 'cta') {
                    return (
                      <TouchableOpacity key={`cta-${i}`} style={[styles.suggestionItem, styles.suggestionCta]}
                        onPress={() => { setShowSuggestions(false); setTimeout(() => handleSearch(), 10); }}>
                        <Ionicons name="return-down-forward" size={16} color="#1976D2" />
                        <Text style={[styles.suggestionText, { color: '#1976D2', fontWeight: '700' }]}>{s.label}</Text>
                      </TouchableOpacity>
                    );
                  }
                  const leftIcon = s.type === 'popular' ? 'flame-outline' : s.type === 'recent' ? 'time-outline' : 'search';
                  return (
                    <TouchableOpacity key={`${s.label}-${i}`} style={styles.suggestionItem}
                      onPress={() => { setSearchQuery(s.label); setShowSuggestions(false); setTimeout(() => handleSearch(), 50); }}>
                      {s.logo_base64 && s.type === 'college' ? (
                        <View style={styles.suggestionLogoWrapper}>
                          <Image
                            source={{ uri: `data:image/png;base64,${s.logo_base64}` }}
                            style={styles.suggestionLogoImage}
                            resizeMode="cover"
                          />
                        </View>
                      ) : (
                        <Ionicons name={leftIcon as any} size={16} color={isDark ? '#AEB6C2' : '#666'} />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.suggestionText, isDark && { color: '#E5E7EB' }]}>{s.label}</Text>
                        {!!s.city && <Text style={[styles.suggestionSubtext, isDark && { color: '#93A3B8' }]}>{s.city}</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
              {recentSearches.length > 0 && (
                <TouchableOpacity style={[styles.suggestionItem, { justifyContent: 'center' }]} onPress={() => { setRecentSearches([]); AsyncStorage.removeItem('recent_searches').catch(()=>{}); }}>
                  <Text style={[styles.suggestionTextMuted, { fontWeight: '700' }, isDark && { color: '#93A3B8' }]}>Clear recent</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {showSuggestions && (
            <TouchableOpacity activeOpacity={1} onPress={() => setShowSuggestions(false)} style={styles.suggestionsOverlay} />
          )}

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
        onScrollBeginDrag={() => setShowSuggestions(false)}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: insets.bottom + 90 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
          />
        }
        contentContainerStyle={[styles.flatListContent, { paddingBottom: insets.bottom + 140 }]}
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

      {renderFilterModal()}

      {/* Sort modal */}
      <Modal visible={showSortModal} transparent animationType="fade" onRequestClose={() => setShowSortModal(false)}>
        <View style={styles.sortOverlay}>
          <View style={[styles.sortSheet, isDark && { backgroundColor: '#0F172A' }]}>
            <Text style={[styles.sortTitle, isDark && { color: '#E5E7EB' }]}>Sort by</Text>
            {([
              { key: 'relevance', label: 'Relevance' },
              { key: 'ranking', label: 'Ranking (best first)' },
              { key: 'fees_low', label: 'Fees (low to high)' },
              { key: 'fees_high', label: 'Fees (high to low)' },
              { key: 'rating_high', label: 'Rating (high to low)' },
            ] as const).map(opt => (
              <TouchableOpacity key={opt.key} style={styles.sortItem} onPress={() => { setSortBy(opt.key); setShowSortModal(false); setPage(1); searchColleges(true); }}>
                <Ionicons name={sortBy === opt.key ? 'radio-button-on' : 'radio-button-off'} size={18} color="#1976D2" />
                <Text style={[styles.sortItemText, isDark && { color: '#E5E7EB' }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sortCancel} onPress={() => setShowSortModal(false)}>
              <Text style={styles.sortCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sortButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginLeft: 8,
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
  // hamburgerButton removed
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
  // Sort modal
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sortTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  sortItemText: {
    color: '#111827',
    fontSize: 14,
  },
  sortCancel: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sortCancelText: {
    color: '#1976D2',
    fontWeight: '700',
  },
  // Smart search suggestions
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECEE',
    marginTop: -8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F3F5',
    gap: 8,
  },
  suggestionText: {
    color: '#111827',
    fontSize: 14,
  },
  suggestionTextMuted: {
    color: '#6B7280',
    fontSize: 13,
  },
  suggestionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
  },
  suggestionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionCta: {
    backgroundColor: '#F0F7FF',
  },
  suggestionSubtext: {
    color: '#8A8F98',
    fontSize: 12,
  },
  suggestionLogoWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAECEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CFD4DA',
  },
  suggestionsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  activeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  filterChipText: {
    color: '#1976D2',
    fontWeight: '700',
    fontSize: 12,
  },
  filterChipClose: {
    marginLeft: 6,
    padding: 2,
  },
  clearFiltersChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    gap: 6,
  },
  clearFiltersText: {
    color: '#1976D2',
    fontWeight: '700',
    fontSize: 12,
  },
  suggestionLogoImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  // Skeleton styles
  skeletonTitle: {
    width: 180,
    height: 20,
    backgroundColor: '#EAECEE',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: 220,
    height: 12,
    backgroundColor: '#EAECEE',
    borderRadius: 6,
  },
  skeletonBell: {
    width: 28,
    height: 28,
    backgroundColor: '#EAECEE',
    borderRadius: 6,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAECEE',
    gap: 12,
  },
  skeletonLogo: {
    width: 60,
    height: 60,
    backgroundColor: '#EAECEE',
    borderRadius: 12,
  },
  skeletonLineWide: {
    width: '70%',
    height: 14,
    backgroundColor: '#EAECEE',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonLine: {
    width: '50%',
    height: 12,
    backgroundColor: '#EAECEE',
    borderRadius: 6,
    marginBottom: 8,
  },
});

export default HomeScreen;
