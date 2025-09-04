import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCompare } from '../../contexts/CompareContext';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const COLUMN_WIDTH = 180;

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  type CompareCollege = (typeof compareList)[number] & {
    highest_package?: number;
    established_year?: number;
    total_students?: number;
    hostel_facilities?: boolean;
    wifi?: boolean;
    sports_facilities?: boolean;
    library_facilities?: boolean;
  };
  const list = compareList as CompareCollege[];

  const formatFees = (fees: number) => {
    if (fees >= 100000) {
      return `₹${(fees / 100000).toFixed(1)}L`;
    }
    return `₹${(fees / 1000).toFixed(0)}K`;
  };

  const formatPackage = (packageAmount: number) => {
    if (packageAmount >= 100000) {
      return `₹${(packageAmount / 100000).toFixed(1)}L`;
    }
    return `₹${(packageAmount / 1000).toFixed(0)}K`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#FFD700" />);
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const ComparisonRow = ({ label, values, isHighlight = false, renderValue }: {
    label: string;
    values: (string | number)[];
    isHighlight?: boolean;
    renderValue?: (value: string | number, index: number) => React.ReactNode;
  }) => (
    <View style={[styles.comparisonRow, isHighlight && styles.highlightRow]}>
      <View style={styles.labelColumn}>
        <Text style={[styles.comparisonLabel, isHighlight && styles.highlightText]}>
          {label}
        </Text>
      </View>
      {values.map((value, index) => (
        <View key={index} style={styles.valueColumn}>
          {renderValue
            ? renderValue(value, index)
            : (
              <Text style={[styles.comparisonValue, isHighlight && styles.highlightText]}>
                {value}
              </Text>
            )}
        </View>
      ))}
    </View>
  );

  const BoolChip = ({ value }: { value: boolean }) => (
    <View style={[styles.boolChip, value ? styles.yesChip : styles.noChip]}>
      <Ionicons
        name={value ? 'checkmark-circle' : 'close-circle'}
        size={14}
        color={value ? '#0f5132' : '#842029'}
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.boolChipText, value ? styles.yesText : styles.noText]}>
        {value ? 'Yes' : 'No'}
      </Text>
    </View>
  );

  if (list.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Compare Colleges</Text>
            <Text style={styles.headerSubtitle}>Add colleges to compare side by side</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Colleges to Compare</Text>
          <Text style={styles.emptyText}>
            Browse colleges and tap the "Compare" button to add them here. You can compare up to 3 colleges at once.
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.browseButtonText}>Browse Colleges</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Compare Colleges</Text>
          <Text style={styles.headerSubtitle}>
            {list.length} college{list.length !== 1 ? 's' : ''} selected
          </Text>
        </View>
        <TouchableOpacity onPress={clearCompare} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.hScrollContent}
        >
          {/* College Headers */}
          <View style={styles.collegeHeaders}>
            <View style={styles.labelColumn} />
            {list.map((college) => (
              <View key={college.id} style={styles.collegeHeader}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCompare(college.id)}
                >
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
                
                <View style={styles.collegeHeaderContent}>
                  {college.logo_base64 ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${college.logo_base64}` }}
                      style={styles.collegeLogo}
                    />
                  ) : (
                    <View style={[styles.collegeLogo, styles.placeholderLogo]}>
                      <Ionicons name="school" size={20} color="#2196F3" />
                    </View>
                  )}
                  
                  <Text style={styles.collegeName} numberOfLines={3}>
                    {college.name}
                  </Text>
                  
                  <Text style={styles.collegeLocation}>
                    {college.city}, {college.state}
                  </Text>
                  
                  {renderStars(college.star_rating)}
                </View>
              </View>
            ))}
          </View>

          {/* Comparison Table */}
          <View style={styles.comparisonTable}>
            <ComparisonRow
              label="Ranking"
              values={list.map(c => c.ranking ? `#${c.ranking}` : 'N/A')}
              isHighlight
            />
            
            <ComparisonRow
              label="Annual Fees"
              values={list.map(c => formatFees(c.annual_fees))}
              isHighlight
            />
            
            <ComparisonRow
              label="Average Package"
              values={list.map(c => formatPackage(c.average_package))}
              isHighlight
            />
            
            <ComparisonRow
              label="Highest Package"
              values={list.map(c => formatPackage(c.highest_package || 0))}
            />
            
            <ComparisonRow
              label="Placement %"
              values={list.map(c => `${c.placement_percentage}%`)}
              isHighlight
            />
            
            <ComparisonRow
              label="University Type"
              values={list.map(c => c.university_type)}
            />
            
            <ComparisonRow
              label="Established"
              values={list.map(c => c.established_year?.toString() || 'N/A')}
            />
            
            <ComparisonRow
              label="Total Students"
              values={list.map(c => c.total_students?.toLocaleString() || 'N/A')}
            />
            
            <ComparisonRow
              label="Hostel"
              values={list.map(c => (c.hostel_facilities ? 'Yes' : 'No'))}
              renderValue={(val) => <BoolChip value={val === 'Yes'} />}
            />
            
            <ComparisonRow
              label="WiFi"
              values={list.map(c => (c.wifi ? 'Yes' : 'No'))}
              renderValue={(val) => <BoolChip value={val === 'Yes'} />}
            />
            
            <ComparisonRow
              label="Sports"
              values={list.map(c => (c.sports_facilities ? 'Yes' : 'No'))}
              renderValue={(val) => <BoolChip value={val === 'Yes'} />}
            />
            
            <ComparisonRow
              label="Library"
              values={list.map(c => (c.library_facilities ? 'Yes' : 'No'))}
              renderValue={(val) => <BoolChip value={val === 'Yes'} />}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <View style={styles.labelColumn} />
            {list.map((college) => (
              <TouchableOpacity
                key={college.id}
                style={styles.viewDetailsButton}
                onPress={() => router.push(`/college/${college.id}`)}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 0,
  },
  hScrollContent: {
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FF5722',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  collegeHeaders: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  labelColumn: {
    width: 120,
  },
  collegeHeader: {
    width: COLUMN_WIDTH,
    paddingHorizontal: 8,
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 4,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  collegeHeaderContent: {
    alignItems: 'center',
  },
  collegeLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderLogo: {
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collegeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 36,
  },
  collegeLocation: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  comparisonTable: {
    backgroundColor: '#fff',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  highlightRow: {
    backgroundColor: '#f8f9fa',
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 12,
  },
  highlightText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  valueColumn: {
    width: COLUMN_WIDTH,
    paddingHorizontal: 8,
  },
  comparisonValue: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  boolChip: {
    flexDirection: 'row',
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  yesChip: {
    backgroundColor: '#d1e7dd',
  },
  noChip: {
    backgroundColor: '#f8d7da',
  },
  boolChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  yesText: { color: '#0f5132' },
  noText: { color: '#842029' },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetailsButton: {
    width: COLUMN_WIDTH,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});