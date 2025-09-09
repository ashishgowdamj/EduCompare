import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCompare } from '../../contexts/CompareContext';
import { useAuth } from '../../contexts/AuthContext';
import CollegeCard from '../../components/CollegeCard';
import AppHeader from '../../components/AppHeader';

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
      compact
    />
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppHeader
        title="My Favorites"
        rightComponent={<Ionicons name="heart" size={24} color="#FF5722" />}
      />

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
