import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { CompareProvider } from '../contexts/CompareContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CompareProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="college/[id]" />
            <Stack.Screen name="compare" />
            <Stack.Screen name="search-results" />
          </Stack>
        </CompareProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}