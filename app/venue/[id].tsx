import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { getTurfByIdFromFirestore } from '../../services/turfService';
import { Venue as UIVenue } from '../../types';

const { width } = Dimensions.get('window');

export default function VenueDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark, isFavorite, toggleFavorite } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const [venue, setVenue] = useState<UIVenue | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      getTurfByIdFromFirestore(id)
        .then((data) => setVenue(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <Text variant="h2" style={{ marginBottom: Spacing.md }}>Venue Not Found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const gallery = venue.gallery.length > 0 ? venue.gallery : [venue.image];

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {gallery.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.image} />
            ))}
          </ScrollView>
          <SafeAreaView style={styles.headerButtons} edges={['top']}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => toggleFavorite(venue.id)}>
              <Ionicons 
                name={isFavorite(venue.id) ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isFavorite(venue.id) ? themeColors.error : '#000'} 
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text variant="h2">{venue.name}</Text>
              <Text variant="body" color={themeColors.textSecondary}>{venue.location}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color={themeColors.accent} />
              <Text variant="body" weight="bold" style={{ marginLeft: 4 }}>{venue.rating}</Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {venue.sports.map(sport => (
              <View key={sport} style={[styles.tag, { backgroundColor: themeColors.primary + '20' }]}>
                <Text variant="caption" weight="bold" color={themeColors.primary}>{sport}</Text>
              </View>
            ))}
            <View style={[styles.tag, { backgroundColor: themeColors.surface, borderWidth: 1, borderColor: themeColors.border }]}>
              <Text variant="caption" color={themeColors.textSecondary}>{venue.distance}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>About</Text>
            <Text variant="body" color={themeColors.textSecondary} style={{ lineHeight: 22 }}>
              {venue.description}
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.facilitiesContainer}>
              {venue.facilities.map(fac => (
                <View key={fac} style={styles.facilityItem}>
                  <Ionicons name="checkmark-circle" size={20} color={themeColors.success} />
                  <Text variant="body" style={{ marginLeft: Spacing.sm }}>{fac}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity
              style={[styles.mapPlaceholder, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
              onPress={() => router.push(`/map?venueId=${venue.id}${venue.latitude ? `&lat=${venue.latitude}&lng=${venue.longitude}` : ''}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={36} color={themeColors.primary} />
              <Text variant="body" weight="bold" color={themeColors.primary} style={{ marginTop: Spacing.xs }}>
                View on Interactive Map
              </Text>
              <Text variant="caption" color={themeColors.textSecondary}>
                Tap to explore turf location & directions
              </Text>
            </TouchableOpacity>
            <Text variant="caption" color={themeColors.textSecondary} style={{ marginTop: Spacing.sm }}>
              {venue.location}
            </Text>
          </View>
          
          {/* Spacer for bottom bar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Booking Bar */}
      <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
        <View>
          <Text variant="h3" color={themeColors.primary}>₹{venue.pricePerHour}</Text>
          <Text variant="caption" color={themeColors.textSecondary}>per hour</Text>
        </View>
        <Button 
          title="Book Now" 
          size="lg" 
          onPress={() => router.push(`/booking/date?venueId=${venue.id}`)}
          style={{ paddingHorizontal: Spacing.xxl }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -20,
    backgroundColor: 'transparent', 
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.xl,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: Spacing.md,
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: 30, // For iOS safe area
    borderTopWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  }
});
