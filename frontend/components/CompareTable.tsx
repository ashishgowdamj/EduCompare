import React, { useMemo, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export interface CompareCollege {
  id: string;
  name: string;
  city: string;
  state: string;
  logo_base64?: string;
  ranking?: number;
  star_rating: number;
  annual_fees: number;
  average_package: number;
  placement_percentage: number;
  university_type: string;
  established_year?: number;
  total_students?: number;
  hostel_facilities?: boolean;
  wifi?: boolean;
  sports_facilities?: boolean;
  library_facilities?: boolean;
}

type Props = {
  colleges: CompareCollege[];
  onRemove?: (id: string) => void;
  onOpen?: (id: string) => void;
  compactHeader?: boolean;
  headerTitle?: string; // text in top-left label cell
};

const ROW_HEIGHT = 44;
const LABEL_COL_WIDTH = Math.min(180, Math.max(140, width * 0.38));
const VALUE_COL_WIDTH = 180;

const formatFees = (fees: number) => {
  if (!fees && fees !== 0) return '—';
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L`;
  if (fees >= 1000) return `₹${(fees / 1000).toFixed(0)}K`;
  return `₹${fees}`;
};

const formatPackage = (amt: number) => {
  if (!amt && amt !== 0) return '—';
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
  return `₹${amt}`;
};

const CompareTable: React.FC<Props> = ({ colleges, onRemove, onOpen, compactHeader = false, headerTitle = '' }) => {
  const headerRef = useRef<ScrollView>(null);
  const bodyRef = useRef<ScrollView>(null);

  const rows = useMemo(() => {
    const labels: { key: string; label: string; type?: 'section'|'row' }[] = [
      { key: 'sec_metrics', label: 'Key Metrics', type: 'section' },
      { key: 'ranking', label: 'Ranking' },
      { key: 'annual_fees', label: 'Annual Fees' },
      { key: 'average_package', label: 'Avg Package' },
      { key: 'placement_percentage', label: 'Placement %' },
      { key: 'sec_info', label: 'College Information', type: 'section' },
      { key: 'university_type', label: 'University Type' },
      { key: 'established_year', label: 'Established' },
      { key: 'total_students', label: 'Total Students' },
      { key: 'sec_facilities', label: 'Facilities', type: 'section' },
      { key: 'hostel_facilities', label: 'Hostel' },
      { key: 'wifi', label: 'WiFi' },
      { key: 'sports_facilities', label: 'Sports' },
      { key: 'library_facilities', label: 'Library' },
    ];
    return labels;
  }, []);

  const onBodyScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    headerRef.current?.scrollTo({ x, animated: false });
  };

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      {/* Sticky Header */}
      <View style={styles.headerRow}>
        <View style={[styles.labelCell, styles.headerLabelCell]}>
          {!!headerTitle && <Text style={styles.headerLabelText}>{headerTitle}</Text>}
        </View>
        <ScrollView ref={headerRef} horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
          <View style={styles.headerCols}>
            {colleges.map((c) => (
              <View key={c.id} style={[styles.headerColCell, compactHeader && { paddingVertical: 8 }]}>
                <View style={[styles.headerColTop, compactHeader && { flexDirection: 'column' }]}>
                  {!compactHeader && (
                    c.logo_base64 ? (
                      <Image source={{ uri: `data:image/jpeg;base64,${c.logo_base64}` }} style={styles.logo} />
                    ) : (
                      <View style={[styles.logo, styles.logoPlaceholder]}>
                        <Ionicons name="school" size={20} color="#2196F3" />
                      </View>
                    )
                  )}
                  <TouchableOpacity onPress={() => onOpen?.(c.id)}>
                    <Text numberOfLines={2} style={[styles.collegeName, compactHeader && { fontSize: 11 }]}>{c.name}</Text>
                  </TouchableOpacity>
                  {!compactHeader && (
                    <Text style={styles.collegeLoc}>{c.city}, {c.state}</Text>
                  )}
                </View>
                {onRemove && (
                  <TouchableOpacity onPress={() => onRemove(c.id)} style={styles.removeBtn}>
                    <Ionicons name="close" size={14} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Table Body */}
      <View style={styles.bodyRow}>
        {/* Labels column */}
        <View style={styles.labelsColumn}>
          {rows.map((r) => (
            <View
              key={r.key}
              style={[styles.labelCell, r.type === 'section' ? styles.sectionCell : styles.valueCell]}
            >
              <Text style={r.type === 'section' ? styles.sectionText : styles.labelText}>{r.label}</Text>
            </View>
          ))}
        </View>

        {/* Values columns */}
        <ScrollView
          ref={bodyRef}
          horizontal
          showsHorizontalScrollIndicator
          onScroll={onBodyScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.valueColumns}>
            {colleges.map((c) => (
              <View key={c.id} style={styles.valueColumn}>
                {rows.map((r) => {
                  if (r.type === 'section') {
                    return <View key={r.key} style={[styles.valueCell, styles.sectionCell]} />;
                  }
                  let text: string | JSX.Element = '—';
                  switch (r.key) {
                    case 'ranking':
                      text = c.ranking ? `#${c.ranking}` : 'N/A';
                      break;
                    case 'annual_fees':
                      text = formatFees(c.annual_fees);
                      break;
                    case 'average_package':
                      text = formatPackage(c.average_package);
                      break;
                    case 'placement_percentage':
                      text = `${c.placement_percentage ?? 0}%`;
                      break;
                    case 'university_type':
                      text = c.university_type || '—';
                      break;
                    case 'established_year':
                      text = c.established_year ? String(c.established_year) : 'N/A';
                      break;
                    case 'total_students':
                      text = c.total_students ? c.total_students.toLocaleString() : 'N/A';
                      break;
                    case 'hostel_facilities':
                    case 'wifi':
                    case 'sports_facilities':
                    case 'library_facilities': {
                      const v = (c as any)[r.key] as boolean | undefined;
                      text = (
                        <View style={[styles.boolChip, v ? styles.yesChip : styles.noChip]}>
                          <Ionicons
                            name={v ? 'checkmark-circle' : 'close-circle'}
                            size={14}
                            color={v ? '#0f5132' : '#842029'}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={[styles.boolChipText, v ? styles.yesText : styles.noText]}>
                            {v ? 'Yes' : 'No'}
                          </Text>
                        </View>
                      );
                      break;
                    }
                    default:
                      text = '—';
                  }
                  return (
                    <View key={r.key} style={styles.valueCell}>
                      {typeof text === 'string' ? (
                        <Text style={styles.valueText}>{text}</Text>
                      ) : text}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerLabelCell: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerLabelText: { fontSize: 12, fontWeight: '700', color: '#333' },
  labelCell: {
    width: LABEL_COL_WIDTH,
    paddingHorizontal: 12,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  headerCols: { flexDirection: 'row' },
  headerColCell: {
    width: VALUE_COL_WIDTH,
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerColTop: { alignItems: 'center' },
  logo: { width: 36, height: 36, borderRadius: 8, marginBottom: 6 },
  logoPlaceholder: { backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  collegeName: { fontSize: 12, fontWeight: '700', color: '#111827', textAlign: 'center' },
  collegeLoc: { fontSize: 11, color: '#6B7280', marginTop: 2, textAlign: 'center' },
  removeBtn: { position: 'absolute', top: 6, right: 6, padding: 6 },

  bodyRow: { flexDirection: 'row' },
  labelsColumn: { backgroundColor: '#fff' },
  sectionCell: { backgroundColor: '#f8f9fa', height: ROW_HEIGHT, justifyContent: 'center' },
  sectionText: { fontSize: 12, fontWeight: '700', color: '#333' },
  labelText: { fontSize: 12, color: '#374151', fontWeight: '600' },

  valueColumns: { flexDirection: 'row' },
  valueColumn: { width: VALUE_COL_WIDTH, backgroundColor: '#fff', borderLeftWidth: 1, borderLeftColor: '#f0f0f0' },
  valueCell: { height: ROW_HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  valueText: { fontSize: 12, color: '#333', textAlign: 'center', fontWeight: '500' },

  boolChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  yesChip: { backgroundColor: '#d1e7dd' },
  noChip: { backgroundColor: '#f8d7da' },
  boolChipText: { fontSize: 11, fontWeight: '600' },
  yesText: { color: '#0f5132' },
  noText: { color: '#842029' },
});

export default CompareTable;
