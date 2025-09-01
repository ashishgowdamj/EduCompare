import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCompare } from '../../contexts/CompareContext';
import * as Animatable from 'react-native-animatable';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  logo_base64?: string;
  images_base64: string[];
  ranking?: number;
  star_rating: number;
  annual_fees: number;
  courses_offered: string[];
  university_type: string;
  established_year: number;
  campus_size: string;
  total_students: number;
  faculty_count: number;
  placement_percentage: number;
  average_package: number;
  highest_package: number;
  hostel_facilities: boolean;
  library_facilities: boolean;
  sports_facilities: boolean;
  wifi: boolean;
  canteen: boolean;
  medical_facilities: boolean;
  description: string;
  admission_process: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address: string;
  accreditation: string[];
}

export default function CollegeDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  useEffect(() => {
    if (id) {
      fetchCollegeDetails();
    }
  }, [id]);

  const fetchCollegeDetails = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/colleges/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCollege(data);
      }
    } catch (error) {
      console.error('Error fetching college details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFees = (fees: number) => {
    if (fees >= 100000) {
      return `₹${(fees / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${(fees / 1000).toFixed(0)} Thousand`;
  };

  const formatPackage = (packageAmount: number) => {
    if (packageAmount >= 100000) {
      return `₹${(packageAmount / 100000).toFixed(1)} LPA`;
    }
    return `₹${(packageAmount / 1000).toFixed(0)} Thousand`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />);
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const handleFavoriteToggle = () => {
    if (!college) return;
    
    if (isFavorite(college.id)) {
      removeFromFavorites(college.id);
    } else {
      addToFavorites(college);
    }
  };

  const handleCompareToggle = () => {
    if (!college) return;
    
    if (isInCompare(college.id)) {
      removeFromCompare(college.id);
    } else {
      addToCompare(college);
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="trophy" size={24} color="#FF9800" />
          <Text style={styles.metricLabel}>Ranking</Text>
          <Text style={styles.metricValue}>
            {college?.ranking ? `#${college.ranking}` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="cash" size={24} color="#4CAF50" />
          <Text style={styles.metricLabel}>Annual Fees</Text>
          <Text style={styles.metricValue}>
            {formatFees(college?.annual_fees || 0)}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="trending-up" size={24} color="#2196F3" />
          <Text style={styles.metricLabel}>Avg Package</Text>
          <Text style={styles.metricValue}>
            {formatPackage(college?.average_package || 0)}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="people" size={24} color="#9C27B0" />
          <Text style={styles.metricLabel}>Placement</Text>
          <Text style={styles.metricValue}>
            {college?.placement_percentage}%
          </Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About College</Text>
        <Text style={styles.description}>{college?.description}</Text>
      </View>

      {/* Quick Facts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Facts</Text>
        <View style={styles.factsList}>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Established:</Text>
            <Text style={styles.factValue}>{college?.established_year}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>University Type:</Text>
            <Text style={styles.factValue}>{college?.university_type}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Campus Size:</Text>
            <Text style={styles.factValue}>{college?.campus_size}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Total Students:</Text>
            <Text style={styles.factValue}>{college?.total_students?.toLocaleString()}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Faculty:</Text>
            <Text style={styles.factValue}>{college?.faculty_count}</Text>
          </View>
        </View>
      </View>

      {/* Courses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Courses Offered</Text>
        <View style={styles.coursesGrid}>
          {college?.courses_offered.map((course, index) => (
            <View key={index} style={styles.courseChip}>
              <Text style={styles.courseText}>{course}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Quick action handlers
  const handleCall = () => {
    if (!college?.contact_phone) return;
    const telUrl = `tel:${college.contact_phone}`;
    Linking.openURL(telUrl).catch(() => {});
  };

  const handleWebsite = () => {
    if (!college?.website) return;
    let url = college.website.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => {});
  };

  const handleMap = () => {
    if (!college?.address) return;
    const query = encodeURIComponent(college.address);
    const ios = `maps://?q=${query}`;
    const android = `geo:0,0?q=${query}`;
    const web = `https://www.google.com/maps/search/?api=1&query=${query}`;
    const url = Platform.select({ ios, android, default: web }) as string;
    Linking.openURL(url).catch(() => {});
  };

  const renderFacilities = () => (
    <View style={styles.tabContent}>
      <View style={styles.facilitiesGrid}>
        <FacilityItem 
          icon="bed" 
          title="Hostel" 
          available={college?.hostel_facilities} 
        />
        <FacilityItem 
          icon="wifi" 
          title="WiFi" 
          available={college?.wifi} 
        />
        <FacilityItem 
          icon="library" 
          title="Library" 
          available={college?.library_facilities} 
        />
        <FacilityItem 
          icon="basketball" 
          title="Sports" 
          available={college?.sports_facilities} 
        />
        <FacilityItem 
          icon="restaurant" 
          title="Canteen" 
          available={college?.canteen} 
        />
        <FacilityItem 
          icon="medical" 
          title="Medical" 
          available={college?.medical_facilities} 
        />
      </View>
    </View>
  );

  const renderAdmissions = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admission Process</Text>
        <Text style={styles.description}>{college?.admission_process}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Placement Statistics</Text>
        <View style={styles.placementStats}>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Placement Rate</Text>
            <Text style={styles.placementValue}>{college?.placement_percentage}%</Text>
          </View>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Average Package</Text>
            <Text style={styles.placementValue}>{formatPackage(college?.average_package || 0)}</Text>
          </View>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Highest Package</Text>
            <Text style={styles.placementValue}>{formatPackage(college?.highest_package || 0)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accreditation</Text>
        <View style={styles.accreditationList}>
          {college?.accreditation?.map((acc, index) => (
            <View key={index} style={styles.accreditationChip}>
              <Text style={styles.accreditationText}>{acc}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderContact = () => (
    <View style={styles.tabContent}>
      <View style={styles.contactCard}>
        <Ionicons name="location" size={24} color="#2196F3" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>Address</Text>
          <Text style={styles.contactValue}>{college?.address}</Text>
        </View>
      </View>

      <View style={styles.contactCard}>
        <Ionicons name="mail" size={24} color="#4CAF50" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>{college?.contact_email}</Text>
        </View>
      </View>

      <View style={styles.contactCard}>
        <Ionicons name="call" size={24} color="#FF9800" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>Phone</Text>
          <Text style={styles.contactValue}>{college?.contact_phone}</Text>
        </View>
      </View>

      <View style={styles.contactCard}>
        <Ionicons name="globe" size={24} color="#9C27B0" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>Website</Text>
          <Text style={styles.contactValue}>{college?.website}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionBtn, !college?.contact_phone && styles.quickActionDisabled]}
          onPress={handleCall}
          disabled={!college?.contact_phone}
        >
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.quickActionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, !college?.website && styles.quickActionDisabled]}
          onPress={handleWebsite}
          disabled={!college?.website}
        >
          <Ionicons name="globe" size={18} color="#fff" />
          <Text style={styles.quickActionText}>Website</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, !college?.address && styles.quickActionDisabled]}
          onPress={handleMap}
          disabled={!college?.address}
        >
          <Ionicons name="map" size={18} color="#fff" />
          <Text style={styles.quickActionText}>Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FacilityItem = ({ icon, title, available }: { 
    icon: string; 
    title: string; 
    available?: boolean; 
  }) => (
    <View style={[styles.facilityCard, available ? styles.facilityAvailable : styles.facilityUnavailable]}>
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={available ? "#4CAF50" : "#ccc"} 
      />
      <Text style={[styles.facilityTitle, { color: available ? "#333" : "#999" }]}>
        {title}
      </Text>
      <Text style={[styles.facilityStatus, { color: available ? "#4CAF50" : "#999" }]}>
        {available ? "Available" : "Not Available"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading college details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!college) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF5722" />
          <Text style={styles.errorTitle}>College Not Found</Text>
          <Text style={styles.errorText}>
            The college you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'information-circle' },
    { id: 'facilities', title: 'Facilities', icon: 'business' },
    { id: 'admissions', title: 'Admissions', icon: 'school' },
    { id: 'contact', title: 'Contact', icon: 'call' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>College Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleFavoriteToggle} style={styles.headerButton}>
            <Ionicons 
              name={isFavorite(college.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite(college.id) ? "#FF5722" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* College Header */}
        <Animatable.View animation="fadeInUp" style={styles.collegeHeader}>
          <View style={styles.collegeHeaderContent}>
            {college.logo_base64 ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${college.logo_base64}` }}
                style={styles.collegeLogo}
              />
            ) : (
              <View style={[styles.collegeLogo, styles.placeholderLogo]}>
                <Ionicons name="school" size={32} color="#2196F3" />
              </View>
            )}
            
            <View style={styles.collegeInfo}>
              <Text style={styles.collegeName}>{college.name}</Text>
              <Text style={styles.collegeLocation}>
                📍 {college.city}, {college.state}
              </Text>
              <View style={styles.ratingRow}>
                {renderStars(college.star_rating)}
                <Text style={styles.ratingText}>({college.star_rating})</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons 
                    name={tab.icon as any} 
                    size={16} 
                    color={activeTab === tab.id ? "#2196F3" : "#666"} 
                  />
                  <Text style={[
                    styles.tabText, 
                    activeTab === tab.id && styles.activeTabText
                  ]}>
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tab Content */}
        <Animatable.View 
          key={activeTab} 
          animation="fadeInUp" 
          duration={300}
          style={styles.tabContentContainer}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'facilities' && renderFacilities()}
          {activeTab === 'admissions' && renderAdmissions()}
          {activeTab === 'contact' && renderContact()}
        </Animatable.View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.compareButton, isInCompare(college.id) && styles.compareButtonActive]}
          onPress={handleCompareToggle}
        >
          <Ionicons 
            name="analytics" 
            size={18} 
            color={isInCompare(college.id) ? "#fff" : "#2196F3"} 
          />
          <Text style={[
            styles.compareButtonText, 
            isInCompare(college.id) && styles.compareButtonTextActive
          ]}>
            {isInCompare(college.id) ? 'Added to Compare' : 'Add to Compare'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  collegeHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  collegeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collegeLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  placeholderLogo: {
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collegeInfo: {
    flex: 1,
  },
  collegeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
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
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  tabNavigation: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 16,
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  factsList: {
    marginTop: 8,
  },
  factItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  factLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  factValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  courseChip: {
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  courseText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 16,
    borderWidth: 1,
  },
  facilityAvailable: {
    borderColor: '#4CAF50',
  },
  facilityUnavailable: {
    borderColor: '#E0E0E0',
  },
  facilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  facilityStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  placementStats: {
    marginTop: 8,
  },
  placementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  placementLabel: {
    fontSize: 14,
    color: '#666',
  },
  placementValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  accreditationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accreditationChip: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  accreditationText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  compareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  compareButtonActive: {
    backgroundColor: '#2196F3',
  },
  compareButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 6,
  },
  compareButtonTextActive: {
    color: '#fff',
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 6,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  quickActionDisabled: {
    backgroundColor: '#B0BEC5',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});