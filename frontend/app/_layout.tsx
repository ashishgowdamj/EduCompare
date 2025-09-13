import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { CompareProvider } from '../contexts/CompareContext';
import { PreferencesProvider } from '../contexts/PreferencesContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, LogBox, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';

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
      // Set default fonts across the app
      // Note: defaultProps may be undefined in prod bundles on some RN versions
      // so we defensively set them if available.
      // This keeps typography consistent without wrapping every Text/TextInput.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RNText: any = Text as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RNTextInput: any = TextInput as any;
      if (!RNText.defaultProps) RNText.defaultProps = {};
      if (!RNText.defaultProps.style) RNText.defaultProps.style = {};
      RNText.defaultProps.style = [RNText.defaultProps.style, { fontFamily: 'SpaceGrotesk-Regular' }];

      if (!RNTextInput.defaultProps) RNTextInput.defaultProps = {};
      if (!RNTextInput.defaultProps.style) RNTextInput.defaultProps.style = {};
      RNTextInput.defaultProps.style = [RNTextInput.defaultProps.style, { fontFamily: 'SpaceGrotesk-Regular' }];

      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
}

function ThemedRoot() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Text style={{ display: 'none' }}>.</Text>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { 
            backgroundColor: '#FFFFFF',
            fontFamily: 'SpaceGrotesk-Regular' 
          } as any
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="preferences-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="college/[id]" />
        <Stack.Screen name="search" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <FontWrapper>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <PreferencesProvider>
            <FavoritesProvider>
              <CompareProvider>
              <ThemedRoot />
              </CompareProvider>
            </FavoritesProvider>
          </PreferencesProvider>
        </AuthProvider>
      </SafeAreaProvider>
      </GestureHandlerRootView>
    </FontWrapper>
  );
}
