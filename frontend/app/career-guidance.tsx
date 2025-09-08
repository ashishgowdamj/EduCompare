import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { id: 'eng', title: 'Engineering', icon: 'construct', color: '#1976D2' },
  { id: 'med', title: 'Medical', icon: 'medkit', color: '#E53935' },
  { id: 'mgmt', title: 'Management', icon: 'briefcase', color: '#6A1B9A' },
  { id: 'arts', title: 'Arts & Humanities', icon: 'color-palette', color: '#00897B' },
  { id: 'science', title: 'Science', icon: 'planet', color: '#5D4037' },
  { id: 'law', title: 'Law', icon: 'scale', color: '#F57C00' },
];

const tips = [
  'Match your strengths to fields (analytical, creative, people-oriented).',
  'Check eligibility: subjects, entrance tests, cut-offs.',
  'Compare outcomes: placements, average packages, roles.',
  'Look at curriculum and specialization options.',
  'Consider total cost of education and scholarships.',
];

const CareerGuidanceScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderedTips = useMemo(() => tips.map((t, i) => (
    <View key={i} style={styles.tipItem}>
      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
      <Text style={styles.tipText}>{t}</Text>
    </View>
  )), []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#2196F3", "#1976D2"]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Career Guidance</Text>
            <Text style={styles.subtitle}>Explore fields, roles, and preparation</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Popular Fields</Text>
        <View style={styles.grid}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.card} activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/exams', params: { category: cat.id } } as any)}>
              <View style={[styles.cardIcon, { backgroundColor: cat.color + '20' }] }>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <Text style={styles.cardTitle}>{cat.title}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>Explore</Text>
                <Ionicons name="arrow-forward" size={14} color="#2196F3" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.sectionTitle}>How to choose</Text>
          {renderedTips}
        </View>

        <Text style={styles.sectionTitle}>Resources</Text>
        <View style={styles.resources}>
          <TouchableOpacity style={styles.resourceItem} onPress={() => router.push('/exams' as any)}>
            <Ionicons name="school" size={18} color="#2196F3" />
            <Text style={styles.resourceText}>Entrance Exams & Syllabus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceItem} onPress={() => router.push('/scholarships' as any)}>
            <Ionicons name="trophy" size={18} color="#FF8F00" />
            <Text style={styles.resourceText}>Scholarships & Aid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceItem} onPress={() => router.push('/(tabs)/home' as any)}>
            <Ionicons name="business" size={18} color="#43A047" />
            <Text style={styles.resourceText}>Top Colleges</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  header: { paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 10 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EAECEE', padding: 12, width: '48%' },
  cardIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#111827', fontWeight: '700', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardFooterText: { color: '#2196F3', fontWeight: '600', fontSize: 12 },
  tipBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EAECEE', padding: 12, marginTop: 16 },
  tipItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  tipText: { marginLeft: 8, color: '#374151', fontSize: 13 },
  resources: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EAECEE', padding: 8, marginTop: 8 },
  resourceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8 },
  resourceText: { marginLeft: 8, color: '#111827' },
});

export default CareerGuidanceScreen;
