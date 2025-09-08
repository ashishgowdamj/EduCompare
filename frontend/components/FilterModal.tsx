import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

const { width, height } = Dimensions.get('window');

interface Filters {
  minFees?: number;
  maxFees?: number;
  city?: string;
  state?: string;
  minRating?: number;
  maxRating?: number;
  universityType?: string;
  courses?: string[];
  rankingFrom?: number;
  rankingTo?: number;
  accreditation?: string[];
  hostel?: boolean;
  wifi?: boolean;
  library?: boolean;
  sports?: boolean;
  canteen?: boolean;
  medical?: boolean;
  minPlacement?: number;
  minAvgPackage?: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClear: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onClear,
}) => {
  const [localFilters, setLocalFilters] = useState<Filters>({});
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedAccreditations, setSelectedAccreditations] = useState<string[]>([]);
  const isDark = false;

  const panelBg = isDark ? '#0F172A' : '#fff';
  const textPrimary = isDark ? '#E5E7EB' : '#333';
  const textSecondary = isDark ? '#AEB6C2' : '#666';
  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E0E0E0';
  const divider = isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0';
  const chipBg = isDark ? 'rgba(148,163,184,0.15)' : '#f5f5f5';
  const chipActiveBg = '#2196F3';

  const universityTypes = ['Government', 'Private', 'Deemed'];
  const popularCourses = [
    'Computer Science', 'Information Technology', 'Mechanical Engineering',
    'Electronics', 'Civil Engineering', 'Chemical Engineering',
    'Biotechnology', 'Aerospace Engineering', 'Electrical Engineering',
    'Data Science', 'Artificial Intelligence'
  ];
  
  const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune',
    'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'
  ];
  
  const popularStates = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana',
    'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan', 'Haryana'
  ];
  const commonAccreditations = ['NAAC A++', 'NAAC A+', 'NAAC A', 'NBA', 'AICTE'];

  useEffect(() => {
    setLocalFilters(filters);
    setSelectedCourses(filters.courses || []);
    setSelectedAccreditations(filters.accreditation || []);
  }, [filters]);

  const handleApply = () => {
    const finalFilters = { ...localFilters };
    if (selectedCourses.length > 0) {
      finalFilters.courses = selectedCourses;
    }
    if (selectedAccreditations.length > 0) {
      finalFilters.accreditation = selectedAccreditations;
    }
    onApply(finalFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    setSelectedCourses([]);
    onClear();
  };

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => 
      prev.includes(course) 
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const toggleAccreditation = (acc: string) => {
    setSelectedAccreditations(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]);
  };

  const updateFilter = (key: keyof Filters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={[styles.container, { backgroundColor: panelBg }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: divider }]}>
          <Text style={[styles.title, { color: textPrimary }]}>Filter Colleges</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Filters */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Quick Filters</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity style={[styles.chip, { backgroundColor: chipBg }]} onPress={() => updateFilter('universityType', 'Government')}>
                <Text style={[styles.chipText, { color: textSecondary }]}>Government</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, { backgroundColor: chipBg }]} onPress={() => updateFilter('universityType', 'Private')}>
                <Text style={[styles.chipText, { color: textSecondary }]}>Private</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, { backgroundColor: chipBg }]} onPress={() => { updateFilter('rankingFrom', 1); updateFilter('rankingTo', 100); }}>
                <Text style={[styles.chipText, { color: textSecondary }]}>Top 100</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, { backgroundColor: chipBg }]} onPress={() => updateFilter('maxFees', 100000)}>
                <Text style={[styles.chipText, { color: textSecondary }]}>Fees ≤ ₹1L</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, { backgroundColor: chipBg }]} onPress={() => updateFilter('city', 'Bangalore')}>
                <Text style={[styles.chipText, { color: textSecondary }]}>Bangalore</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Fees Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Annual Fees (₹)</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.rangeInput, { borderColor: border, color: textPrimary, backgroundColor: isDark ? '#111827' : '#fff' }]}
                placeholder="Min Fees"
                placeholderTextColor={textSecondary}
                value={localFilters.minFees?.toString() || ''}
                onChangeText={(text) => updateFilter('minFees', text ? parseInt(text) : undefined)}
                keyboardType="numeric"
              />
              <Text style={[styles.rangeSeparator, { color: textSecondary }]}>to</Text>
              <TextInput
                style={[styles.rangeInput, { borderColor: border, color: textPrimary, backgroundColor: isDark ? '#111827' : '#fff' }]}
                placeholder="Max Fees"
                placeholderTextColor={textSecondary}
                value={localFilters.maxFees?.toString() || ''}
                onChangeText={(text) => updateFilter('maxFees', text ? parseInt(text) : undefined)}
                keyboardType="numeric"
              />
          </View>
        </View>

        {/* Facilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.chipContainer}>
            {([
              ['hostel', 'Hostel'],
              ['wifi', 'WiFi'],
              ['library', 'Library'],
              ['sports', 'Sports'],
              ['canteen', 'Canteen'],
              ['medical', 'Medical'],
            ] as const).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.smallChip, (localFilters as any)[key] && styles.chipActive]}
                onPress={() => updateFilter(key as keyof Filters, !(localFilters as any)[key])}
              >
                <Text style={[styles.smallChipText, (localFilters as any)[key] && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accreditation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accreditation</Text>
          <View style={styles.chipContainer}>
            {commonAccreditations.map((acc) => (
              <TouchableOpacity
                key={acc}
                style={[styles.smallChip, selectedAccreditations.includes(acc) && styles.chipActive]}
                onPress={() => toggleAccreditation(acc)}
              >
                <Text style={[styles.smallChipText, selectedAccreditations.includes(acc) && styles.chipTextActive]}>
                  {acc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Minimum Outcomes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Outcomes</Text>
          <View style={styles.rangeContainer}>
            <TextInput
              style={styles.rangeInput}
              placeholder="Min Placement %"
              value={localFilters.minPlacement?.toString() || ''}
              onChangeText={(text) => updateFilter('minPlacement', text ? parseFloat(text) : undefined)}
              keyboardType="decimal-pad"
            />
            <Text style={styles.rangeSeparator}>and</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="Min Avg Package (₹)"
              value={localFilters.minAvgPackage?.toString() || ''}
              onChangeText={(text) => updateFilter('minAvgPackage', text ? parseInt(text) : undefined)}
              keyboardType="numeric"
            />
          </View>
        </View>
          {/* Rating Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Star Rating</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.rangeInput, { borderColor: border, color: textPrimary, backgroundColor: isDark ? '#111827' : '#fff' }]}
                placeholder="Min Rating"
                placeholderTextColor={textSecondary}
                value={localFilters.minRating?.toString() || ''}
                onChangeText={(text) => updateFilter('minRating', text ? parseFloat(text) : undefined)}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.rangeSeparator, { color: textSecondary }]}>to</Text>
              <TextInput
                style={[styles.rangeInput, { borderColor: border, color: textPrimary, backgroundColor: isDark ? '#111827' : '#fff' }]}
                placeholder="Max Rating"
                placeholderTextColor={textSecondary}
                value={localFilters.maxRating?.toString() || ''}
                onChangeText={(text) => updateFilter('maxRating', text ? parseFloat(text) : undefined)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Ranking Range */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>College Ranking</Text>
            <View style={styles.rangeContainer}>
              <TextInput
                style={[styles.rangeInput, { borderColor: border, color: textPrimary, backgroundColor: isDark ? '#111827' : '#fff' }]}
                placeholder="From Rank"
                placeholderTextColor={textSecondary}
                value={localFilters.rankingFrom?.toString() || ''}
                onChangeText={(text) => updateFilter('rankingFrom', text ? parseInt(text) : undefined)}
                keyboardType="numeric"
              />
              <Text style={[styles.rangeSeparator, { color: textSecondary }]}>to</Text>
              <TextInput
                style={[styles.rangeInput, { borderColor: border, color: textPrimary, backgroundColor: isDark ? '#111827' : '#fff' }]}
                placeholder="To Rank"
                placeholderTextColor={textSecondary}
                value={localFilters.rankingTo?.toString() || ''}
                onChangeText={(text) => updateFilter('rankingTo', text ? parseInt(text) : undefined)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* University Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>University Type</Text>
            <View style={styles.chipContainer}>
              {universityTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    localFilters.universityType === type && styles.chipActive
                  ]}
                  onPress={() => updateFilter('universityType', 
                    localFilters.universityType === type ? undefined : type
                  )}
                >
                  <Text style={[
                    styles.chipText,
                    localFilters.universityType === type && styles.chipTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>City</Text>
            <TextInput
              style={[styles.input, { borderColor: border, color: textPrimary, backgroundColor: isDark ? '#111827' : '#fff' }]}
              placeholder="Enter city name"
              placeholderTextColor={textSecondary}
              value={localFilters.city || ''}
              onChangeText={(text) => updateFilter('city', text || undefined)}
            />
            <View style={styles.chipContainer}>
              {popularCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.smallChip,
                    { backgroundColor: chipBg },
                    localFilters.city === city && { backgroundColor: chipActiveBg }
                  ]}
                  onPress={() => updateFilter('city', 
                    localFilters.city === city ? undefined : city
                  )}
                >
                  <Text style={[
                    styles.smallChipText,
                    { color: textSecondary },
                    localFilters.city === city && styles.chipTextActive
                  ]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>State</Text>
            <TextInput
              style={[styles.input, { borderColor: border, color: textPrimary, backgroundColor: isDark ? '#111827' : '#fff' }]}
              placeholder="Enter state name"
              placeholderTextColor={textSecondary}
              value={localFilters.state || ''}
              onChangeText={(text) => updateFilter('state', text || undefined)}
            />
            <View style={styles.chipContainer}>
              {popularStates.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.smallChip,
                    { backgroundColor: chipBg },
                    localFilters.state === state && { backgroundColor: chipActiveBg }
                  ]}
                  onPress={() => updateFilter('state', 
                    localFilters.state === state ? undefined : state
                  )}
                >
                  <Text style={[
                    styles.smallChipText,
                    { color: textSecondary },
                    localFilters.state === state && styles.chipTextActive
                  ]}>
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Courses */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }] }>
              Courses {selectedCourses.length > 0 && `(${selectedCourses.length})`}
            </Text>
            <View style={styles.chipContainer}>
              {popularCourses.map((course) => (
                <TouchableOpacity
                  key={course}
                  style={[
                    styles.smallChip,
                    { backgroundColor: chipBg },
                    selectedCourses.includes(course) && { backgroundColor: chipActiveBg }
                  ]}
                  onPress={() => toggleCourse(course)}
                >
                  <Text style={[
                    styles.smallChipText,
                    { color: textSecondary },
                    selectedCourses.includes(course) && styles.chipTextActive
                  ]}>
                    {course}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: divider }]}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
    minHeight: Math.min(560, height * 0.85),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  rangeSeparator: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  smallChip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  smallChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default FilterModal;
