import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H3, Body, Caption } from './Typography';

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
  recommendation_score?: number;
  match_reasons?: string[];
}

interface CompactCollegeCardProps {
  college: College;
  onPress: () => void;
  onFavoritePress: () => void;
  onComparePress: () => void;
  isFavorite: boolean;
  isInCompare: boolean;
}

const CompactCollegeCard: React.FC<CompactCollegeCardProps> = ({
  college,
  onPress,
  onFavoritePress,
  onComparePress,
  isFavorite,
  isInCompare,
}) => {
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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header with Logo and Actions */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {college.logo_base64 ? (
            <Image 
              source={{ uri: `data:image/jpeg;base64,${college.logo_base64}` }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Ionicons name="school" size={20} color="#666" />
            </View>
          )}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={onFavoritePress} 
            style={[styles.actionButton, isFavorite && styles.favoriteActive]}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={16} 
              color={isFavorite ? "#fff" : "#666"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onComparePress} 
            style={[styles.actionButton, isInCompare && styles.compareActive]}
          >
            <Ionicons 
              name={isInCompare ? "git-compare" : "git-compare-outline"} 
              size={16} 
              color={isInCompare ? "#fff" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* College Info */}
      <View style={styles.content}>
        <H3 style={styles.collegeName} numberOfLines={2}>{college.name}</H3>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Caption style={styles.location}>{college.city}, {college.state}</Caption>
        </View>

        {/* Key Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFC107" />
              <Caption style={styles.rating}>{college.star_rating}</Caption>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Caption style={styles.statLabel}>Fees</Caption>
            <Caption style={styles.statValue}>{formatFees(college.annual_fees)}</Caption>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Caption style={styles.statLabel}>Avg Package</Caption>
            <Caption style={styles.statValue}>{formatPackage(college.average_package)}</Caption>
          </View>
        </View>

        {/* Course Tags */}
        <View style={styles.coursesContainer}>
          {college.courses_offered.slice(0, 1).map((course, index) => (
            <View key={index} style={styles.courseTag}>
              <Caption style={styles.courseText} numberOfLines={1}>
                {course.length > 15 ? `${course.substring(0, 15)}...` : course}
              </Caption>
            </View>
          ))}
          {college.courses_offered.length > 1 && (
            <Caption style={styles.moreCoursesText}>
              +{college.courses_offered.length - 1} more
            </Caption>
          )}
        </View>

        {/* University Type Badge */}
        <View style={styles.typeContainer}>
          <View style={[styles.typeBadge, 
            college.university_type === 'Government' && styles.govBadge,
            college.university_type === 'Private' && styles.privateBadge,
            college.university_type === 'Deemed' && styles.deemedBadge
          ]}>
            <Caption style={[styles.typeText,
              college.university_type === 'Government' && styles.govText,
              college.university_type === 'Private' && styles.privateText,
              college.university_type === 'Deemed' && styles.deemedText
            ]} numberOfLines={1}>
              {college.university_type}
            </Caption>
          </View>
          
          {college.ranking && (
            <Caption style={styles.ranking} numberOfLines={1}>Rank #{college.ranking}</Caption>
          )}
        </View>
        
        {/* Match Reasons */}
        {college.match_reasons && college.match_reasons.length > 0 && (
          <View style={styles.matchReasonsContainer}>
            <Caption style={styles.matchReasonsTitle}>Why this matches:</Caption>
            {college.match_reasons.slice(0, 2).map((reason, index) => (
              <View key={index} style={styles.matchReasonItem}>
                <Ionicons name="checkmark-circle" size={10} color="#4CAF50" />
                <Caption style={styles.matchReasonText} numberOfLines={1}>
                  {reason.length > 25 ? `${reason.substring(0, 25)}...` : reason}
                </Caption>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recommendation Score */}
      {college.recommendation_score && (
        <View style={styles.scoreContainer}>
          <Caption style={styles.scoreText}>
            {Math.round(college.recommendation_score * 100)}% match
          </Caption>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    height: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  favoriteActive: {
    backgroundColor: '#e91e63',
  },
  compareActive: {
    backgroundColor: '#2196F3',
  },
  content: {
    flex: 1,
  },
  collegeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 16,
    height: 32,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    paddingHorizontal: 6,
    height: 28,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 1,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  coursesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
    height: 20,
    overflow: 'hidden',
  },
  courseTag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  courseText: {
    fontSize: 9,
    color: '#1976d2',
    fontWeight: '500',
  },
  moreCoursesText: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  govBadge: {
    backgroundColor: '#e8f5e8',
  },
  privateBadge: {
    backgroundColor: '#fff3e0',
  },
  deemedBadge: {
    backgroundColor: '#f3e5f5',
  },
  typeText: {
    fontSize: 9,
    fontWeight: '500',
  },
  govText: {
    color: '#2e7d32',
  },
  privateText: {
    color: '#f57c00',
  },
  deemedText: {
    color: '#7b1fa2',
  },
  ranking: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500',
  },
  scoreContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  scoreText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  matchReasonsContainer: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  matchReasonsTitle: {
    fontSize: 8,
    fontWeight: '600',
    color: '#666',
    marginBottom: 3,
  },
  matchReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  matchReasonText: {
    fontSize: 8,
    color: '#4CAF50',
    marginLeft: 3,
    flex: 1,
  },
});

export default CompactCollegeCard;
