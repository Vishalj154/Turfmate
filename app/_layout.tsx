import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppProvider, useApp } from '../store/AppContext';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../theme';
import { OfflineBanner } from '../components/OfflineBanner';

// Wrapper component to handle routing logic based on state
const RootNavigation = () => {
  const { user, authLoading, isDark } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';
    const inTabsGroup = firstSegment === '(tabs)';
    const isInitialRoute = !firstSegment || firstSegment === 'index' || firstSegment === 'onboarding';

    if (user) {
      if (inAuthGroup || isInitialRoute) {
        router.replace('/(tabs)');
      }
    } else {
      if (inTabsGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [user, authLoading, segments]);

  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const primaryColor = isDark ? Colors.dark.primary : Colors.light.primary;

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
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
        <Stack.Screen name="booking/detail" />
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
