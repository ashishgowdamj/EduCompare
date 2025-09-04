import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H3, Body, Caption } from './Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  logo_base64?: string;
  ranking?: number;
  star_rating: number;
}

interface FeaturedCollegesProps {
  colleges: College[];
  onViewAll?: () => void;
}

const FeaturedColleges: React.FC<FeaturedCollegesProps> = ({ colleges, onViewAll }) => {
  const router = useRouter();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={14} color="#FFC107" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={14} color="#FFC107" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={14} color="#E0E0E0" />);
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <H3 style={styles.sectionTitle}>Featured Colleges</H3>
        <TouchableOpacity onPress={onViewAll}>
          <Body style={styles.seeAll}>See All</Body>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {colleges.slice(0, 5).map((college) => (
          <TouchableOpacity
            key={college.id}
            style={styles.card}
            onPress={() => router.push(`/college/${college.id}`)}
          >
            <View style={styles.cardImageContainer}>
              {college.logo_base64 ? (
                <Image 
                  source={{ uri: `data:image/png;base64,${college.logo_base64}` }} 
                  style={styles.collegeImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.collegeImage, styles.placeholderImage]}>
                  <Ionicons name="school" size={32} color="#666" />
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              />
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(college.star_rating)}
                </View>
                <Caption style={styles.ratingText}>
                  {college.star_rating.toFixed(1)}
                </Caption>
              </View>
              {college.ranking && (
                <View style={styles.rankingBadge}>
                  <Caption style={styles.rankingText}>#{college.ranking}</Caption>
                </View>
              )}
            </View>
            <View style={styles.cardContent}>
              <H3 numberOfLines={1} style={styles.collegeName}>
                {college.name}
              </H3>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={14} color="#666" />
                <Body style={styles.locationText}>
                  {college.city}, {college.state}
                </Body>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
  },
  seeAll: {
    color: '#2196F3',
    fontSize: 14,
  },
  cardsContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardImageContainer: {
    height: 140,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-end',
  },
  collegeImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    top: '60%',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
  },
  rankingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankingText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  cardContent: {
    padding: 16,
  },
  collegeName: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default FeaturedColleges;
