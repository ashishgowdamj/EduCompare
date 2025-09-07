import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Basic content map for scholarship categories
const SCHOLARSHIP_CONTENT: Record<string, {
  title: string;
  subtitle?: string;
  overview: string;
  eligibility: string[];
  resources: { label: string; url?: string }[];
}> = {
  merit: {
    title: 'Merit-based Scholarships',
    subtitle: 'For outstanding academic performance',
    overview:
      'Merit-based scholarships reward students for excellent academic performance and achievements. They may be offered by governments, universities, and private foundations.',
    eligibility: [
      'High academic scores in qualifying examinations',
      'Consistent performance across subjects',
      'May include interviews or written tests for final selection',
    ],
    resources: [
      { label: 'National Scholarship Portal (NSP)', url: 'https://scholarships.gov.in' },
      { label: 'AICTE Scholarships', url: 'https://www.aicte-india.org/schemes/students-development-schemes' },
      { label: 'UGC Scholarships', url: 'https://www.ugc.gov.in/page/scholarships-and-fellowships.aspx' },
    ],
  },
  need: {
    title: 'Need-based Scholarships',
    subtitle: 'Financial assistance based on need',
    overview:
      'Need-based scholarships support students from economically weaker backgrounds to pursue higher education by covering tuition fees and related expenses.',
    eligibility: [
      'Annual family income within specified limits',
      'Valid income certificate and relevant documents',
      'Admission to a recognized institution',
    ],
    resources: [
      { label: 'National Scholarship Portal (NSP)', url: 'https://scholarships.gov.in' },
      { label: 'State Scholarship Portals', url: 'https://scholarships.gov.in/stateSchemes' },
      { label: 'PMSSS (J&K and Ladakh)', url: 'https://www.aicte-india.org/bureaus/jk' },
    ],
  },
  sports: {
    title: 'Sports Scholarships',
    subtitle: 'For exceptional athletes',
    overview:
      'Sports scholarships encourage talented athletes to continue their education while training and competing at high levels. Offered by universities, federations, and ministries.',
    eligibility: [
      'Participation at district/state/national level',
      'Certificates from recognized sports authorities',
      'Trials or performance assessments where applicable',
    ],
    resources: [
      { label: 'Sports Authority of India (SAI)', url: 'https://sportsauthorityofindia.nic.in' },
      { label: 'Khelo India', url: 'https://kheloindia.gov.in' },
      { label: 'Indian Olympic Association', url: 'https://olympic.ind.in' },
    ],
  },
  women: {
    title: 'Women in STEM Scholarships',
    subtitle: 'Encouraging diversity in technology and sciences',
    overview:
      'Women in STEM scholarships support female students pursuing degrees in science, technology, engineering, and mathematics, aiming to reduce the gender gap.',
    eligibility: [
      'Female candidates enrolled in STEM programs',
      'Minimum academic performance criteria',
      'Institution or scheme-specific conditions',
    ],
    resources: [
      { label: 'WISE (DST) Initiatives', url: 'https://www.dst.gov.in/women-scientists-programs' },
      { label: 'AICTE Pragati Scheme', url: 'https://www.aicte-pragati-saksham-gov.in' },
      { label: 'UGC Schemes for Women', url: 'https://www.ugc.gov.in/page/schemes-for-women.aspx' },
    ],
  },
};

const ScholarshipDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const data = id ? SCHOLARSHIP_CONTENT[id.toLowerCase()] : undefined;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }] }>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.icon.default} />
        </TouchableOpacity>
        <Text style={styles.title}>{data?.title || 'Scholarship'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!!data?.subtitle && <Text style={styles.subtitle}>{data.subtitle}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.paragraph}>{data?.overview || 'Details will be available soon.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility</Text>
          {data?.eligibility?.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          {data?.resources?.map((r, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.resourceRow}
              activeOpacity={r.url ? 0.7 : 1}
              onPress={r.url ? () => Linking.openURL(r.url!).catch(() => {}) : undefined}
            >
              <Ionicons name={r.url ? 'link' : 'document-text'} size={16} color={r.url ? theme.colors.icon.accent : theme.colors.icon.default} />
              <Text style={[styles.resourceText, r.url && styles.resourceLink]}>
                {r.label}
              </Text>
              {r.url && (
                <Ionicons name="open-outline" size={16} color={theme.colors.icon.accent} style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          ))}
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

export default ScholarshipDetailScreen;
