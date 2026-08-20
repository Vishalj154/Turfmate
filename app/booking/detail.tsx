import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { getTurfByIdFromFirestore } from '../../services/turfService';
import { cancelBookingInFirestore } from '../../services/bookingService';
import { Venue as UIVenue } from '../../types';

export default function BookingDetailScreen() {
  const { bookingId, venueId, date, timeSlot, amount, status } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, user, refreshBookings } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [venue, setVenue] = useState<UIVenue | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>((status as string) || 'Upcoming');
  const [cancelling, setCancelling] = useState<boolean>(false);

  const bId = (typeof bookingId === 'string' ? bookingId : '') || '';
  const vId = (typeof venueId === 'string' ? venueId : '') || '';
  const displayDate = (typeof date === 'string' ? date : '') || 'N/A';
  const displayTime = (typeof timeSlot === 'string' ? timeSlot : '') || 'N/A';
  const displayAmount = (typeof amount === 'string' || typeof amount === 'number' ? amount : '0');

  useEffect(() => {
    if (vId) {
      getTurfByIdFromFirestore(vId)
        .then((v) => setVenue(v))
        .catch((e) => console.error('Error fetching venue details:', e));
    }
  }, [vId]);

  const handleCancel = () => {
    if (!user || user.id === 'guest') return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelBookingInFirestore(bId, user.id);
              await refreshBookings();
              setCurrentStatus('Cancelled');
              Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
            } catch (err: any) {
              Alert.alert('Cancellation Failed', err?.message || 'Unable to cancel booking.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusBadgeStyle = () => {
    if (currentStatus === 'Completed') {
      return { bg: themeColors.success + '20', text: themeColors.success };
    }
    if (currentStatus === 'Cancelled') {
      return { bg: themeColors.error + '20', text: themeColors.error };
    }
    return { bg: themeColors.primary + '20', text: themeColors.primary };
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: badgeStyle.bg }]}>
          <Ionicons 
            name={currentStatus === 'Cancelled' ? 'close-circle' : currentStatus === 'Completed' ? 'checkmark-circle' : 'calendar'} 
            size={20} 
            color={badgeStyle.text} 
          />
          <Text variant="body" weight="bold" color={badgeStyle.text} style={{ marginLeft: 8 }}>
            Status: {currentStatus}
          </Text>
        </View>

        {/* Venue Card */}
        <Card style={styles.card}>
          <View style={styles.venueRow}>
            <Image 
              source={{ uri: venue?.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' }} 
              style={styles.venueImage} 
            />
            <View style={styles.venueInfo}>
              <Text variant="h3" numberOfLines={1}>{venue?.name || 'Turf Venue'}</Text>
              <Text variant="caption" color={themeColors.textSecondary} numberOfLines={1}>
                {venue?.location || 'Navi Mumbai'}
              </Text>
              <Text variant="caption" color={themeColors.primary} weight="bold" style={{ marginTop: 4 }}>
                {venue?.sports?.join(', ') || 'Football, Box Cricket'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Booking Details Card */}
        <Card style={styles.card}>
          <Text variant="h3" weight="bold" style={{ marginBottom: Spacing.md }}>
            Reservation Summary
          </Text>

          <View style={styles.detailRow}>
            <Text variant="caption" color={themeColors.textSecondary}>Booking ID</Text>
            <Text variant="body" weight="bold" numberOfLines={1} style={{ maxWidth: '60%' }}>
              {bId}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="caption" color={themeColors.textSecondary}>Date</Text>
            <Text variant="body" weight="bold">{displayDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="caption" color={themeColors.textSecondary}>Time Slot</Text>
            <Text variant="body" weight="bold">{displayTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="caption" color={themeColors.textSecondary}>Booked By</Text>
            <Text variant="body" weight="bold">{user?.name || 'TurfMate User'}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.detailRow}>
            <Text variant="body" weight="bold">Total Amount</Text>
            <Text variant="h2" color={themeColors.primary} weight="bold">₹{displayAmount}</Text>
          </View>
        </Card>

        {/* QR Code Section */}
        {currentStatus !== 'Cancelled' && (
          <Card style={[styles.card, styles.qrCard]}>
            <Text variant="body" weight="bold" style={{ marginBottom: Spacing.sm }}>
              Entry QR Code
            </Text>
            <Ionicons name="qr-code-outline" size={110} color={themeColors.textPrimary} />
            <Text variant="caption" color={themeColors.textSecondary} align="center" style={{ marginTop: Spacing.xs }}>
              Show this QR code to venue staff upon arrival
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[
        styles.bottomBar, 
        { 
          backgroundColor: themeColors.surface, 
          borderTopColor: themeColors.border,
          paddingBottom: Math.max(insets.bottom, Spacing.lg)
        }
      ]}>
        {currentStatus === 'Upcoming' && (
          <Button
            title="Cancel Booking"
            variant="outline"
            size="lg"
            loading={cancelling}
            disabled={cancelling}
            onPress={handleCancel}
            style={{ flex: 1, marginRight: Spacing.sm }}
          />
        )}
        <Button
          title="Book Again"
          variant={currentStatus === 'Upcoming' ? 'secondary' : 'primary'}
          size="lg"
          onPress={() => router.push(`/venue/${vId}`)}
          style={{ flex: 1 }}
        />
      </View>
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  venueInfo: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.xs + 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  qrCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  bottomBar: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
