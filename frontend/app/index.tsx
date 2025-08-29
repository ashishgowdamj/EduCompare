import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, isLoading, isFirstTime } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isFirstTime) {
        router.replace('/onboarding');
      } else if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, user, isFirstTime]);

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