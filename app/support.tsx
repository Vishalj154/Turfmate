import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useApp } from '../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How do I book a turf?',
    answer: 'Browse turfs on the Home screen or Search tab, select your preferred venue, pick an available date and time slot, and tap "Confirm Booking" to complete your reservation.',
  },
  {
    question: 'How do I cancel a booking?',
    answer: 'Navigate to the Bookings tab, tap "View Details" on an upcoming booking, and select "Cancel Booking". Your time slot will be instantly released for other users.',
  },
  {
    question: 'How do I view my bookings?',
    answer: 'Tap the Bookings tab on the bottom navigation bar to view all your upcoming, completed, and cancelled turf reservations.',
  },
  {
    question: 'What happens if a slot is already booked?',
    answer: 'Booked slots are disabled on the time slot selection screen. If another user reserves a slot simultaneously, our atomic database transaction prevents double-booking and prompts you to select another slot.',
  },
  {
    question: 'How does location work?',
    answer: 'TurfMate requests GPS location permission to calculate distances and sort turfs by nearest distance. Coordinates are kept strictly in application memory during your active session and are never permanently saved.',
  },
];

export default function SupportScreen() {
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <Card style={[styles.bannerCard, { backgroundColor: themeColors.surface }]}>
          <Ionicons name="help-buoy-outline" size={40} color={themeColors.primary} style={{ marginBottom: Spacing.xs }} />
          <Text variant="h2" weight="bold" style={{ marginBottom: Spacing.xs }}>How can we help you?</Text>
          <Text variant="body" color={themeColors.textSecondary}>
            Find answers to frequently asked questions about booking, cancellations, and location features.
          </Text>
        </Card>

        {/* FAQs */}
        <Text variant="h3" weight="bold" style={{ marginBottom: Spacing.md }}>
          Frequently Asked Questions
        </Text>

        {FAQS.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <Card key={index} style={styles.faqCard}>
              <TouchableOpacity 
                style={styles.faqHeader} 
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <Text variant="body" weight="bold" style={{ flex: 1, paddingRight: 8 }}>
                  {faq.question}
                </Text>
                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={themeColors.primary} 
                />
              </TouchableOpacity>
              {isExpanded && (
                <View style={[styles.answerBox, { borderTopColor: themeColors.border }]}>
                  <Text variant="body" color={themeColors.textSecondary}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </Card>
          );
        })}

        {/* Still Need Help */}
        <Card style={[styles.contactCard, { backgroundColor: themeColors.surface }]}>
          <Text variant="h3" weight="bold" style={{ marginBottom: Spacing.xs }}>Still need help?</Text>
          <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: Spacing.md }}>
            Our support team is here to assist you with any issues or inquiries.
          </Text>

          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color={themeColors.primary} style={{ marginRight: 8 }} />
            <Text variant="body" weight="medium" color={themeColors.primary}>
              support@turfmate.app
            </Text>
          </View>
        </Card>
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
  bannerCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  faqCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerBox: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  contactCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
