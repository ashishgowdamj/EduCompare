import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import FilterModal from '../components/FilterModal';
import CollegeCard from '../components/CollegeCard';
import { API } from '../utils/api';

type College = {
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
  highest_package: number;
};

type CollegeSearchResponse = {
  colleges: College[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export default function SearchScreen() {
  const { q = '' } = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();

  const [query, setQuery] = useState(String(q || ''));
  const [colleges, setColleges] = useState<College[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const EXPO_PUBLIC_BACKEND_URL = API.baseUrl;

  const uniqueById = (arr: College[]) => {
    const seen = new Set<string>();
    const out: College[] = [];
    for (const c of arr) {
      if (!c?.id) continue;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
    return out;
  };

  const fetchPage = async (reset = false) => {
    if (reset) { setPage(1); setHasMore(true); }
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (query.trim()) qp.append('q', query.trim());
      // map filters
      if (filters.city) qp.append('city', filters.city);
      if (filters.state) qp.append('state', filters.state);
      if (filters.minFees) qp.append('min_fees', String(filters.minFees));
      if (filters.maxFees) qp.append('max_fees', String(filters.maxFees));
      if (filters.minRating) qp.append('min_rating', String(filters.minRating));
      if (filters.maxRating) qp.append('max_rating', String(filters.maxRating));
      if (filters.universityType) qp.append('university_type', filters.universityType);
      if (filters.courses?.length) qp.append('courses', filters.courses.join(','));
      if (filters.rankingFrom) qp.append('ranking_from', String(filters.rankingFrom));
      if (filters.rankingTo) qp.append('ranking_to', String(filters.rankingTo));
      (['hostel','wifi','library','sports','canteen','medical'] as const).forEach(k => {
        if ((filters as any)[k]) qp.append(k, 'true');
      });
      qp.append('page', String(reset ? 1 : page));
      qp.append('limit', '10');

      const url = `${EXPO_PUBLIC_BACKEND_URL}/api/colleges/search?${qp.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('search failed');
      const data: CollegeSearchResponse = await res.json();
      if (reset) setColleges(uniqueById(data.colleges));
      else setColleges(prev => uniqueById([...prev, ...data.colleges]));
      setHasMore(data.page < data.total_pages);
      if (!reset) setPage(p => p + 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(true); }, [q]);

  const onSubmit = () => fetchPage(true);
  const loadMore = () => { if (!loading && hasMore) fetchPage(false); };

  const renderItem = ({ item }: { item: College }) => (
    <CollegeCard
      college={item}
      onPress={() => router.push(`/college/${item.id}` as any)}
      onFavoritePress={() => {}}
      onComparePress={() => {}}
      isFavorite={false}
      isInCompare={false}
      compact
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search colleges, courses, locations"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={onSubmit}
          />
          <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.iconBtn}>
            <Ionicons name="options-outline" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <FlashList
        data={colleges}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={180}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loading ? <ActivityIndicator style={{ padding: 16 }} color="#2196F3" /> : null}
        contentContainerStyle={{ padding: 16 }}
      />

      <FilterModal
        visible={showFilter}
        filters={filters as any}
        onClose={() => setShowFilter(false)}
        onApply={(f) => { setFilters(f as any); setShowFilter(false); fetchPage(true); }}
        onClear={() => { setFilters({}); setShowFilter(false); fetchPage(true); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: { padding: 6 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
});

