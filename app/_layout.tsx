import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppProvider, useApp } from '../store/AppContext';
import { View } from 'react-native';
import { Colors } from '../theme';

// Wrapper component to handle routing logic based on state
const RootNavigation = () => {
  const { user, isDark } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Basic navigation guard logic for demo purposes
    // In a real app we'd wait for splash screen to hide, auth state to resolve, etc.
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    // We let the splash screen (index.tsx) or onboarding handle the initial flow, 
    // but if the user state changes we force navigation.
    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!user && inTabsGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, segments]);

  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="venue/[id]" />
        <Stack.Screen name="booking/date" />
        <Stack.Screen name="booking/slot" />
        <Stack.Screen name="booking/summary" />
        <Stack.Screen name="booking/success" />
        <Stack.Screen name="search" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigation />
    </AppProvider>
  );
}
