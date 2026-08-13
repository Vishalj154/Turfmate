import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../components/ui/Text';
import { Colors, Spacing } from '../theme';
import { useApp } from '../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  const router = useRouter();
  const { isDark } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      // For demo purposes, we go to onboarding directly
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const themeColors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.primary }]}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <View style={styles.logoContainer}>
          <Ionicons name="football-outline" size={60} color={Colors.light.surface} />
        </View>
        <Text variant="h1" color={Colors.light.surface} style={styles.title}>
          TurfMate
        </Text>
        <Text variant="body" color={Colors.light.surface} style={styles.subtitle}>
          Book. Play. Repeat.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.8,
  }
});
