import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useApp } from '../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const TECH_STACK = [
    'React Native 0.81',
    'Expo SDK 54',
    'TypeScript',
    'Firebase Authentication',
    'Cloud Firestore',
    'GPS / Location Services',
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">About TurfMate</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoCircle, { backgroundColor: themeColors.primary }]}>
            <Ionicons name="football-outline" size={48} color={Colors.light.surface} />
          </View>
          <Text variant="h1" weight="bold" style={{ marginTop: Spacing.sm }}>TurfMate</Text>
          <Text variant="body" color={themeColors.primary} weight="bold" style={{ marginTop: 2 }}>
            Find. Book. Play.
          </Text>
        </View>

        {/* Description Card */}
        <Card style={styles.card}>
          <Text variant="h3" weight="bold" style={{ marginBottom: Spacing.xs }}>
            Overview
          </Text>
          <Text variant="body" color={themeColors.textSecondary}>
            TurfMate is a sports turf discovery and booking mobile application designed to help players discover nearby sports turfs, check real-time time slot availability, and manage their reservations effortlessly.
          </Text>
        </Card>

        {/* Version Info Card */}
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text variant="body" weight="medium">App Version</Text>
            <Text variant="body" weight="bold" color={themeColors.primary}>v1.0.0</Text>
          </View>
        </Card>

        {/* Tech Stack Card */}
        <Card style={styles.card}>
          <Text variant="h3" weight="bold" style={{ marginBottom: Spacing.md }}>
            Technology Stack
          </Text>
          {TECH_STACK.map((tech, idx) => (
            <View key={idx} style={styles.techRow}>
              <Ionicons name="checkmark-circle" size={18} color={themeColors.primary} style={{ marginRight: 8 }} />
              <Text variant="body" weight="medium">{tech}</Text>
            </View>
          ))}
        </Card>

        <Text variant="caption" align="center" color={themeColors.textSecondary} style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
          © 2026 TurfMate • All Rights Reserved
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
});
