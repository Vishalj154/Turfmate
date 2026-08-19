import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
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

const CATEGORIES = [
  { id: '1', name: 'Cricket', icon: 'baseball-outline' },
  { id: '2', name: 'Football', icon: 'football-outline' },
  { id: '3', name: 'Badminton', icon: 'tennisball-outline' },
  { id: '4', name: 'Swimming', icon: 'water-outline' },
  { id: '5', name: 'Tennis', icon: 'tennisball-outline' },
];

export default function HomeScreen() {
  const { isDark, user, isFavorite, toggleFavorite } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const [allVenues, setAllVenues] = useState<UIVenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTurfs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActiveTurfsFromFirestore();
      setAllVenues(data);
    } catch (err: any) {
      console.error('Error fetching turfs:', err);
      setError('Unable to load turfs right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const turfs = allVenues.filter(v => v.type === 'Turf' || v.type === 'Sports Venue');
  const resorts = allVenues.filter(v => v.type === 'Resort');

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
            ₹{item.pricePerHour}<Text variant="caption">/hr</Text>
          </Text>
          <View style={styles.bookButton}>
            <Text variant="caption" weight="bold" color={Colors.light.surface}>Book Now</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}>
              <Text color={Colors.light.surface} weight="bold">{user?.name?.charAt(0) || 'G'}</Text>
            </View>
            <View>
              <Text variant="caption" color={themeColors.textSecondary}>Good evening, {user?.name?.split(' ')[0] || 'Guest'} 👋</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-sharp" size={14} color={themeColors.primary} />
                <Text variant="body" weight="medium">Vashi, Navi Mumbai</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="notifications-outline" size={24} color={themeColors.textPrimary} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity 
          style={[styles.searchBar, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <Text style={[styles.searchText, { color: themeColors.textSecondary }]}>Search turfs, resorts, venues...</Text>
          <View style={[styles.filterIcon, { backgroundColor: themeColors.primary }]}>
            <Ionicons name="options-outline" size={20} color={Colors.light.surface} />
          </View>
        </TouchableOpacity>

        {/* Banner Carousel (Static for now) */}
        <View style={styles.bannerContainer}>
          <Card style={[styles.banner, { backgroundColor: themeColors.primary }]}>
            <View style={styles.bannerContent}>
              <Text variant="h2" color={Colors.light.surface}>Flat 20% Off</Text>
              <Text variant="body" color={Colors.light.surface} style={{ opacity: 0.9, marginTop: 4 }}>On Weekend Bookings</Text>
            </View>
            <Ionicons name="ticket-outline" size={60} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
          </Card>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={[styles.categoryIcon, { backgroundColor: themeColors.surface }]}>
                <Ionicons name={cat.icon as any} size={24} color={themeColors.primary} />
              </View>
              <Text variant="caption" style={{ marginTop: Spacing.xs }}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Turfs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Popular Turfs</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
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
              <Text variant="body" color={themeColors.textSecondary}>No turfs available right now.</Text>
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

        {/* Premium Resorts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Premium Resorts</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
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
        
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
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
  }
});
