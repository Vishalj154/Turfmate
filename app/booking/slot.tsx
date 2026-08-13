import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_VENUES } from '../../data/mockData';

const SLOTS = [
  { id: '1', time: '06:00 AM - 07:00 AM', status: 'available' },
  { id: '2', time: '07:00 AM - 08:00 AM', status: 'booked' },
  { id: '3', time: '08:00 AM - 09:00 AM', status: 'available' },
  { id: '4', time: '05:00 PM - 06:00 PM', status: 'available' },
  { id: '5', time: '06:00 PM - 07:00 PM', status: 'booked' },
  { id: '6', time: '07:00 PM - 08:00 PM', status: 'available' },
  { id: '7', time: '08:00 PM - 09:00 PM', status: 'available' },
];

export default function SlotSelectionScreen() {
  const { venueId, date } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  const venue = MOCK_VENUES.find(v => v.id === venueId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h2">Select Time</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text variant="h3">{venue?.name}</Text>
          <Text variant="body" color={themeColors.textSecondary}>{date}</Text>
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
          {SLOTS.slice(0, 3).map(slot => (
            <TouchableOpacity
              key={slot.id}
              disabled={slot.status === 'booked'}
              style={[
                styles.slotButton,
                { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                slot.status === 'booked' && { backgroundColor: themeColors.border, opacity: 0.5 },
                selectedSlot === slot.id && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
              ]}
              onPress={() => setSelectedSlot(slot.id)}
            >
              <Text 
                variant="body" 
                color={selectedSlot === slot.id ? Colors.light.surface : themeColors.textPrimary}
              >
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text variant="h3" style={{ marginVertical: Spacing.md }}>Evening Slots</Text>
        <View style={styles.slotsContainer}>
          {SLOTS.slice(3).map(slot => (
            <TouchableOpacity
              key={slot.id}
              disabled={slot.status === 'booked'}
              style={[
                styles.slotButton,
                { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                slot.status === 'booked' && { backgroundColor: themeColors.border, opacity: 0.5 },
                selectedSlot === slot.id && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
              ]}
              onPress={() => setSelectedSlot(slot.id)}
            >
              <Text 
                variant="body" 
                color={selectedSlot === slot.id ? Colors.light.surface : themeColors.textPrimary}
              >
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
        <Button 
          title="Review Booking" 
          size="lg" 
          disabled={!selectedSlot}
          onPress={() => {
            const timeSlot = SLOTS.find(s => s.id === selectedSlot)?.time;
            router.push(`/booking/summary?venueId=${venueId}&date=${date}&timeSlot=${timeSlot}`);
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
    paddingBottom: 30, // Safe area
    borderTopWidth: 1,
  }
});
