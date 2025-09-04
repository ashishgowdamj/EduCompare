import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { CompareProvider } from '../contexts/CompareContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function FontWrapper({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <FontWrapper>
      <SafeAreaProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CompareProvider>
              <Text style={{ display: 'none' }}>.</Text> {/* Force font loading */}
              <Stack 
                screenOptions={{ 
                  headerShown: false,
                  contentStyle: { 
                    backgroundColor: '#fff',
                    fontFamily: 'SpaceGrotesk-Regular' 
                  } as any
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="college/[id]" />
              </Stack>
            </CompareProvider>
          </FavoritesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </FontWrapper>
  );
}