import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

export interface CalendarDate {
  fullDate: string; // "YYYY-MM-DD"
  displayDate: string; // "20 Aug 2026"
  dayName: string;
  dayNumber: number;
  monthName: string;
  monthYear: string;
}

export default function DateSelectionScreen() {
  const { venueId } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  // Generate 14 upcoming days starting from Today
  const upcomingDates = React.useMemo(() => {
    const list: CalendarDate[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const fullDate = `${year}-${month}-${dayStr}`;

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthFullNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const monthName = monthNames[d.getMonth()];
      const monthYear = `${monthFullNames[d.getMonth()]} ${year}`;
      const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];
      const displayDate = `${d.getDate()} ${monthName} ${year}`;

      list.push({
        fullDate,
        displayDate,
        dayName,
        dayNumber: d.getDate(),
        monthName,
        monthYear
      });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<CalendarDate>(upcomingDates[0]);

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
          <Text variant="h3">{selectedDate.monthYear}</Text>
          <View style={styles.arrows}>
            <Ionicons name="calendar-outline" size={24} color={themeColors.primary} />
          </View>
        </View>
        
        <View style={styles.calendar}>
          {upcomingDates.map((item) => {
            const isSelected = selectedDate.fullDate === item.fullDate;
            return (
              <TouchableOpacity 
                key={item.fullDate} 
                style={[
                  styles.dateBox, 
                  { backgroundColor: isSelected ? themeColors.primary : themeColors.surface },
                  !isSelected && { borderColor: themeColors.border, borderWidth: 1 }
                ]}
                onPress={() => setSelectedDate(item)}
              >
                <Text variant="caption" color={isSelected ? Colors.light.surface : themeColors.textSecondary}>{item.monthName}</Text>
                <Text variant="h2" color={isSelected ? Colors.light.surface : themeColors.textPrimary}>{item.dayNumber}</Text>
                <Text variant="caption" color={isSelected ? Colors.light.surface : themeColors.textSecondary}>
                  {item.dayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border, paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <Button 
          title="Continue" 
          size="lg" 
          onPress={() => router.push(`/booking/slot?venueId=${venueId}&date=${encodeURIComponent(selectedDate.fullDate)}&displayDate=${encodeURIComponent(selectedDate.displayDate)}`)}
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
    borderTopWidth: 1,
  }
});
