import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCompare } from '../../contexts/CompareContext';
import { useAuth } from '../../contexts/AuthContext';
import CollegeCard from '../../components/CollegeCard';

export default function Favorites() {
  const { favorites, isLoading, refreshFavorites, removeFromFavorites } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      refreshFavorites();
    }
  }, [user]);

  const handleCollegePress = (college: any) => {
    router.push(`/college/${college.id}`);
  };

  const handleFavoriteToggle = (college: any) => {
    removeFromFavorites(college.id);
  };

  const handleCompareToggle = (college: any) => {
    if (isInCompare(college.id)) {
      removeFromCompare(college.id);
    } else {
      addToCompare(college);
    }
  };

  const renderCollegeItem = ({ item }: { item: any }) => (
    <CollegeCard
      college={item}
      onPress={() => handleCollegePress(item)}
      onFavoritePress={() => handleFavoriteToggle(item)}
      onComparePress={() => handleCompareToggle(item)}
      isFavorite={true} // Always true in favorites screen
      isInCompare={isInCompare(item.id)}
    />
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to save and view your favorite colleges
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <Text style={styles.headerSubtitle}>
            {favorites.length} saved college{favorites.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Ionicons name="heart" size={28} color="#FF5722" />
      </View>

      {/* Favorites List */}
      <View style={styles.listContainer}>
        <FlashList
          data={favorites}
          renderItem={renderCollegeItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isLoading} 
              onRefresh={refreshFavorites}
              tintColor="#2196F3"
            />
          }
          estimatedItemSize={200}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptyText}>
                Start exploring colleges and tap the heart icon to save your favorites here
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  },
});