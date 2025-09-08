import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../contexts/PreferencesContext';

const FIELDS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Aerospace Engineering',
  'Electrical Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Medical',
  'Management',
  'Arts & Humanities',
  'Law',
  'Science',
];

const ChooseFieldScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preferences, updatePreferences } = usePreferences();
  const [selected, setSelected] = useState<string[]>(preferences.preferredCourses || []);

  const toggle = (field: string) => {
    setSelected(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const onApply = async () => {
    if (selected.length === 0) {
      Alert.alert('Choose your field', 'Please select at least one field to continue.');
      return;
    }
    await updatePreferences({ preferredCourses: selected });
    router.back();
  };

  const onClear = async () => {
    setSelected([]);
  };

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
            <Text style={styles.title}>Choose Your Field</Text>
            <Text style={styles.subtitle}>Pick areas you’re interested in</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Popular Fields</Text>
        <View style={styles.chips}>
          {FIELDS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, selected.includes(f) && styles.chipActive]}
              onPress={() => toggle(f)}
            >
              <Text style={[styles.chipText, selected.includes(f) && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
            <Text style={styles.applyText}>Apply</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
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
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: '#f5f5f5', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#2196F3' },
  chipText: { color: '#374151', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  footer: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
  clearBtn: { borderWidth: 1, borderColor: '#2196F3', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  clearText: { color: '#2196F3', fontWeight: '700' },
  applyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginLeft: 'auto' },
  applyText: { color: '#fff', fontWeight: '700', marginRight: 6 },
});

export default ChooseFieldScreen;
