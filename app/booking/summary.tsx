import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/ui/Input';
import { getTurfByIdFromFirestore } from '../../services/turfService';
import { createBookingAtomic } from '../../services/bookingService';
import { Venue as UIVenue } from '../../types';

export default function BookingSummaryScreen() {
  const { venueId, date, displayDate, startTime, endTime, timeSlot } = useLocalSearchParams();
  const router = useRouter();
  const { isDark, user, addBooking, refreshBookings } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [venue, setVenue] = useState<UIVenue | null>(null);
  const [loadingVenue, setLoadingVenue] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const dateStr = (typeof date === 'string' ? date : '') || '';
  const displayDateStr = (typeof displayDate === 'string' ? displayDate : dateStr) || dateStr;
  const startTimeStr = (typeof startTime === 'string' ? startTime : '') || '';
  const endTimeStr = (typeof endTime === 'string' ? endTime : '') || '';
  const timeSlotStr = (typeof timeSlot === 'string' ? timeSlot : '') || '';
  const vId = (typeof venueId === 'string' ? venueId : '') || '';

  useEffect(() => {
    if (vId) {
      getTurfByIdFromFirestore(vId)
        .then(v => setVenue(v))
        .catch(err => console.error(err))
        .finally(() => setLoadingVenue(false));
    } else {
      setLoadingVenue(false);
    }
  }, [vId]);

  if (loadingVenue) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <Text variant="h2" style={{ marginBottom: Spacing.md }}>Venue Not Found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const price = venue.pricePerHour;
  const platformFee = 50;
  const total = price + platformFee - discount;

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'WELCOME20') {
      setDiscount(Math.round(price * 0.2));
      setErrorMessage(null);
    } else {
      setDiscount(0);
      setErrorMessage('Invalid coupon code');
    }
  };

  const handlePayment = async () => {
    if (!user || user.id === 'guest') {
      Alert.alert('Sign In Required', 'Please sign in to confirm your turf booking.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const newBooking = await createBookingAtomic({
        userId: user.id,
        venueId: venue.id,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        timeSlotString: timeSlotStr,
        players: 10,
        amount: total,
        couponId: discount > 0 ? 'WELCOME20' : null
      });

      addBooking(newBooking);
      await refreshBookings();

      router.push({
        pathname: '/booking/success',
        params: {
          venueId: venue.id,
          date: displayDateStr,
          timeSlot: timeSlotStr,
          amount: total,
          bookingId: newBooking.id
        }
      });
    } catch (err: any) {
      console.error('Error executing booking transaction:', err);
      if (err?.message === 'THIS_SLOT_IS_ALREADY_BOOKED') {
        Alert.alert(
          'Slot Already Booked',
          'This time slot was just reserved by another user. Please select a different time slot.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else if (err?.message === 'Please log in before making a booking.') {
        Alert.alert('Sign In Required', 'Please sign in to confirm your turf booking.');
      } else if (err?.message?.toLowerCase().includes('permission') || err?.message?.toLowerCase().includes('denied')) {
        setErrorMessage('Unable to complete booking. Please ensure you are signed in and try again.');
      } else if (err?.message?.toLowerCase().includes('network') || err?.message?.toLowerCase().includes('offline')) {
        setErrorMessage('Network error. Please check your internet connection and try again.');
      } else {
        setErrorMessage('Unable to complete booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h2">Booking Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.venueCard}>
          <Image source={{ uri: venue.image }} style={styles.venueImage} />
          <View style={styles.venueInfo}>
            <Text variant="h3">{venue.name}</Text>
            <Text variant="caption" color={themeColors.textSecondary}>{venue.location}</Text>
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          <Text variant="h3" style={{ marginBottom: Spacing.md }}>Schedule Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={themeColors.primary} />
            <Text variant="body" style={{ marginLeft: Spacing.sm }}>{displayDateStr}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={themeColors.primary} />
            <Text variant="body" style={{ marginLeft: Spacing.sm }}>{timeSlotStr}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color={themeColors.primary} />
            <Text variant="body" style={{ marginLeft: Spacing.sm }}>{user?.name || 'Guest User'}</Text>
          </View>
        </Card>

        <Card style={styles.couponCard}>
          <Text variant="h3" style={{ marginBottom: Spacing.sm }}>Have a Coupon?</Text>
          <View style={styles.couponRow}>
            <Input 
              placeholder="Enter Code (e.g. WELCOME20)"
              value={coupon}
              onChangeText={setCoupon}
              style={{ flex: 1, marginBottom: 0, height: 44 }}
            />
            <Button 
              title="Apply" 
              variant="outline" 
              style={{ marginLeft: Spacing.sm, height: 44 }}
              onPress={handleApplyCoupon}
            />
          </View>
          {discount > 0 && (
            <Text variant="caption" color={themeColors.success} style={{ marginTop: Spacing.xs }}>
              Coupon applied successfully! (20% Off)
            </Text>
          )}
          {errorMessage && (
            <Text variant="caption" color={themeColors.error} style={{ marginTop: Spacing.xs }}>
              {errorMessage}
            </Text>
          )}
        </Card>

        <Card style={styles.billCard}>
          <Text variant="h3" style={{ marginBottom: Spacing.md }}>Bill Details</Text>
          
          <View style={styles.billRow}>
            <Text variant="body" color={themeColors.textSecondary}>Turf Booking (1 hr)</Text>
            <Text variant="body">₹{price}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text variant="body" color={themeColors.textSecondary}>Platform Fee</Text>
            <Text variant="body">₹{platformFee}</Text>
          </View>
          
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text variant="body" color={themeColors.success}>Discount</Text>
              <Text variant="body" color={themeColors.success}>-₹{discount}</Text>
            </View>
          )}
          
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          
          <View style={styles.billRow}>
            <Text variant="h2">Total Amount</Text>
            <Text variant="h2" color={themeColors.primary}>₹{total}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border, paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={themeColors.textSecondary}>To Pay</Text>
          <Text variant="h2" color={themeColors.primary}>₹{total}</Text>
        </View>
        <Button 
          title="Confirm Booking" 
          size="lg" 
          loading={submitting}
          disabled={submitting}
          onPress={handlePayment}
          style={{ flex: 1.5 }}
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
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  backButton: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  venueImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  venueInfo: {
    flex: 1,
  },
  detailsCard: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  couponCard: {
    marginBottom: Spacing.md,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billCard: {
    marginBottom: Spacing.xl,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderTopWidth: 1,
  }
});
