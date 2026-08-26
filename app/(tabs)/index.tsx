import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getActiveTurfsFromFirestore } from '../../services/turfService';
import { Venue as UIVenue } from '../../types';
import { useUserLocation } from '../../hooks/useUserLocation';
import { calculateDistance } from '../../services/locationService';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'cricket', name: 'Cricket', icon: 'baseball-outline' },
  { id: 'football', name: 'Football', icon: 'football-outline' },
  { id: 'badminton', name: 'Badminton', icon: 'tennisball-outline' },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball-outline' },
  { id: 'swimming', name: 'Swimming', icon: 'water-outline' },
  { id: 'resorts', name: 'Resorts', icon: 'bed-outline' },
];

export default function HomeScreen() {
  const { isDark, user, isFavorite, toggleFavorite, notifications, markNotificationRead } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const [allVenues, setAllVenues] = useState<UIVenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortByNearest, setSortByNearest] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const {
    location,
    permissionState,
    loading: locationLoading,
    requestLocation,
  } = useUserLocation();

  const fetchTurfs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActiveTurfsFromFirestore();
      setAllVenues(data);
    } catch (err: any) {
      console.error('Error fetching turfs:', err);
      setError('Unable to load turfs right now. Using offline cached listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const processedVenues = useMemo(() => {
    return allVenues.map((v) => {
      if (location && typeof v.latitude === 'number' && typeof v.longitude === 'number') {
        const distKm = calculateDistance(location.latitude, location.longitude, v.latitude, v.longitude);
        return {
          ...v,
          distance: `${distKm} km`,
          distanceKm: distKm,
        };
      }
      return v;
    });
  }, [allVenues, location]);

  const filteredVenues = useMemo(() => {
    let list = processedVenues;

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'resorts') {
        list = list.filter((v) => v.type === 'Resort');
      } else {
        const target = selectedCategory.toLowerCase();
        list = list.filter((v) =>
          v.sports?.some((s) => s.toLowerCase().includes(target)) ||
          v.type?.toLowerCase().includes(target) ||
          v.name.toLowerCase().includes(target) ||
          v.description.toLowerCase().includes(target)
        );
      }
    }

    if (sortByNearest && location) {
      return [...list].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return list;
  }, [processedVenues, selectedCategory, sortByNearest, location]);

  const turfs = useMemo(() => {
    if (selectedCategory === 'resorts') {
      return filteredVenues;
    }
    return filteredVenues.filter((v) => v.type !== 'Resort');
  }, [filteredVenues, selectedCategory]);

  const resorts = useMemo(() => {
    if (selectedCategory === 'resorts') return [];
    return filteredVenues.filter((v) => v.type === 'Resort');
  }, [filteredVenues, selectedCategory]);

  const handleLocationPress = async () => {
    if (permissionState === 'granted' && location) {
      Alert.alert(
        'GPS Location Active',
        `Current Coordinates:\nLatitude: ${location.latitude.toFixed(4)}\nLongitude: ${location.longitude.toFixed(4)}\n\nTurf distances are calculated live using your current GPS location.`,
        [{ text: 'OK' }]
      );
    } else {
      const coords = await requestLocation();
      if (!coords && permissionState === 'denied') {
        Alert.alert(
          'Location Access Required',
          'Location permission allows TurfMate to show nearby turfs and precise distances.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleBannerPress = () => {
    Alert.alert(
      '🎉 Special Offer Activated!',
      'Use promo code WELCOME20 at checkout for 20% OFF on all weekend bookings!',
      [
        { text: 'Explore Turfs', onPress: () => router.push('/search') },
        { text: 'OK' }
      ]
    );
  };

  const renderVenueCard = ({ item }: { item: any }) => (
    <Card 
      style={styles.venueCard} 
      onPress={() => router.push(`/venue/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.venueImage} />
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons 
          name={isFavorite(item.id) ? 'heart' : 'heart-outline'} 
          size={24} 
          color={isFavorite(item.id) ? themeColors.error : Colors.light.surface} 
        />
      </TouchableOpacity>
      <View style={styles.venueInfo}>
        <View style={styles.venueHeader}>
          <Text variant="h3" numberOfLines={1} style={{ flex: 1 }}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={themeColors.accent} />
            <Text variant="caption" style={{ marginLeft: 2, fontWeight: 'bold' }}>{item.rating}</Text>
          </View>
        </View>
        <Text variant="caption" color={themeColors.textSecondary} style={styles.venueSub}>
          {item.sports.join(', ')} • {item.distance}
        </Text>
        <View style={styles.venueFooter}>
          <Text variant="body" weight="bold" color={themeColors.primary}>
            ₹{item.pricePerHour}<Text variant="caption">/{item.type === 'Resort' ? 'night' : 'hr'}</Text>
          </Text>
          <View style={styles.bookButton}>
            <Text variant="caption" weight="bold" color={Colors.light.surface}>Book Now</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={[styles.avatar, { backgroundColor: themeColors.primary }]}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.7}
            >
              <Text color={Colors.light.surface} weight="bold">{user?.name?.charAt(0) || 'G'}</Text>
            </TouchableOpacity>
            <View>
              <Text variant="caption" color={themeColors.textSecondary}>
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Guest'} 👋
              </Text>
              <TouchableOpacity style={styles.locationContainer} onPress={handleLocationPress} activeOpacity={0.7}>
                <Ionicons name="location-sharp" size={14} color={location ? '#2E7D32' : themeColors.primary} />
                <Text variant="body" weight="medium" style={{ marginLeft: 2 }}>
                  {location ? 'GPS Location (Active)' : 'Vashi, Navi Mumbai'}
                </Text>
                {locationLoading ? (
                  <ActivityIndicator size="small" color={themeColors.primary} style={{ marginLeft: 4 }} />
                ) : (
                  <Ionicons name="chevron-down" size={14} color={themeColors.textSecondary} style={{ marginLeft: 2 }} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: themeColors.surface, marginRight: Spacing.xs }]}
              onPress={() => router.push({ pathname: '/map' })}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={22} color={themeColors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: themeColors.surface }]}
              onPress={() => setShowNotifications(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color={themeColors.textPrimary} />
              {unreadCount > 0 && <View style={styles.badge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={[styles.searchBar, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          onPress={() => router.push('/search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <Text style={[styles.searchText, { color: themeColors.textSecondary }]}>Search turfs, resorts, venues...</Text>
          <TouchableOpacity 
            style={[styles.filterIcon, { backgroundColor: themeColors.primary }]}
            onPress={() => router.push({ pathname: '/map' })}
          >
            <Ionicons name="map-outline" size={20} color={Colors.light.surface} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Weather Playability Widget */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
          <Card style={[styles.weatherWidget, { backgroundColor: isDark ? '#1E293B' : '#ECFDF5', borderColor: isDark ? '#334155' : '#A7F3D0' }]}>
            <View style={styles.weatherHeader}>
              <Ionicons name="sunny" size={28} color="#F59E0B" />
              <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                <Text variant="body" weight="bold" color={isDark ? '#F8FAFC' : '#065F46'}>
                  ☀️ Clear Skies • 28°C
                </Text>
                <Text variant="caption" color={isDark ? '#94A3B8' : '#047857'}>
                  Ideal weather for Football & Box Cricket in Navi Mumbai!
                </Text>
              </View>
              <View style={styles.playabilityBadge}>
                <Text variant="caption" weight="bold" color="#FFFFFF">Ideal</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Offer Banner */}
        <View style={styles.bannerContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={handleBannerPress}>
            <Card style={[styles.banner, { backgroundColor: themeColors.primary }]}>
              <View style={styles.bannerContent}>
                <Text variant="h2" color={Colors.light.surface}>Flat 20% Off</Text>
                <Text variant="body" color={Colors.light.surface} style={{ opacity: 0.9, marginTop: 4 }}>
                  Use code WELCOME20 on weekend bookings
                </Text>
              </View>
              <Ionicons name="ticket-outline" size={60} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
            </Card>
          </TouchableOpacity>
        </View>

        {/* Categories / Sports Filter Icons */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text variant="h3" style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm }}>
            Browse Sports & Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={styles.categoryItem}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.categoryIcon, 
                    { backgroundColor: isSelected ? themeColors.primary : themeColors.surface },
                    isSelected && { shadowColor: themeColors.primary, shadowRadius: 6, shadowOpacity: 0.3 }
                  ]}>
                    <Ionicons 
                      name={cat.icon as any} 
                      size={24} 
                      color={isSelected ? Colors.light.surface : themeColors.primary} 
                    />
                  </View>
                  <Text 
                    variant="caption" 
                    weight={isSelected ? 'bold' : 'regular'}
                    color={isSelected ? themeColors.primary : themeColors.textPrimary}
                    style={{ marginTop: Spacing.xs }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Popular Turfs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <Text variant="h3">
                {selectedCategory === 'all' ? 'Popular Turfs' : `${selectedCategory.toUpperCase()} Venues`}
              </Text>
              {location && (
                <TouchableOpacity
                  style={[
                    styles.nearestChip,
                    sortByNearest ? { backgroundColor: themeColors.primary } : { backgroundColor: themeColors.surface, borderWidth: 1, borderColor: themeColors.border }
                  ]}
                  onPress={() => setSortByNearest(!sortByNearest)}
                >
                  <Ionicons
                    name="navigate"
                    size={12}
                    color={sortByNearest ? Colors.light.surface : themeColors.primary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    variant="caption"
                    weight="medium"
                    color={sortByNearest ? Colors.light.surface : themeColors.primary}
                  >
                    {sortByNearest ? 'Nearest First' : 'Sort by Nearest'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => router.push({ pathname: '/search', params: { category: selectedCategory } })}>
              <Text variant="button" color={themeColors.primary}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          ) : error ? (
            <View style={{ padding: Spacing.lg, alignItems: 'center' }}>
              <Text variant="body" color={themeColors.error} style={{ marginBottom: Spacing.xs }}>{error}</Text>
              <Button title="Retry" size="sm" variant="outline" onPress={fetchTurfs} />
            </View>
          ) : turfs.length === 0 ? (
            <View style={{ padding: Spacing.lg, alignItems: 'center' }}>
              <Text variant="body" color={themeColors.textSecondary}>No venues match "{selectedCategory}".</Text>
              <Button 
                title="Clear Filter" 
                size="sm" 
                variant="outline" 
                onPress={() => setSelectedCategory('all')} 
                style={{ marginTop: Spacing.sm }}
              />
            </View>
          ) : (
            <FlatList
              data={turfs}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              renderItem={renderVenueCard}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        {/* Premium Resorts Section */}
        {resorts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3">Premium Resorts & Weekend Retreats</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/search', params: { type: 'Resort' } })}>
                <Text variant="button" color={themeColors.primary}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={resorts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              renderItem={renderVenueCard}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}
        
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Notifications Drawer Modal */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowNotifications(false)}
        >
          <View style={[styles.notificationsDrawer, { backgroundColor: themeColors.surface }]}>
            <View style={styles.drawerHeader}>
              <Text variant="h2">Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={24} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.map(n => (
                <TouchableOpacity 
                  key={n.id}
                  style={[
                    styles.notificationItem, 
                    { borderBottomColor: themeColors.border },
                    !n.isRead && { backgroundColor: themeColors.primary + '10' }
                  ]}
                  onPress={() => markNotificationRead(n.id)}
                >
                  <View style={[styles.notifIcon, { backgroundColor: themeColors.primary + '20' }]}>
                    <Ionicons 
                      name={n.type === 'Booking' ? 'calendar' : n.type === 'Offer' ? 'pricetag' : 'notifications'} 
                      size={20} 
                      color={themeColors.primary} 
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Text variant="body" weight="bold">{n.title}</Text>
                    <Text variant="caption" color={themeColors.textSecondary} style={{ marginTop: 2 }}>{n.message}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    height: 50,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  searchText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  filterIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  banner: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  categories: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  venueCard: {
    width: 280,
    marginRight: Spacing.md,
    padding: 0, // override default card padding
  },
  venueImage: {
    width: '100%',
    height: 160,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfo: {
    padding: Spacing.md,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  venueSub: {
    marginBottom: Spacing.md,
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  nearestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    marginLeft: 4,
  },
  weatherWidget: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  notificationsDrawer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
