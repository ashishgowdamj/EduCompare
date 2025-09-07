import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ExamsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = [
    { id: 'jee', title: 'JEE Main', subtitle: 'Engineering Entrance' },
    { id: 'neet', title: 'NEET', subtitle: 'Medical Entrance' },
    { id: 'cat', title: 'CAT', subtitle: 'MBA Entrance' },
    { id: 'gate', title: 'GATE', subtitle: 'Postgraduate Engineering' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.icon.default} />
        </TouchableOpacity>
        <Text style={styles.title}>Exam Preparation</Text>
        {/* Right spacer to keep title centered */}
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.map(item => (
          <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.8} onPress={() => router.push(`/exams/${item.id}` as any)}>
            <View style={styles.cardIcon}>
              <Ionicons name="book" size={18} color={theme.colors.icon.accent} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.icon.default} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: { marginRight: 8 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: '#F9FAFB', marginBottom: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(33,150,243,0.12)', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});

export default ExamsScreen;
