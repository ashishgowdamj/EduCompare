import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H1, Body } from './Typography';

const { width } = Dimensions.get('window');

interface HomeHeroProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ searchQuery, onSearchChange, onSearchSubmit }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <H1 style={styles.title}>Find Your Perfect College</H1>
        <Body style={styles.subtitle}>Discover the best colleges and universities for your future</Body>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search colleges, courses, locations..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2196F3',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    marginTop: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default HomeHero;
