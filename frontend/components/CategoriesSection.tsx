import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './Typography';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 3.5;

const categories = [
  { id: 'top', name: 'Top Rated', icon: 'star' },
  { id: 'nearby', name: 'Nearby', icon: 'location' },
  { id: 'engineering', name: 'Engineering', icon: 'build' },
  { id: 'medical', name: 'Medical', icon: 'medkit' },
  { id: 'business', name: 'Business', icon: 'business' },
  { id: 'arts', name: 'Arts', icon: 'color-palette' },
];

interface CategoriesSectionProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategory?: string;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ onSelectCategory, selectedCategory }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Body style={styles.sectionTitle}>Categories</Body>
        <TouchableOpacity>
          <Body style={styles.seeAll}>See All</Body>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <View style={[
              styles.iconContainer,
              selectedCategory === category.id && styles.selectedIconContainer
            ]}>
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={selectedCategory === category.id ? '#2196F3' : '#666'} 
              />
            </View>
            <Body style={[
              styles.categoryName,
              selectedCategory === category.id && styles.selectedCategoryName
            ]}>
              {category.name}
            </Body>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    color: '#2196F3',
    fontSize: 14,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  categoryCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    marginRight: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedCategory: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedIconContainer: {
    backgroundColor: '#E3F2FD',
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  selectedCategoryName: {
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default CategoriesSection;
