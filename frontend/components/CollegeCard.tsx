import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  logo_base64?: string;
  ranking?: number;
  star_rating: number;
  annual_fees: number;
  courses_offered: string[];
  university_type: string;
  placement_percentage: number;
  average_package: number;
  highest_package: number;
  hostel_facilities: boolean;
  wifi: boolean;
  sports_facilities: boolean;
  library_facilities: boolean;
  canteen: boolean;
  medical_facilities: boolean;
  established_year: number;
  total_students: number;
}

interface CollegeCardProps {
  college: College;
  onPress: () => void;
  onFavoritePress: () => void;
  onComparePress: () => void;
  isFavorite: boolean;
  isInCompare: boolean;
}

const CollegeCard: React.FC<CollegeCardProps> = ({
  college,
  onPress,
  onFavoritePress,
  onComparePress,
  isFavorite,
  isInCompare,
}) => {
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

  const getTopCourses = () => {
    return college.courses_offered.slice(0, 2);
  };

  return (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
        {/* Header with Logo and Basic Info */}
        <View style={styles.cardHeader}>
          <View style={styles.logoContainer}>
            {college.logo_base64 ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${college.logo_base64}` }}
                style={styles.logo}
              />
            ) : (
              <View style={[styles.logo, styles.placeholderLogo]}>
                <Ionicons name="school" size={28} color="#2196F3" />
              </View>
            )}
          </View>
          
          <View style={styles.collegeInfo}>
            <Text style={styles.collegeName} numberOfLines={2}>
              {college.name}
            </Text>
            <Text style={styles.location}>
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

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF5722" : "#666"} 
            />
          </TouchableOpacity>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Annual Fees</Text>
            <Text style={styles.metricValue}>{formatFees(college.annual_fees)}</Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Avg. Package</Text>
            <Text style={[styles.metricValue, { color: '#4CAF50' }]}>
              {formatPackage(college.average_package)}
            </Text>
          </View>
          
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Placement</Text>
            <Text style={[styles.metricValue, { color: '#FF9800' }]}>
              {college.placement_percentage}%
            </Text>
          </View>
        </View>

        {/* Course Tags */}
        <View style={styles.coursesRow}>
          {getTopCourses().map((course, index) => (
            <View key={index} style={styles.courseTag}>
              <Text style={styles.courseTagText}>{course}</Text>
            </View>
          ))}
          {college.courses_offered.length > 2 && (
            <Text style={styles.moreCourses}>
              +{college.courses_offered.length - 2} more
            </Text>
          )}
        </View>

        {/* Tags and Type */}
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { backgroundColor: getTypeColor(college.university_type) }]}>
            <Text style={[styles.tagText, { color: getTypeTextColor(college.university_type) }]}>
              {college.university_type}
            </Text>
          </View>
          
          <View style={styles.tag}>
            <Text style={styles.tagText}>Est. {college.established_year}</Text>
          </View>
          
          {college.total_students && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{formatNumber(college.total_students)} Students</Text>
            </View>
          )}
        </View>

        {/* Facilities */}
        <View style={styles.facilitiesRow}>
          {college.hostel_facilities && (
            <View style={styles.facility}>
              <Ionicons name="bed" size={16} color="#4CAF50" />
              <Text style={styles.facilityText}>Hostel</Text>
            </View>
          )}
          {college.wifi && (
            <View style={styles.facility}>
              <Ionicons name="wifi" size={16} color="#4CAF50" />
              <Text style={styles.facilityText}>WiFi</Text>
            </View>
          )}
          {college.sports_facilities && (
            <View style={styles.facility}>
              <Ionicons name="basketball" size={16} color="#4CAF50" />
              <Text style={styles.facilityText}>Sports</Text>
            </View>
          )}
          {college.library_facilities && (
            <View style={styles.facility}>
              <Ionicons name="library" size={16} color="#4CAF50" />
              <Text style={styles.facilityText}>Library</Text>
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.compareButton, isInCompare && styles.compareButtonActive]}
            onPress={onComparePress}
          >
            <Ionicons 
              name="analytics" 
              size={16} 
              color={isInCompare ? "#fff" : "#2196F3"} 
            />
            <Text style={[
              styles.compareButtonText, 
              isInCompare && styles.compareButtonTextActive
            ]}>
              {isInCompare ? 'Added' : 'Compare'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.viewButton} onPress={onPress}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'government': return '#E8F5E8';
    case 'private': return '#E3F2FD';
    case 'deemed': return '#FFF3E0';
    default: return '#F5F5F5';
  }
};

const getTypeTextColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'government': return '#2E7D32';
    case 'private': return '#1976D2';
    case 'deemed': return '#F57C00';
    default: return '#666';
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  location: {
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
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  rankingBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rankingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  coursesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  courseTag: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  courseTagText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  moreCourses: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  facility: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 11,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compareButtonActive: {
    backgroundColor: '#2196F3',
  },
  compareButtonText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '600',
  },
  compareButtonTextActive: {
    color: '#fff',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});

export default CollegeCard;