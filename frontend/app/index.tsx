import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  logo_base64?: string;
  ranking?: number;
  star_rating: number;
  annual_fees: number;
  courses_offered: string[];
  university_type: string;
  placement_percentage: number;
  average_package: number;
  hostel_facilities: boolean;
  wifi: boolean;
  sports_facilities: boolean;
}

interface CollegeSearchResponse {
  colleges: College[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function Index() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minFees: '',
    maxFees: '',
    city: '',
    state: '',
    minRating: '',
    universityType: ''
  });

  // Initialize dummy data and fetch colleges
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // First initialize dummy data
      await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/init-data`, {
        method: 'POST',
      });
      
      // Then fetch colleges
      await searchColleges();
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchColleges = async () => {
    setSearchLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (searchQuery.trim()) {
        queryParams.append('q', searchQuery.trim());
      }
      
      if (filters.city.trim()) {
        queryParams.append('city', filters.city.trim());
      }
      
      if (filters.state.trim()) {
        queryParams.append('state', filters.state.trim());
      }
      
      if (filters.minFees.trim()) {
        queryParams.append('min_fees', filters.minFees.trim());
      }
      
      if (filters.maxFees.trim()) {
        queryParams.append('max_fees', filters.maxFees.trim());
      }
      
      if (filters.minRating.trim()) {
        queryParams.append('min_rating', filters.minRating.trim());
      }
      
      if (filters.universityType.trim()) {
        queryParams.append('university_type', filters.universityType.trim());
      }

      const response = await fetch(
        `${EXPO_PUBLIC_BACKEND_URL}/api/colleges/search?${queryParams.toString()}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch colleges');
      }
      
      const data: CollegeSearchResponse = await response.json();
      setColleges(data.colleges);
    } catch (error) {
      console.error('Error searching colleges:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      minFees: '',
      maxFees: '',
      city: '',
      state: '',
      minRating: '',
      universityType: ''
    });
    setSearchQuery('');
    searchColleges();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={14} color="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#FFD700" />);
    }

    return stars;
  };

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

  const CollegeCard = ({ college }: { college: College }) => (
    <TouchableOpacity style={styles.collegeCard} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.logoContainer}>
          {college.logo_base64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${college.logo_base64}` }}
              style={styles.collegeLogo}
            />
          ) : (
            <View style={[styles.collegeLogo, styles.placeholderLogo]}>
              <Ionicons name="school" size={24} color="#666" />
            </View>
          )}
        </View>
        
        <View style={styles.collegeInfo}>
          <Text style={styles.collegeName} numberOfLines={2}>
            {college.name}
          </Text>
          <Text style={styles.collegeLocation}>
            {college.city}, {college.state}
          </Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {renderStars(college.star_rating)}
            </View>
            <Text style={styles.ratingText}>({college.star_rating})</Text>
            {college.ranking && (
              <View style={styles.rankingBadge}>
                <Text style={styles.rankingText}>#{college.ranking}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.feesRow}>
          <View style={styles.feesContainer}>
            <Text style={styles.feesLabel}>Annual Fees</Text>
            <Text style={styles.feesAmount}>{formatFees(college.annual_fees)}</Text>
          </View>
          
          <View style={styles.packageContainer}>
            <Text style={styles.packageLabel}>Avg. Package</Text>
            <Text style={styles.packageAmount}>{formatPackage(college.average_package)}</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{college.university_type}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{college.placement_percentage}% Placed</Text>
          </View>
        </View>

        <View style={styles.facilitiesRow}>
          {college.hostel_facilities && (
            <Ionicons name="bed" size={16} color="#4CAF50" style={styles.facilityIcon} />
          )}
          {college.wifi && (
            <Ionicons name="wifi" size={16} color="#4CAF50" style={styles.facilityIcon} />
          )}
          {college.sports_facilities && (
            <Ionicons name="basketball" size={16} color="#4CAF50" style={styles.facilityIcon} />
          )}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.compareButton}>
          <Ionicons name="analytics" size={16} color="#2196F3" />
          <Text style={styles.compareButtonText}>Compare</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Setting up your college database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>College Search</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search colleges, cities, courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchColleges}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              searchColleges();
            }}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filtersRow}>
            <TextInput
              style={styles.filterInput}
              placeholder="City"
              value={filters.city}
              onChangeText={(text) => setFilters({...filters, city: text})}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="State"
              value={filters.state}
              onChangeText={(text) => setFilters({...filters, state: text})}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Min Fees"
              value={filters.minFees}
              onChangeText={(text) => setFilters({...filters, minFees: text})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Max Fees"
              value={filters.maxFees}
              onChangeText={(text) => setFilters({...filters, maxFees: text})}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.applyButton} onPress={searchColleges}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {colleges.length} college{colleges.length !== 1 ? 's' : ''} found
        </Text>
        {searchLoading && <ActivityIndicator size="small" color="#2196F3" />}
      </View>

      {/* College List */}
      <ScrollView 
        style={styles.collegesList}
        showsVerticalScrollIndicator={false}
      >
        {colleges.map((college) => (
          <CollegeCard key={college.id} college={college} />
        ))}
        
        {colleges.length === 0 && !searchLoading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No colleges found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search criteria</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 100,
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearFiltersButton: {
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  clearFiltersText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  collegesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  collegeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    marginRight: 12,
  },
  collegeLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderLogo: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collegeInfo: {
    flex: 1,
  },
  collegeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  collegeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  rankingBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  feesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feesContainer: {
    flex: 1,
  },
  feesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  feesAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  packageContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  packageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  packageAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  facilitiesRow: {
    flexDirection: 'row',
  },
  facilityIcon: {
    marginRight: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  favoriteButton: {
    padding: 8,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compareButtonText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },
  viewButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});