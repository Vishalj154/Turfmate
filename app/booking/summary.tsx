import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_VENUES } from '../../data/mockData';
import { Input } from '../../components/ui/Input';

export default function BookingSummaryScreen() {
  const { venueId, date, timeSlot } = useLocalSearchParams();
  const router = useRouter();
  const { isDark, user, addBooking } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const venue = MOCK_VENUES.find(v => v.id === venueId);
  
  if (!venue) return null;

  const price = venue.pricePerHour;
  const platformFee = 50;
  const total = price + platformFee - discount;

  const handleApplyCoupon = () => {
    if (coupon === 'WELCOME20') {
      setDiscount(Math.round(price * 0.2));
    } else {
      setDiscount(0);
    }
  };

  const handlePayment = () => {
    // Generate mock booking
    addBooking({
      id: `BKG-${Math.floor(100000 + Math.random() * 900000)}`,
      venueId: venue.id,
      date: date as string,
      timeSlot: timeSlot as string,
      amount: total,
      status: 'Upcoming'
    });
    
    // Payment is assumed successful for demo
    router.push({
      pathname: '/booking/success',
      params: { venueId, date, timeSlot, amount: total }
    });
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
            <Text variant="body" style={{ marginLeft: Spacing.sm }}>{date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={themeColors.primary} />
            <Text variant="body" style={{ marginLeft: Spacing.sm }}>{timeSlot}</Text>
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
              Coupon applied successfully!
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

      <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={themeColors.textSecondary}>To Pay</Text>
          <Text variant="h2" color={themeColors.primary}>₹{total}</Text>
        </View>
        <Button 
          title="Proceed to Pay" 
          size="lg" 
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
    paddingBottom: 30, // Safe area
    borderTopWidth: 1,
  }
});
