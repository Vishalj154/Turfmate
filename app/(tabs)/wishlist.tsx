import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MOCK_VENUES } from '../../data/mockData';

export default function WishlistScreen() {
  const { isDark, favorites, toggleFavorite } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const favoriteVenues = MOCK_VENUES.filter(v => favorites.includes(v.id));

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
        <Ionicons name="heart" size={24} color={themeColors.error} />
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: themeColors.surface }]}>
        <Ionicons name="heart-outline" size={60} color={themeColors.primary} />
      </View>
      <Text variant="h2" style={{ marginBottom: Spacing.xs }}>No Favorites Yet</Text>
      <Text variant="body" color={themeColors.textSecondary} align="center" style={{ marginBottom: Spacing.xl }}>
        Save your favorite turfs and venues to book them quickly later.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h1">Wishlist</Text>
        <Text variant="caption" color={themeColors.textSecondary}>{favoriteVenues.length} Saved Venues</Text>
      </View>

      <FlatList
        data={favoriteVenues}
        keyExtractor={item => item.id}
        renderItem={renderVenueCard}
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
    paddingBottom: Spacing.md,
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  venueCard: {
    marginBottom: Spacing.md,
    padding: 0,
  },
  venueImage: {
    width: '100%',
    height: 180,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    backgroundColor: Colors.light.primary, // always use light primary for button bg
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
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
