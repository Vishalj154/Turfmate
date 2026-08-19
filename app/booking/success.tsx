import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { getTurfByIdFromFirestore } from '../../services/turfService';
import { Venue as UIVenue } from '../../types';

export default function BookingSuccessScreen() {
  const { venueId, date, timeSlot, amount, bookingId } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [venue, setVenue] = useState<UIVenue | null>(null);

  const vId = (typeof venueId === 'string' ? venueId : '') || '';
  const displayBookingId = (typeof bookingId === 'string' ? bookingId : '') || `BKG-${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    if (vId) {
      getTurfByIdFromFirestore(vId).then(v => setVenue(v)).catch(() => {});
    }
  }, [vId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }], backgroundColor: themeColors.success + '20' }]}>
          <Ionicons name="checkmark-circle" size={80} color={themeColors.success} />
        </Animated.View>

        <Text variant="h1" style={styles.title}>Booking Confirmed!</Text>
        <Text variant="body" color={themeColors.textSecondary} align="center" style={styles.subtitle}>
          Your booking has been successfully recorded in Firestore.
        </Text>

        <Card style={styles.detailsCard}>
          <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: 4 }}>Venue</Text>
          <Text variant="h3" style={{ marginBottom: Spacing.md }}>{venue?.name || 'Turf Venue'}</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: 4 }}>Date</Text>
              <Text variant="body" weight="bold">{date}</Text>
            </View>
            <View style={styles.col}>
              <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: 4 }}>Time</Text>
              <Text variant="body" weight="bold">{timeSlot}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: 4 }}>Booking ID</Text>
              <Text variant="body" weight="bold" numberOfLines={1}>{displayBookingId}</Text>
            </View>
            <View style={styles.col}>
              <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: 4 }}>Amount</Text>
              <Text variant="body" weight="bold" color={themeColors.primary}>₹{amount}</Text>
            </View>
          </View>
        </Card>

        {/* Mock QR Code */}
        <View style={styles.qrContainer}>
          <Ionicons name="qr-code" size={100} color={themeColors.textPrimary} />
          <Text variant="caption" color={themeColors.textSecondary} style={{ marginTop: Spacing.sm }}>
            Show this QR code at the venue
          </Text>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Button 
          title="View My Bookings" 
          variant="outline"
          onPress={() => router.replace('/(tabs)/bookings')}
          style={{ marginBottom: Spacing.sm }}
        />
        <Button 
          title="Go to Home" 
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  detailsCard: {
    width: '100%',
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  bottomBar: {
    padding: Spacing.lg,
    paddingBottom: 30, // Safe area
  }
});
