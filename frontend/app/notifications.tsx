import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  date: number; // epoch ms
  read?: boolean;
}

const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<StoredNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      let arr: StoredNotification[] = stored ? JSON.parse(stored) : [];
      if (arr.length === 0) {
        const now = Date.now();
        arr = [
          { id: String(now + 1), title: 'Application Deadline Approaching', body: 'Upload Documents is due in 2 days for IIT Bombay.', data: { type: 'deadline', route: '/(tabs)/home', params: {} }, date: now, read: false },
          { id: String(now + 2), title: 'JEE Main Admit Card Released', body: 'Download your admit card from the official portal.', data: { type: 'exam', route: '/exams', params: {} }, date: now - 60 * 60 * 1000, read: false },
          { id: String(now + 3), title: 'New Scholarship Matches Your Profile', body: 'Merit-based scholarship now open for applications.', data: { type: 'scholarship', route: '/scholarships', params: {} }, date: now - 2 * 60 * 60 * 1000, read: false },
          { id: String(now + 4), title: 'Recommended for You', body: 'Based on your preferences, check out NIT Trichy.', data: { type: 'recommendation', route: '/(tabs)/home', params: {} }, date: now - 26 * 60 * 60 * 1000, read: false },
          { id: String(now + 5), title: 'Application Submitted', body: 'Your application to IIIT Hyderabad has been submitted.', data: { type: 'application', route: '/(tabs)/home', params: {} }, date: now - 3 * 24 * 60 * 60 * 1000, read: true },
        ];
        await AsyncStorage.setItem('notifications', JSON.stringify(arr));
      }
      setItems(arr);
    } catch (e) {
      console.log('load notifications error', e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const deleteItem = async (id: string) => {
    const next = items.filter(n => n.id !== id);
    setItems(next);
    await AsyncStorage.setItem('notifications', JSON.stringify(next));
  };

  const clearAll = async () => {
    await AsyncStorage.removeItem('notifications');
    setItems([]);
  };

  const markAllRead = async () => {
    const next = items.map(n => ({ ...n, read: true }));
    await AsyncStorage.setItem('notifications', JSON.stringify(next));
    setItems(next);
  };

  const addSamples = async () => {
    const now = Date.now();
    const samples: StoredNotification[] = [
      {
        id: String(now + 1),
        title: 'Application Deadline Approaching',
        body: 'Upload Documents is due in 2 days for IIT Bombay.',
        data: { type: 'deadline', route: '/(tabs)/home', params: {} },
        date: now,
        read: false,
      },
      {
        id: String(now + 2),
        title: 'JEE Main Admit Card Released',
        body: 'Download your admit card from the official portal.',
        data: { type: 'exam', route: '/exams', params: {} },
        date: now - 60 * 60 * 1000,
        read: false,
      },
      {
        id: String(now + 3),
        title: 'New Scholarship Matches Your Profile',
        body: 'Merit-based scholarship now open for applications.',
        data: { type: 'scholarship', route: '/scholarships', params: {} },
        date: now - 2 * 60 * 60 * 1000,
        read: false,
      },
      {
        id: String(now + 4),
        title: 'Recommended for You',
        body: 'Based on your preferences, check out NIT Trichy.',
        data: { type: 'recommendation', route: '/(tabs)/home', params: {} },
        date: now - 26 * 60 * 60 * 1000,
        read: false,
      },
      {
        id: String(now + 5),
        title: 'Application Submitted',
        body: 'Your application to IIIT Hyderabad has been submitted.',
        data: { type: 'application', route: '/(tabs)/home', params: {} },
        date: now - 3 * 24 * 60 * 60 * 1000,
        read: true,
      },
    ];
    const stored = await AsyncStorage.getItem('notifications');
    const arr: StoredNotification[] = stored ? JSON.parse(stored) : [];
    const next = [...samples, ...arr].slice(0, 100);
    await AsyncStorage.setItem('notifications', JSON.stringify(next));
    setItems(next);
  };

  const onPressItem = async (n: StoredNotification) => {
    // mark as read
    const next = items.map(it => it.id === n.id ? { ...it, read: true } : it);
    setItems(next);
    await AsyncStorage.setItem('notifications', JSON.stringify(next));

    // navigate if deep-link info present
    const route = n.data?.route as string | undefined;
    const params = n.data?.params as any;
    if (route) {
      try {
        router.push({ pathname: route as any, params } as any);
      } catch (e) {
        // fallback: ignore navigation errors
      }
    }
  };

  const getIconByType = (n: StoredNotification) => {
    const type = n.data?.type as string | undefined;
    switch (type) {
      case 'deadline': return 'time';
      case 'application': return 'clipboard';
      case 'exam': return 'school';
      case 'scholarship': return 'trophy';
      case 'recommendation': return 'sparkles';
      default: return 'notifications';
    }
  };

  const groupByDay = (list: StoredNotification[]) => {
    const sections: { title: string; data: StoredNotification[] }[] = [];
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now.getTime() - 24*60*60*1000).toDateString();
    const map: Record<string, StoredNotification[]> = {};
    for (const n of list) {
      const d = new Date(n.date).toDateString();
      let key = d;
      if (d === todayStr) key = 'Today';
      else if (d === yesterday) key = 'Yesterday';
      map[key] = map[key] || [];
      map[key].push(n);
    }
    const order = ['Today','Yesterday'];
    for (const k of order) {
      if (map[k]) sections.push({ title: k, data: map[k] });
    }
    // add remaining sorted by date desc
    Object.keys(map)
      .filter(k => !order.includes(k))
      .sort((a,b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(k => sections.push({ title: k, data: map[k] }));
    return sections;
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
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>Your recent updates</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={markAllRead} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Mark all read</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addSamples} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={[styles.content, items.length === 0 && { flex: 1, justifyContent: 'center', alignItems: 'center' }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>You will see your updates here</Text>
          </View>
        ) : (
          groupByDay(items).map(section => (
            <View key={section.title}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((n) => (
                <Swipeable
                  key={n.id}
                  renderRightActions={() => (
                    <TouchableOpacity style={styles.rightAction} onPress={() => deleteItem(n.id)}>
                      <Text style={styles.rightActionText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                >
                  <TouchableOpacity style={[styles.card, n.read && { opacity: 0.7 }]} onPress={() => onPressItem(n)}>
                    <View style={styles.cardHeader}>
                      <Ionicons name={getIconByType(n) as any} size={18} color={theme.colors.icon.accent} />
                      {!n.read && <View style={styles.unreadDot} />}
                      <Text style={styles.cardTitle} numberOfLines={1}>{n.title}</Text>
                      <Text style={styles.cardTime}>{new Date(n.date).toLocaleString()}</Text>
                    </View>
                    {!!n.body && <Text style={styles.cardBody}>{n.body}</Text>}
                  </TouchableOpacity>
                </Swipeable>
              ))}
            </View>
          ))
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
  clearBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  clearBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EAECEE', padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardTitle: { marginLeft: 8, color: '#111827', fontSize: 14, fontWeight: '700', flex: 1 },
  cardTime: { color: '#6B7280', fontSize: 11 },
  cardBody: { color: '#374151', fontSize: 13, lineHeight: 18 },
  emptyState: { alignItems: 'center' },
  emptyText: { marginTop: 10, color: '#666', fontSize: 16, fontWeight: '600' },
  emptySubtext: { marginTop: 4, color: '#999', fontSize: 12 },
  sectionTitle: { fontSize: 12, color: '#6B7280', marginTop: 12, marginBottom: 6, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', marginLeft: 8, marginRight: 4 },
  rightAction: { backgroundColor: '#F44336', justifyContent: 'center', alignItems: 'center', width: 80, marginBottom: 12, borderRadius: 12 },
  rightActionText: { color: '#fff', fontWeight: '700' },
});

export default NotificationsScreen;
