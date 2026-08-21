import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT, Region, MarkerPressEvent } from 'react-native-maps';

import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Colors, Spacing, BorderRadius } from '../theme';
import { useApp } from '../store/AppContext';
import { useUserLocation } from '../hooks/useUserLocation';
import { getActiveTurfsFromFirestore } from '../services/turfService';
import { calculateDistance } from '../services/locationService';
import { Venue as UIVenue } from '../types';

const { width, height } = Dimensions.get('window');

// Default fallback location (Vashi, Navi Mumbai) if no user location or turfs available
const DEFAULT_REGION: Region = {
  latitude: 19.077065,
  longitude: 72.998993,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapScreen() {
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const params = useLocalSearchParams<{ venueId?: string; lat?: string; lng?: string }>();

  const mapRef = useRef<MapView | null>(null);

  const [turfs, setTurfs] = useState<UIVenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTurf, setSelectedTurf] = useState<UIVenue | null>(null);
  const [initialRegionSet, setInitialRegionSet] = useState<boolean>(false);

  const {
    location: userLocation,
    permissionState,
    loading: locationLoading,
    requestLocation,
  } = useUserLocation();

  // Load Firestore Turfs
  const loadTurfData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActiveTurfsFromFirestore();
      // Filter out turfs without valid coordinates
      const validTurfs = data.filter(
        (v) =>
          typeof v.latitude === 'number' &&
          typeof v.longitude === 'number' &&
          !isNaN(v.latitude) &&
          !isNaN(v.longitude)
      );
      setTurfs(validTurfs);

      // If venueId is passed in URL/params, select it immediately
      if (params.venueId) {
        const found = validTurfs.find((t) => t.id === params.venueId);
        if (found) {
          setSelectedTurf(found);
        }
      }
    } catch (err: any) {
      console.error('Error fetching turfs for map:', err);
      setError('Unable to load turfs. Displaying offline map view.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurfData();
  }, []);

  // Determine initial region focusing
  useEffect(() => {
    if (initialRegionSet || loading) return;

    let targetLat: number | null = null;
    let targetLng: number | null = null;

    // 1. Param venue coordinates or focused venue
    if (params.lat && params.lng) {
      const parsedLat = parseFloat(params.lat);
      const parsedLng = parseFloat(params.lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        targetLat = parsedLat;
        targetLng = parsedLng;
      }
    } else if (selectedTurf?.latitude && selectedTurf?.longitude) {
      targetLat = selectedTurf.latitude;
      targetLng = selectedTurf.longitude;
    } else if (userLocation) {
      // 2. User current GPS coordinates
      targetLat = userLocation.latitude;
      targetLng = userLocation.longitude;
    } else if (turfs.length > 0 && turfs[0].latitude && turfs[0].longitude) {
      // 3. First turf coordinate fallback
      targetLat = turfs[0].latitude;
      targetLng = turfs[0].longitude;
    }

    if (targetLat !== null && targetLng !== null) {
      setInitialRegionSet(true);
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: targetLat!,
            longitude: targetLng!,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          1000
        );
      }, 500);
    }
  }, [userLocation, selectedTurf, turfs, loading, initialRegionSet]);

  // Recenter to user's location
  const handleRecenterUser = async () => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        800
      );
    } else {
      const coords = await requestLocation();
      if (coords) {
        mapRef.current?.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          },
          800
        );
      }
    }
  };

  // Select marker handler
  const handleMarkerSelect = (turf: UIVenue) => {
    setSelectedTurf(turf);
    if (turf.latitude && turf.longitude) {
      mapRef.current?.animateToRegion(
        {
          latitude: turf.latitude,
          longitude: turf.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        500
      );
    }
  };

  // Calculate live distance for selected turf
  const selectedTurfDistance = useMemo(() => {
    if (
      selectedTurf &&
      userLocation &&
      typeof selectedTurf.latitude === 'number' &&
      typeof selectedTurf.longitude === 'number'
    ) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        selectedTurf.latitude,
        selectedTurf.longitude
      );
      return `${dist} km away`;
    }
    return selectedTurf?.distance || null;
  }, [selectedTurf, userLocation]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header Overlay */}
      <View
        style={[
          styles.header,
          { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text variant="h3">Turf Map</Text>
          <Text variant="caption" color={themeColors.textSecondary}>
            {turfs.length} {turfs.length === 1 ? 'venue' : 'venues'} found
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: themeColors.background }]}
          onPress={loadTurfData}
        >
          <Ionicons name="refresh-outline" size={20} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Permission / Status Chip Banner */}
      {permissionState === 'denied' && (
        <View style={[styles.statusBanner, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="location-outline" size={16} color="#B45309" />
          <Text variant="caption" color="#B45309" style={{ marginLeft: 6, flex: 1 }}>
            Location access disabled. Showing all turfs on map.
          </Text>
          <TouchableOpacity onPress={requestLocation}>
            <Text variant="caption" weight="bold" color="#B45309">
              Enable
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {error && (
        <View style={[styles.statusBanner, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="warning-outline" size={16} color="#B91C1C" />
          <Text variant="caption" color="#B91C1C" style={{ marginLeft: 6, flex: 1 }}>
            {error}
          </Text>
        </View>
      )}

      {/* Map View */}
      {Platform.OS === 'web' ? (
        <View style={styles.webFallback}>
          <Ionicons name="map-outline" size={64} color={themeColors.textSecondary} />
          <Text variant="h3" style={{ marginTop: Spacing.md }}>
            Interactive Map View
          </Text>
          <Text
            variant="body"
            color={themeColors.textSecondary}
            style={{ textAlign: 'center', marginTop: Spacing.xs, paddingHorizontal: Spacing.xl }}
          >
            Map rendering is optimized for mobile devices (Expo Go / Android / iOS).
          </Text>
          {turfs.length > 0 && (
            <View style={{ marginTop: Spacing.lg, width: '80%' }}>
              {turfs.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.webTurfItem,
                    { backgroundColor: themeColors.surface, borderColor: themeColors.border },
                  ]}
                  onPress={() => router.push(`/venue/${t.id}`)}
                >
                  <Text variant="body" weight="bold">
                    {t.name}
                  </Text>
                  <Text variant="caption" color={themeColors.primary}>
                    View Details →
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={DEFAULT_REGION}
          showsUserLocation={permissionState === 'granted'}
          showsMyLocationButton={false}
          showsCompass={true}
          onPress={() => setSelectedTurf(null)}
        >
          {turfs.map((turf) => {
            const isSelected = selectedTurf?.id === turf.id;
            return (
              <Marker
                key={turf.id}
                coordinate={{
                  latitude: turf.latitude!,
                  longitude: turf.longitude!,
                }}
                title={turf.name}
                description={turf.location}
                onPress={(e: MarkerPressEvent) => {
                  e.stopPropagation();
                  handleMarkerSelect(turf);
                }}
              >
                <View
                  style={[
                    styles.markerPin,
                    {
                      backgroundColor: isSelected ? Colors.light.primaryDark : themeColors.primary,
                      borderColor: '#FFFFFF',
                      transform: [{ scale: isSelected ? 1.25 : 1.0 }],
                    },
                  ]}
                >
                  <Ionicons name="football" size={16} color="#FFFFFF" />
                </View>
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.25)' }]}>
          <View style={[styles.loadingCard, { backgroundColor: themeColors.surface }]}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text variant="body" style={{ marginTop: Spacing.md }}>
              Loading turfs on map...
            </Text>
          </View>
        </View>
      )}

      {/* Empty State Overlay */}
      {!loading && turfs.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Card style={[styles.emptyCard, { backgroundColor: themeColors.surface }]}>
            <Ionicons name="location-outline" size={48} color={themeColors.textSecondary} />
            <Text variant="h3" style={{ marginTop: Spacing.md, textAlign: 'center' }}>
              No Turfs Available
            </Text>
            <Text
              variant="body"
              color={themeColors.textSecondary}
              style={{ textAlign: 'center', marginTop: Spacing.xs }}
            >
              We couldn't find any turfs with location coordinates right now.
            </Text>
            <Button
              title="Reload Turfs"
              onPress={loadTurfData}
              size="sm"
              style={{ marginTop: Spacing.lg }}
            />
          </Card>
        </View>
      )}

      {/* Recenter GPS Button */}
      {Platform.OS !== 'web' && (
        <TouchableOpacity
          style={[
            styles.gpsButton,
            { backgroundColor: themeColors.surface, borderColor: themeColors.border },
          ]}
          onPress={handleRecenterUser}
          activeOpacity={0.8}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color={themeColors.primary} />
          ) : (
            <Ionicons
              name="navigate"
              size={22}
              color={userLocation ? themeColors.primary : themeColors.textSecondary}
            />
          )}
        </TouchableOpacity>
      )}

      {/* Selected Turf Information Card */}
      {selectedTurf && (
        <View style={styles.cardContainer}>
          <Card
            style={[styles.infoCard, { backgroundColor: themeColors.surface }]}
            onPress={() => router.push(`/venue/${selectedTurf.id}`)}
          >
            <TouchableOpacity
              style={styles.closeCardButton}
              onPress={() => setSelectedTurf(null)}
            >
              <Ionicons name="close" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.cardRow}>
              <Image source={{ uri: selectedTurf.image }} style={styles.cardImage} />

              <View style={styles.cardContent}>
                <View style={styles.cardTitleRow}>
                  <Text variant="h3" numberOfLines={1} style={{ flex: 1 }}>
                    {selectedTurf.name}
                  </Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={themeColors.accent} />
                    <Text variant="caption" weight="bold" style={{ marginLeft: 2 }}>
                      {selectedTurf.rating}
                    </Text>
                  </View>
                </View>

                <Text
                  variant="caption"
                  color={themeColors.textSecondary}
                  numberOfLines={1}
                  style={{ marginVertical: 2 }}
                >
                  {selectedTurf.location}
                </Text>

                {selectedTurfDistance && (
                  <View style={styles.distanceBadge}>
                    <Ionicons name="navigate-outline" size={12} color={themeColors.primary} />
                    <Text
                      variant="caption"
                      weight="medium"
                      color={themeColors.primary}
                      style={{ marginLeft: 4 }}
                    >
                      {selectedTurfDistance}
                    </Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text variant="body" weight="bold" color={themeColors.primary}>
                    ₹{selectedTurf.pricePerHour}
                    <Text variant="caption">/hr</Text>
                  </Text>
                  <Button
                    title="View Turf"
                    size="sm"
                    onPress={() => router.push(`/venue/${selectedTurf.id}`)}
                  />
                </View>
              </View>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    zIndex: 9,
  },
  map: {
    width: width,
    height: height,
    ...StyleSheet.absoluteFillObject,
  },
  markerPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    elevation: 8,
  },
  emptyOverlay: {
    position: 'absolute',
    top: 120,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: 'center',
    zIndex: 15,
  },
  emptyCard: {
    width: '100%',
    padding: Spacing.xl,
    alignItems: 'center',
  },
  gpsButton: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 210,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 15,
  },
  cardContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 15,
  },
  infoCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  closeCardButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    zIndex: 5,
    padding: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: 16,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  webTurfItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
});
