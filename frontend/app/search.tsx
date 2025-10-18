import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import FilterModal from '../components/FilterModal';
import CollegeCard from '../components/CollegeCard';
import { supabase } from '../utils/supabase';

type College = any;

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

  const PAGE_SIZE = 10;

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
    if (loading) return;
    if (reset) { setPage(1); setHasMore(true); }
    setLoading(true);
    try {
      const p = reset ? 1 : page;
      const { data, error } = await supabase.rpc('f_search_colleges', {
        q: query.trim() || null,
        p_limit: PAGE_SIZE,
        p_offset: (p - 1) * PAGE_SIZE,
      });
      let rows: any[] = Array.isArray(data) ? data : [];
      if (error) {
        console.warn('RPC f_search_colleges failed, falling back to table query:', error?.message || error);
        // Fallback: simple search over colleges
        let qBuilder = supabase.from('colleges').select('*');
        if (query.trim()) {
          qBuilder = qBuilder.ilike('name', `%${query.trim()}%`);
        }
        const { data: fb, error: fbErr } = await qBuilder
          .order('nirf_rank', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true })
          .range((p - 1) * PAGE_SIZE, p * PAGE_SIZE - 1);
        if (fbErr) throw fbErr;
        rows = fb || [];
      }
      const mapped: College[] = rows.map((r) => ({
        id: String(r.id ?? r.slug ?? Math.random()),
        name: r.name || 'Unknown',
        city: r.city || '-',
        state: r.state || '-',
        logo_base64: undefined,
        ranking: r.nirf_rank ?? undefined,
        star_rating: Number(r.star_rating ?? 4) as number,
        annual_fees: Number(r.avg_fees ?? 0) as number,
        courses_offered: Array.isArray(r.streams) ? r.streams : [],
        university_type: r.ownership || 'Private',
        placement_percentage: Number(r.placement_percentage ?? 0) as number,
        average_package: Number(r.average_package ?? 0) as number,
        highest_package: Number(r.highest_package ?? 0) as number,
      }));
      if (reset) setColleges(uniqueById(mapped));
      else setColleges(prev => uniqueById([...prev, ...mapped]));
      setHasMore(rows.length === PAGE_SIZE);
      if (!reset) setPage(pv => pv + 1);
    } catch (err) {
      console.error('Search error detail:', err);
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

