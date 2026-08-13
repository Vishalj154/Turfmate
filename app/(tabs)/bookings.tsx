import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_VENUES } from '../../data/mockData';

const TABS = ['Upcoming', 'Completed', 'Cancelled'];

export default function BookingsScreen() {
  const { isDark, bookings } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const [activeTab, setActiveTab] = useState('Upcoming');

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  const getVenue = (id: string) => MOCK_VENUES.find(v => v.id === id);

  const renderBooking = ({ item }: { item: any }) => {
    const venue = getVenue(item.venueId);
    if (!venue) return null;

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: venue.image }} style={styles.venueImage} />
          <View style={styles.venueInfo}>
            <Text variant="h3">{venue.name}</Text>
            <Text variant="caption" color={themeColors.textSecondary}>{venue.location}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'Completed' ? themeColors.success + '20' : 
                               item.status === 'Cancelled' ? themeColors.error + '20' : 
                               themeColors.primary + '20' }
          ]}>
            <Text variant="caption" weight="bold" color={
              item.status === 'Completed' ? themeColors.success : 
              item.status === 'Cancelled' ? themeColors.error : 
              themeColors.primary
            }>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={themeColors.textSecondary} />
            <Text variant="caption" style={{ marginLeft: 4 }}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={themeColors.textSecondary} />
            <Text variant="caption" style={{ marginLeft: 4 }}>{item.timeSlot}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text variant="caption" weight="bold">₹{item.amount}</Text>
          </View>
        </View>

        {activeTab === 'Upcoming' && (
          <View style={styles.actionRow}>
            <Button title="Cancel" variant="outline" size="sm" style={{ flex: 1, marginRight: Spacing.sm }} />
            <Button title="View Details" variant="primary" size="sm" style={{ flex: 1 }} />
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: themeColors.surface }]}>
        <Ionicons name="calendar-clear-outline" size={60} color={themeColors.primary} />
      </View>
      <Text variant="h2" style={{ marginBottom: Spacing.xs }}>No Bookings Found</Text>
      <Text variant="body" color={themeColors.textSecondary} align="center" style={{ marginBottom: Spacing.xl }}>
        You don't have any {activeTab.toLowerCase()} bookings.
      </Text>
      <Button title="Explore Turfs" onPress={() => {}} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1">My Bookings</Text>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[
              styles.tab, 
              activeTab === tab && { borderBottomColor: themeColors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              variant="body" 
              weight={activeTab === tab ? 'bold' : 'regular'}
              color={activeTab === tab ? themeColors.primary : themeColors.textSecondary}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  bookingCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.2)',
    marginVertical: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  }
});
