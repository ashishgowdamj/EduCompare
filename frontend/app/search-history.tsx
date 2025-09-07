import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const SearchHistoryScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const history = [
    'IIT Delhi',
    'MBA in Bangalore',
    'Engineering colleges Kolkata',
    'NEET cutoffs 2024',
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.icon.accent, '#1976D2']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Search History</Text>
            <Text style={styles.subtitle}>Your recent searches</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {history.map((q, idx) => (
          <View key={idx} style={styles.item}>
            <Ionicons name="time" size={16} color={theme.colors.icon.default} />
            <Text style={styles.itemText}>{q}</Text>
          </View>
        ))}
        {history.length === 0 && (
          <Text style={styles.empty}>No recent searches</Text>
        )}
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
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EAECEE', marginBottom: 10 },
  itemText: { marginLeft: 8, color: '#111827' },
  empty: { color: '#6B7280', textAlign: 'center', marginTop: 20 },
});

export default SearchHistoryScreen;
