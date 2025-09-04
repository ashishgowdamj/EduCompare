import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { CompareProvider } from '../contexts/CompareContext';
import { PreferencesProvider } from '../contexts/PreferencesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, LogBox } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function FontWrapper({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
  });

  // Temporarily ignore noisy RN warning while we track down the exact source
  useEffect(() => {
    LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component']);
  }, []);

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
          <PreferencesProvider>
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
                <Stack.Screen name="preferences-setup" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="college/[id]" />
              </Stack>
              </CompareProvider>
            </FavoritesProvider>
          </PreferencesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </FontWrapper>
  );
}