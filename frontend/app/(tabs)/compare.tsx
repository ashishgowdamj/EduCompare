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

const COLUMN_WIDTH = 200;

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
        {/* College Cards Section */}
        <View style={styles.collegeCardsSection}>
          <Text style={styles.sectionTitle}>Colleges Being Compared</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collegeCardsContainer}>
            {list.map((college) => (
              <View key={college.id} style={styles.collegeCard}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCompare(college.id)}
                >
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
                
                <View style={styles.collegeCardContent}>
                  {college.logo_base64 ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${college.logo_base64}` }}
                      style={styles.collegeLogo}
                    />
                  ) : (
                    <View style={[styles.collegeLogo, styles.placeholderLogo]}>
                      <Ionicons name="school" size={24} color="#2196F3" />
                    </View>
                  )}
                  
                  <Text style={styles.collegeName} numberOfLines={2}>
                    {college.name}
                  </Text>
                  
                  <Text style={styles.collegeLocation}>
                    {college.city}, {college.state}
                  </Text>
                  
                  {renderStars(college.star_rating)}
                  
                  <TouchableOpacity
                    style={styles.viewDetailsButtonSmall}
                    onPress={() => router.push(`/college/${college.id}`)}
                  >
                    <Text style={styles.viewDetailsTextSmall}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Comparison Details Section */}
        <View style={styles.comparisonContainer}>
          {/* Key Metrics Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.sectionContent}>
              {list.map((college, index) => (
                <View key={college.id} style={styles.detailRow}>
                  <Text style={styles.collegeNameInDetail}>{college.name}</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Ranking</Text>
                      <Text style={styles.detailValue}>{college.ranking ? `#${college.ranking}` : 'N/A'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Annual Fees</Text>
                      <Text style={styles.detailValue}>{formatFees(college.annual_fees)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Avg Package</Text>
                      <Text style={styles.detailValue}>{formatPackage(college.average_package)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Placement %</Text>
                      <Text style={styles.detailValue}>{college.placement_percentage}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* College Info Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>College Information</Text>
            <View style={styles.sectionContent}>
              {list.map((college) => (
                <View key={college.id} style={styles.detailRow}>
                  <Text style={styles.collegeNameInDetail}>{college.name}</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>University Type</Text>
                      <Text style={styles.detailValue}>{college.university_type}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Established</Text>
                      <Text style={styles.detailValue}>{college.established_year?.toString() || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Total Students</Text>
                      <Text style={styles.detailValue}>{college.total_students?.toLocaleString() || 'N/A'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Facilities Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.sectionContent}>
              {list.map((college) => (
                <View key={college.id} style={styles.detailRow}>
                  <Text style={styles.collegeNameInDetail}>{college.name}</Text>
                  <View style={styles.facilitiesGrid}>
                    <View style={styles.facilityItem}>
                      <Text style={styles.facilityLabel}>Hostel</Text>
                      <BoolChip value={college.hostel_facilities || false} />
                    </View>
                    <View style={styles.facilityItem}>
                      <Text style={styles.facilityLabel}>WiFi</Text>
                      <BoolChip value={college.wifi || false} />
                    </View>
                    <View style={styles.facilityItem}>
                      <Text style={styles.facilityLabel}>Sports</Text>
                      <BoolChip value={college.sports_facilities || false} />
                    </View>
                    <View style={styles.facilityItem}>
                      <Text style={styles.facilityLabel}>Library</Text>
                      <BoolChip value={college.library_facilities || false} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
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
  collegeCardsSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  collegeCardsContainer: {
    paddingHorizontal: 16,
  },
  collegeCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    padding: 12,
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  collegeCardContent: {
    alignItems: 'center',
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
  detailRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  collegeNameInDetail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  facilityItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingRight: 8,
  },
  facilityLabel: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  collegeLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderLogo: {
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collegeName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 32,
    lineHeight: 16,
  },
  collegeLocation: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  comparisonContainer: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 16,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionContent: {
    backgroundColor: '#fff',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  highlightRow: {
    backgroundColor: '#f0f7ff',
  },
  comparisonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    flex: 1,
  },
  highlightText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  valueColumn: {
    width: COLUMN_WIDTH,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  comparisonValue: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
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
  viewDetailsButtonSmall: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  viewDetailsTextSmall: {
    color: '#fff',
    fontSize: 11,
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