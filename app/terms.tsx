import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Colors, Spacing } from '../theme';
import { useApp } from '../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const SECTIONS = [
    {
      title: '1. Introduction',
      content: 'Welcome to TurfMate. TurfMate is a sports venue discovery and booking prototype application designed to help users find and book sports turfs seamlessly.',
    },
    {
      title: '2. Account Usage',
      content: 'Users are responsible for maintaining the confidentiality of their Firebase Authentication credentials and account details. All activities under your account remain your responsibility.',
    },
    {
      title: '3. Turf Bookings',
      content: 'Bookings made on TurfMate are subject to real-time venue and time slot availability. Selecting a slot reserves it for your scheduled session.',
    },
    {
      title: '4. Slot Availability & Locking',
      content: 'Time slots are locked atomically in Cloud Firestore to prevent double-booking. Slots are allocated on a first-come, first-served basis.',
    },
    {
      title: '5. Cancellation Policy',
      content: 'Upcoming reservations may be cancelled through the My Bookings section prior to the scheduled start time. Cancelling releases the slot for other users.',
    },
    {
      title: '6. User Responsibilities',
      content: 'Users agree to adhere to all venue rules, safety guidelines, and scheduled start/end times when arriving at booked turf facilities.',
    },
    {
      title: '7. Payments',
      content: 'Payment confirmations rendered in TurfMate reflect prototype booking workflows. Prices shown are determined by venue rates and fees.',
    },
    {
      title: '8. Prohibited Activities',
      content: 'Users may not attempt unauthorized access, bypass security controls, generate spam bookings, or tamper with application network services.',
    },
    {
      title: '9. Service Availability',
      content: 'TurfMate strives to maintain reliable system uptime but does not guarantee uninterrupted service during maintenance or updates.',
    },
    {
      title: '10. Changes to Terms',
      content: 'These terms may be updated periodically to reflect application enhancements. Continued use of TurfMate constitutes acceptance of updated terms.',
    },
    {
      title: '11. Contact Information',
      content: 'For questions regarding these Terms & Conditions, please contact us at support@turfmate.app.',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: Spacing.md }}>
          Last updated: August 2026
        </Text>

        {SECTIONS.map((sec, idx) => (
          <Card key={idx} style={styles.sectionCard}>
            <Text variant="h3" weight="bold" color={themeColors.primary} style={{ marginBottom: Spacing.xs }}>
              {sec.title}
            </Text>
            <Text variant="body" color={themeColors.textSecondary}>
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
});
