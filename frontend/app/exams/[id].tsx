import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EXAM_CONTENT: Record<string, { title: string; subtitle: string; overview: string; syllabus: string[]; resources: { label: string; url?: string }[] }> = {
  jee: {
    title: 'JEE Main',
    subtitle: 'Engineering Entrance',
    overview:
      'JEE Main is a national-level engineering entrance examination for admission to undergraduate programs in NITs, IIITs and other centrally funded technical institutions.',
    syllabus: [
      'Physics: Kinematics, Laws of Motion, Work, Energy & Power',
      'Chemistry: Physical, Organic and Inorganic basics',
      'Mathematics: Algebra, Calculus, Coordinate Geometry',
    ],
    resources: [
      { label: 'Official Website', url: 'https://jeemain.nta.ac.in' },
      { label: 'Sample Papers', url: 'https://nta.ac.in/Quiz' },
      { label: 'Preparation Tips', url: 'https://jeemain.nta.ac.in/information-bulletin/' },
    ],
  },
  neet: {
    title: 'NEET',
    subtitle: 'Medical Entrance',
    overview:
      'NEET is the national-level medical entrance exam for admission to MBBS, BDS and other undergraduate medical programs in India.',
    syllabus: [
      'Physics: Mechanics, Electrodynamics, Optics',
      'Chemistry: Physical, Organic and Inorganic chemistry',
      'Biology: Diversity in Living World, Genetics, Ecology',
    ],
    resources: [
      { label: 'Official Website', url: 'https://neet.nta.nic.in' },
      { label: 'Sample Papers', url: 'https://nta.ac.in/Quiz' },
      { label: 'Preparation Tips', url: 'https://neet.nta.nic.in/information-bulletin/' },
    ],
  },
  cat: {
    title: 'CAT',
    subtitle: 'MBA Entrance',
    overview:
      'CAT is a national-level management aptitude test for admission to MBA/PGDM programs at IIMs and other top B-schools.',
    syllabus: [
      'VARC: Reading Comprehension & Verbal Ability',
      'DILR: Data Interpretation & Logical Reasoning',
      'QA: Arithmetic, Algebra, Geometry',
    ],
    resources: [
      { label: 'Official Website', url: 'https://iimcat.ac.in' },
      { label: 'Sample Papers', url: 'https://iimcat.ac.in' },
      { label: 'Preparation Tips', url: 'https://iimcat.ac.in' },
    ],
  },
  gate: {
    title: 'GATE',
    subtitle: 'Postgraduate Engineering',
    overview:
      'GATE is a national-level exam for admission to postgraduate engineering programs and PSU recruitments across India.',
    syllabus: [
      'Engineering Mathematics',
      'Core Subject Topics (branch-specific)',
      'General Aptitude',
    ],
    resources: [
      { label: 'Official Website', url: 'https://gate.iitk.ac.in' },
      { label: 'Sample Papers', url: 'https://gate.iitk.ac.in' },
      { label: 'Preparation Tips', url: 'https://gate.iitk.ac.in' },
    ],
  },
};

const ExamDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const data = id ? EXAM_CONTENT[id.toLowerCase()] : undefined;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.icon.default} />
        </TouchableOpacity>
        <Text style={styles.title}>{data?.title || 'Exam'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!!data?.subtitle && (
          <Text style={styles.subtitle}>{data.subtitle}</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.paragraph}>{data?.overview || 'Details will be available soon.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Syllabus</Text>
          {data?.syllabus?.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          {data?.resources?.map((r, idx) => {
            const hasUrl = !!r.url;
            const onPress = () => {
              if (r.url) {
                Linking.openURL(r.url).catch(() => {});
              }
            };
            return (
              <TouchableOpacity 
                key={idx}
                style={[styles.resourceRow, !hasUrl && { opacity: 0.6 }]}
                activeOpacity={hasUrl ? 0.7 : 1}
                onPress={hasUrl ? onPress : undefined}
              >
                <Ionicons name={hasUrl ? 'link' : 'document-text'} size={16} color={hasUrl ? theme.colors.icon.accent : theme.colors.icon.default} />
                <Text style={[styles.resourceText, hasUrl && styles.resourceLink]}>{r.label}</Text>
                {hasUrl && <Ionicons name="open-outline" size={16} color={theme.colors.icon.accent} style={{ marginLeft: 6 }} />}
              </TouchableOpacity>
            );
          })}
        </View>
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
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  section: { marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#374151', lineHeight: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.icon.accent, marginTop: 7, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  resourceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  resourceText: { marginLeft: 8, fontSize: 14, color: theme.colors.icon.accent, fontWeight: '600' },
  resourceLink: { textDecorationLine: 'underline' },
});

export default ExamDetailScreen;
