import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { getTurfByIdFromFirestore } from '../../services/turfService';
import { getBookedSlotsForVenueAndDate } from '../../services/bookingService';
import { Venue as UIVenue } from '../../types';

interface SlotOption {
  id: string;
  timeString: string; // e.g. "06:00 AM - 07:00 AM"
  startTime: string;  // e.g. "06:00 AM"
  endTime: string;    // e.g. "07:00 AM"
  period: 'morning' | 'evening';
}

const ALL_SLOTS: SlotOption[] = [
  { id: 'm1', timeString: '06:00 AM - 07:00 AM', startTime: '06:00 AM', endTime: '07:00 AM', period: 'morning' },
  { id: 'm2', timeString: '07:00 AM - 08:00 AM', startTime: '07:00 AM', endTime: '08:00 AM', period: 'morning' },
  { id: 'm3', timeString: '08:00 AM - 09:00 AM', startTime: '08:00 AM', endTime: '09:00 AM', period: 'morning' },
  { id: 'm4', timeString: '09:00 AM - 10:00 AM', startTime: '09:00 AM', endTime: '10:00 AM', period: 'morning' },
  { id: 'm5', timeString: '10:00 AM - 11:00 AM', startTime: '10:00 AM', endTime: '11:00 AM', period: 'morning' },

  { id: 'e1', timeString: '05:00 PM - 06:00 PM', startTime: '05:00 PM', endTime: '06:00 PM', period: 'evening' },
  { id: 'e2', timeString: '06:00 PM - 07:00 PM', startTime: '06:00 PM', endTime: '07:00 PM', period: 'evening' },
  { id: 'e3', timeString: '07:00 PM - 08:00 PM', startTime: '07:00 PM', endTime: '08:00 PM', period: 'evening' },
  { id: 'e4', timeString: '08:00 PM - 09:00 PM', startTime: '08:00 PM', endTime: '09:00 PM', period: 'evening' },
  { id: 'e5', timeString: '09:00 PM - 10:00 PM', startTime: '09:00 PM', endTime: '10:00 PM', period: 'evening' },
];

export default function SlotSelectionScreen() {
  const { venueId, date, displayDate } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [venue, setVenue] = useState<UIVenue | null>(null);
  const [bookedStartTimes, setBookedStartTimes] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const dateStr = (typeof date === 'string' ? date : '') || '';
  const displayDateStr = (typeof displayDate === 'string' ? displayDate : dateStr) || dateStr;
  const vId = (typeof venueId === 'string' ? venueId : '') || '';

  useEffect(() => {
    async function loadSlotData() {
      setLoading(true);
      try {
        if (vId) {
          const vData = await getTurfByIdFromFirestore(vId);
          setVenue(vData);

          const booked = await getBookedSlotsForVenueAndDate(vId, dateStr);
          setBookedStartTimes(booked);
        }
      } catch (err) {
        console.error('Error loading slot data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSlotData();
  }, [vId, dateStr]);

  const isSlotBooked = (slot: SlotOption) => bookedStartTimes.includes(slot.startTime);

  const morningSlots = ALL_SLOTS.filter(s => s.period === 'morning');
  const eveningSlots = ALL_SLOTS.filter(s => s.period === 'evening');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h2">Select Time Slot</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.infoBox}>
            <Text variant="h3">{venue?.name || 'Turf Venue'}</Text>
            <Text variant="body" color={themeColors.textSecondary}>{displayDateStr}</Text>
          </View>
          
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: themeColors.surface, borderWidth: 1, borderColor: themeColors.border }]} />
              <Text variant="caption">Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: themeColors.primary }]} />
              <Text variant="caption">Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: themeColors.border }]} />
              <Text variant="caption">Booked</Text>
            </View>
          </View>

          <Text variant="h3" style={{ marginBottom: Spacing.md }}>Morning Slots</Text>
          <View style={styles.slotsContainer}>
            {morningSlots.map(slot => {
              const booked = isSlotBooked(slot);
              const selected = selectedSlot?.id === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  disabled={booked}
                  style={[
                    styles.slotButton,
                    { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                    booked && { backgroundColor: themeColors.border, opacity: 0.5 },
                    selected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text 
                    variant="body" 
                    weight="medium"
                    color={selected ? Colors.light.surface : booked ? themeColors.textSecondary : themeColors.textPrimary}
                  >
                    {slot.timeString}
                  </Text>
                  {booked && (
                    <Text variant="caption" color={themeColors.error} style={{ marginTop: 2 }}>Booked</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text variant="h3" style={{ marginVertical: Spacing.md }}>Evening Slots</Text>
          <View style={styles.slotsContainer}>
            {eveningSlots.map(slot => {
              const booked = isSlotBooked(slot);
              const selected = selectedSlot?.id === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  disabled={booked}
                  style={[
                    styles.slotButton,
                    { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                    booked && { backgroundColor: themeColors.border, opacity: 0.5 },
                    selected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text 
                    variant="body" 
                    weight="medium"
                    color={selected ? Colors.light.surface : booked ? themeColors.textSecondary : themeColors.textPrimary}
                  >
                    {slot.timeString}
                  </Text>
                  {booked && (
                    <Text variant="caption" color={themeColors.error} style={{ marginTop: 2 }}>Booked</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border, paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <Button 
          title="Continue" 
          size="lg" 
          disabled={!selectedSlot || loading}
          onPress={() => {
            if (!selectedSlot) return;
            router.push(`/booking/summary?venueId=${vId}&date=${encodeURIComponent(dateStr)}&displayDate=${encodeURIComponent(displayDateStr)}&startTime=${encodeURIComponent(selectedSlot.startTime)}&endTime=${encodeURIComponent(selectedSlot.endTime)}&timeSlot=${encodeURIComponent(selectedSlot.timeString)}`);
          }}
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
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  backButton: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
  },
  infoBox: {
    marginBottom: Spacing.xl,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: Spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotButton: {
    width: '48%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bottomBar: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  }
});
