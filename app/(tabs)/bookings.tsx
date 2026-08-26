import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getTurfByIdFromFirestore, mapSchemaToUIVenue } from '../../services/turfService';
import { cancelBookingInFirestore } from '../../services/bookingService';
import { getLocalVenues } from '../../database/localDatabase';
import { sampleVenues } from '../../database/sampleData';
import { Venue as UIVenue } from '../../types';

const TABS = ['Upcoming', 'Completed', 'Cancelled'];

export default function BookingsScreen() {
  const { isDark, bookings, user, refreshBookings } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('Upcoming');
  const [venueCache, setVenueCache] = useState<{ [id: string]: UIVenue }>({});
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  useEffect(() => {
    async function fetchVenuesForBookings() {
      const newCache = { ...venueCache };
      let updated = false;

      // 1. Populate from local SQLite database and sample data first for instant image loading
      try {
        const local = await getLocalVenues();
        for (const lv of local) {
          if (lv.id && !newCache[lv.id]) {
            newCache[lv.id] = lv;
            updated = true;
          }
        }
      } catch (err) {
        console.warn('Error reading local SQLite venues:', err);
      }

      for (const sv of sampleVenues) {
        if (!newCache[sv.id]) {
          newCache[sv.id] = mapSchemaToUIVenue(sv);
          updated = true;
        }
      }

      // 2. Fetch any remaining missing venues from Firestore
      for (const b of bookings) {
        if (!newCache[b.venueId]) {
          try {
            const v = await getTurfByIdFromFirestore(b.venueId);
            if (v) {
              newCache[b.venueId] = v;
              updated = true;
            }
          } catch (e) {
            console.error('Error fetching venue for booking:', e);
          }
        }
      }

      if (updated) {
        setVenueCache(newCache);
      }
    }

    fetchVenuesForBookings();
  }, [bookings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (!user || user.id === 'guest') return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this turf booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(bookingId);
            try {
              await cancelBookingInFirestore(bookingId, user.id);
              await refreshBookings();
              Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
            } catch (err: any) {
              Alert.alert('Cancellation Failed', err?.message || 'Unable to cancel booking.');
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

  const renderBooking = ({ item }: { item: any }) => {
    const venue = venueCache[item.venueId];
    const venueName = venue?.name || 'Turf Venue';
    const venueLocation = venue?.location || 'Navi Mumbai';
    const venueImage = venue?.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800';

    return (
      <Card style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: venueImage }} style={styles.venueImage} />
          <View style={styles.venueInfo}>
            <Text variant="h3" numberOfLines={1}>{venueName}</Text>
            <Text variant="caption" color={themeColors.textSecondary} numberOfLines={1}>{venueLocation}</Text>
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

        <View style={styles.actionRow}>
          {activeTab === 'Upcoming' && (
            <Button 
              title="Cancel" 
              variant="outline" 
              size="sm" 
              loading={cancellingId === item.id}
              disabled={cancellingId === item.id}
              onPress={() => handleCancelBooking(item.id)}
              style={{ flex: 1, marginRight: Spacing.sm }} 
            />
          )}
          <Button 
            title="View Details" 
            variant="primary" 
            size="sm" 
            onPress={() => router.push({
              pathname: '/booking/detail',
              params: {
                bookingId: item.id,
                venueId: item.venueId,
                date: item.date,
                timeSlot: item.timeSlot,
                amount: item.amount,
                status: item.status
              }
            })}
            style={{ flex: 1 }} 
          />
        </View>
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
      <Button title="Explore Turfs" onPress={() => router.push('/(tabs)')} />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
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
