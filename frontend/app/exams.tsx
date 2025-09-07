import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const ExamsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const items = [
    { id: 'jee', title: 'JEE Main', subtitle: 'Engineering Entrance' },
    { id: 'neet', title: 'NEET', subtitle: 'Medical Entrance' },
    { id: 'cat', title: 'CAT', subtitle: 'MBA Entrance' },
    { id: 'gate', title: 'GATE', subtitle: 'Postgraduate Engineering' },
    { id: 'kcet', title: 'KCET', subtitle: 'Karnataka Common Entrance Test' },
    { id: 'mht-cet', title: 'MHT-CET', subtitle: 'Maharashtra CET for Engineering/Pharmacy' },
    { id: 'wbjee', title: 'WBJEE', subtitle: 'West Bengal Joint Entrance Examination' },
    { id: 'comedk', title: 'COMEDK UGET', subtitle: 'Consortium of Medical, Engineering & Dental Colleges of Karnataka' },
    { id: 'bitsat', title: 'BITSAT', subtitle: 'Birla Institute Admission Test' },
    { id: 'viteee', title: 'VITEEE', subtitle: 'VIT Engineering Entrance Exam' },
    { id: 'srmjeee', title: 'SRMJEEE', subtitle: 'SRM Joint Engineering Entrance Exam' },
    { id: 'amueee', title: 'AMUEEE', subtitle: 'AMU Engineering Entrance Exam' },
    { id: 'kiitee', title: 'KIITEE', subtitle: 'KIIT Entrance Examination' },
    { id: 'ipu-cet', title: 'IPU-CET', subtitle: 'GGSIPU Common Entrance Test' },
    { id: 'ap-eamcet', title: 'AP EAMCET', subtitle: 'Andhra Pradesh EAPCET' },
    { id: 'ts-eamcet', title: 'TS EAMCET', subtitle: 'Telangana EAMCET' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.icon.accent, '#1976D2']}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Exam Preparation</Text>
            <Text style={styles.subtitle}>Browse popular entrance exams</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

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
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 10 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  content: { padding: 16 },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    borderRadius: 14, 
    backgroundColor: '#fff', 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(33,150,243,0.12)', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});

export default ExamsScreen;
