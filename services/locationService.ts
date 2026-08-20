import * as Location from 'expo-location';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the straight-line distance between two geographic points using the Haversine formula.
 * @returns Distance in kilometers rounded to 1 decimal place.
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return Infinity;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
};

/**
 * Formats a calculated distance number into a human-readable string (e.g. "2.4 km").
 */
export const formatDistance = (
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): string | null => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }

  const dist = calculateDistance(lat1, lon1, lat2, lon2);
  if (!isFinite(dist)) {
    return null;
  }

  return `${dist} km`;
};

/**
 * Checks existing foreground location permission without prompting the user.
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};

/**
 * Requests foreground location permission from the user.
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Obtains current user GPS coordinates if location services and permission are granted.
 * Kept exclusively in device memory/state (not saved to Firestore).
 */
export const getCurrentCoordinates = async (): Promise<UserCoordinates | null> => {
  try {
    const isServicesEnabled = await Location.hasServicesEnabledAsync();
    if (!isServicesEnabled) {
      console.warn('Location services are disabled on device');
      return null;
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error fetching current coordinates:', error);
    return null;
  }
};
