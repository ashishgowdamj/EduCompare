import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferences } from '../contexts/PreferencesContext';

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preferences, updatePreferences } = usePreferences();

  const toggleRealName = (value: boolean) => {
    updatePreferences({ showRealName: value });
  };

  const setTheme = (mode: 'system' | 'light' | 'dark') => {
    updatePreferences({ themeMode: mode });
  };

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
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Personalize your experience</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/notifications' as any)}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={18} color={theme.colors.icon.accent} />
              <Text style={styles.rowText}>Notification preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="person-circle-outline" size={18} color={theme.colors.icon.accent} />
              <View>
                <Text style={styles.rowText}>Show real name</Text>
                <Text style={styles.rowSub}>Used in future community/leaderboards</Text>
              </View>
            </View>
            <Switch value={preferences.showRealName ?? true} onValueChange={toggleRealName} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.themeRow}>
            {(['system','light','dark'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.themeChip, preferences.themeMode === mode && styles.themeChipActive]}
                onPress={() => setTheme(mode)}
              >
                <Text style={[styles.themeChipText, preferences.themeMode === mode && styles.themeChipTextActive]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 14, marginBottom: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { color: '#111827', fontSize: 14, fontWeight: '600' },
  rowSub: { color: '#6B7280', fontSize: 12 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeChip: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 8 },
  themeChipActive: { backgroundColor: theme.colors.icon.accent + '10', borderColor: theme.colors.icon.accent },
  themeChipText: { color: '#111827', fontWeight: '600' },
  themeChipTextActive: { color: theme.colors.icon.accent },
});

export default SettingsScreen;
