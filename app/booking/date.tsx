import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function DateSelectionScreen() {
  const { venueId } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [selectedDate, setSelectedDate] = useState<number>(12); // Mock date

  // Generate some mock dates for the calendar
  const renderDates = () => {
    const dates = [];
    for (let i = 12; i <= 25; i++) {
      const isSelected = selectedDate === i;
      dates.push(
        <TouchableOpacity 
          key={i} 
          style={[
            styles.dateBox, 
            { backgroundColor: isSelected ? themeColors.primary : themeColors.surface },
            !isSelected && { borderColor: themeColors.border, borderWidth: 1 }
          ]}
          onPress={() => setSelectedDate(i)}
        >
          <Text variant="caption" color={isSelected ? Colors.light.surface : themeColors.textSecondary}>Oct</Text>
          <Text variant="h2" color={isSelected ? Colors.light.surface : themeColors.textPrimary}>{i}</Text>
          <Text variant="caption" color={isSelected ? Colors.light.surface : themeColors.textSecondary}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i % 7]}
          </Text>
        </TouchableOpacity>
      );
    }
    return dates;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h2">Select Date</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthHeader}>
          <Text variant="h3">October 2026</Text>
          <View style={styles.arrows}>
            <Ionicons name="chevron-back" size={24} color={themeColors.textSecondary} />
            <Ionicons name="chevron-forward" size={24} color={themeColors.primary} style={{ marginLeft: Spacing.md }} />
          </View>
        </View>
        
        <View style={styles.calendar}>
          {renderDates()}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
        <Button 
          title="Continue to Time Slots" 
          size="lg" 
          onPress={() => router.push(`/booking/slot?venueId=${venueId}&date=12 Oct 2026`)}
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
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  arrows: {
    flexDirection: 'row',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dateBox: {
    width: '31%', // 3 in a row
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  bottomBar: {
    padding: Spacing.lg,
    paddingBottom: 30, // Safe area
    borderTopWidth: 1,
  }
});
