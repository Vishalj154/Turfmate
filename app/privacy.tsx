import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Colors, Spacing } from '../theme';
import { useApp } from '../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const SECTIONS = [
    {
      title: 'Information We Collect',
      icon: 'person-outline',
      content: 'TurfMate collects essential account information including your Name, Email address, and optional Phone number provided during Firebase Authentication registration.',
    },
    {
      title: 'Booking Data',
      icon: 'calendar-outline',
      content: 'Your turf reservations, selected dates, time slots, and booking statuses are securely stored in Cloud Firestore to enable booking management and history features.',
    },
    {
      title: 'Location Data & Ephemeral Usage',
      icon: 'location-outline',
      content: 'When you grant GPS location permission, your current coordinates are kept only in application state/memory to calculate distance to nearby turfs. Coordinates are NEVER permanently saved or uploaded to Cloud Firestore.',
    },
    {
      title: 'Firebase Services',
      icon: 'cloud-outline',
      content: 'We use Firebase Authentication for secure user sign-in and session persistence, and Cloud Firestore for real-time database management and slot availability checks.',
    },
    {
      title: 'Data Protection & Security',
      icon: 'shield-checkmark-outline',
      content: 'Your data access is strictly isolated by Cloud Firestore security rules. User profile and booking records can only be accessed or modified by the authenticated account owner.',
    },
    {
      title: 'Contact Privacy Support',
      icon: 'mail-outline',
      content: 'If you have questions about your privacy rights or account data, contact us at support@turfmate.app.',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: Spacing.md }}>
          Last updated: August 2026
        </Text>

        {SECTIONS.map((sec, idx) => (
          <Card key={idx} style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name={sec.icon as any} size={22} color={themeColors.primary} style={{ marginRight: 8 }} />
              <Text variant="h3" weight="bold" style={{ flex: 1 }}>
                {sec.title}
              </Text>
            </View>
            <Text variant="body" color={themeColors.textSecondary} style={{ marginTop: Spacing.xs }}>
              {sec.content}
            </Text>
          </Card>
        ))}
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
  sectionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
