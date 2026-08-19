import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useApp } from '../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getActiveTurfsFromFirestore } from '../services/turfService';
import { Venue as UIVenue } from '../types';

export default function SearchScreen() {
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [venues, setVenues] = useState<UIVenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getActiveTurfsFromFirestore()
      .then((data) => setVenues(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);
  
  const results = query === '' 
    ? venues 
    : venues.filter(v => v.name.toLowerCase().includes(query.toLowerCase()) || v.location.toLowerCase().includes(query.toLowerCase()));

  const renderVenueCard = ({ item }: { item: any }) => (
    <Card 
      style={styles.venueCard} 
      onPress={() => router.push(`/venue/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.venueImage} />
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
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Ionicons name="search" size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Search turfs, resorts, venues..."
            placeholderTextColor={themeColors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderVenueCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text variant="h3" color={themeColors.textSecondary}>No results found for "{query}"</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  venueCard: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    padding: 0,
    height: 100,
  },
  venueImage: {
    width: 100,
    height: 100,
  },
  venueInfo: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueSub: {
    marginVertical: 2,
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  }
});
