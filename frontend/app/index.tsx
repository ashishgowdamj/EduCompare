import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, isLoading, isFirstTime } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      console.log('Index: Navigation logic - isFirstTime:', isFirstTime, 'user:', !!user);
      
      if (isFirstTime) {
        console.log('Index: Navigating to onboarding');
        router.replace('/onboarding');
      } else if (user) {
        console.log('Index: User exists, navigating to tabs');
        router.replace('/(tabs)/home');
      } else {
        console.log('Index: No user, navigating to onboarding');
        router.replace('/onboarding');
      }
    }
  }, [isLoading, user, isFirstTime]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});