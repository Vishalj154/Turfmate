import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getActiveTurfsFromFirestore, getFallbackVenues } from '../../services/turfService';
import { getLocalVenues } from '../../database/localDatabase';
import { Venue } from '../../types';

export default function WishlistScreen() {
  const { isDark, favorites, toggleFavorite } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVenues() {
      try {
        const local = await getLocalVenues();
        if (local && local.length > 0) {
          setAllVenues(local);
        } else {
          setAllVenues(getFallbackVenues());
        }

        // Fetch latest from Firestore in background
        const live = await getActiveTurfsFromFirestore();
        if (live && live.length > 0) {
          setAllVenues(live);
        }
      } catch {
        setAllVenues(getFallbackVenues());
      } finally {
        setLoading(false);
      }
    }

    loadVenues();
  }, []);

  const favoriteVenues = allVenues.filter((v) => favorites.includes(v.id));

  const renderVenueCard = ({ item }: { item: Venue }) => (
    <Card
      style={styles.venueCard}
      onPress={() => router.push(`/venue/${item.id}`)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.venueImage}
        resizeMode="cover"
      />

      {/* Gradient overlay for readability */}
      <View style={styles.imageOverlay} />

      {/* Type badge */}
      <View style={[styles.typeBadge, { backgroundColor: item.type === 'Resort' ? '#10B981' : themeColors.primary }]}>
        <Text variant="caption" weight="bold" color="#fff">
          {item.type === 'Resort' ? '🏨 Resort' : '⚽ Turf'}
        </Text>
      </View>

      {/* Heart button */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="heart" size={20} color="#ef4444" />
      </TouchableOpacity>

      <View style={[styles.venueInfo, { backgroundColor: themeColors.surface }]}>
        <View style={styles.venueHeader}>
          <Text variant="h3" numberOfLines={1} style={{ flex: 1 }}>
            {item.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text variant="caption" style={{ marginLeft: 2, fontWeight: 'bold' }}>
              {item.rating}
            </Text>
          </View>
        </View>

        <Text variant="caption" color={themeColors.textSecondary} style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={themeColors.textSecondary} />
          {'  '}{item.location}
        </Text>

        <Text variant="caption" color={themeColors.textSecondary} style={styles.sportsRow}>
          {item.sports?.slice(0, 3).join(' · ')}
        </Text>

        <View style={styles.venueFooter}>
          <View>
            <Text variant="body" weight="bold" color={themeColors.primary}>
              ₹{item.pricePerHour}
            </Text>
            <Text variant="caption" color={themeColors.textSecondary}>
              per {item.type === 'Resort' ? 'night' : 'hour'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, { backgroundColor: themeColors.primary }]}
            onPress={() => router.push(`/booking/date?venueId=${item.id}`)}
          >
            <Text variant="caption" weight="bold" color="#fff">
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconCircle, { backgroundColor: themeColors.surface }]}>
        <Ionicons name="heart-outline" size={60} color={themeColors.primary} />
      </View>
      <Text variant="h2" style={{ marginBottom: Spacing.xs, textAlign: 'center' }}>
        No Favorites Yet
      </Text>
      <Text
        variant="body"
        color={themeColors.textSecondary}
        align="center"
        style={{ marginBottom: Spacing.xl, lineHeight: 22 }}
      >
        Tap the ❤️ heart icon on any turf or resort to save it here for quick booking later.
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: themeColors.primary }]}
        onPress={() => router.push('/')}
      >
        <Ionicons name="search-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text variant="body" weight="bold" color="#fff">
          Explore Venues
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <View>
          <Text variant="h1">❤️ Wishlist</Text>
          <Text variant="caption" color={themeColors.textSecondary}>
            {favoriteVenues.length} saved venue{favoriteVenues.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {favoriteVenues.length > 0 && (
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: themeColors.border }]}
            onPress={() => {
              favoriteVenues.forEach((v) => toggleFavorite(v.id));
            }}
          >
            <Ionicons name="trash-outline" size={16} color={themeColors.textSecondary} />
            <Text variant="caption" color={themeColors.textSecondary} style={{ marginLeft: 4 }}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={favoriteVenues}
          keyExtractor={(item) => item.id}
          renderItem={renderVenueCard}
          contentContainerStyle={[
            styles.listContent,
            favoriteVenues.length === 0 && { flex: 1 },
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  venueCard: {
    marginBottom: Spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: 180,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'transparent',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  locationRow: {
    marginBottom: 2,
  },
  sportsRow: {
    marginBottom: Spacing.md,
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
