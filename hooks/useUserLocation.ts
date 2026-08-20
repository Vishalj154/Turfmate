import { useState, useCallback, useEffect } from 'react';
import {
  UserCoordinates,
  checkLocationPermission,
  requestLocationPermission,
  getCurrentCoordinates,
} from '../services/locationService';

export type PermissionState = 'undetermined' | 'granted' | 'denied';

export interface UseUserLocationReturn {
  location: UserCoordinates | null;
  permissionState: PermissionState;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<UserCoordinates | null>;
  refreshLocation: () => Promise<UserCoordinates | null>;
}

export const useUserLocation = (): UseUserLocationReturn => {
  const [location, setLocation] = useState<UserCoordinates | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('undetermined');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initial check on mount: check if permission was ALREADY granted previously
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const isGranted = await checkLocationPermission();
      if (isMounted) {
        if (isGranted) {
          setPermissionState('granted');
          // Silently obtain location if permission was already granted
          const coords = await getCurrentCoordinates();
          if (coords && isMounted) {
            setLocation(coords);
          }
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const requestLocation = useCallback(async (): Promise<UserCoordinates | null> => {
    setLoading(true);
    setError(null);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        setPermissionState('denied');
        setError('Location permission was denied. Standard turf listings will be displayed.');
        setLoading(false);
        return null;
      }

      setPermissionState('granted');
      const coords = await getCurrentCoordinates();
      if (!coords) {
        setError('Unable to detect current GPS location. Please check location settings.');
        setLoading(false);
        return null;
      }

      setLocation(coords);
      setLoading(false);
      return coords;
    } catch (err: any) {
      console.error('Error in requestLocation:', err);
      setError('Failed to access location services.');
      setLoading(false);
      return null;
    }
  }, []);

  const refreshLocation = useCallback(async (): Promise<UserCoordinates | null> => {
    if (permissionState !== 'granted') {
      return requestLocation();
    }
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentCoordinates();
      if (coords) {
        setLocation(coords);
      } else {
        setError('Location services unavailable.');
      }
      setLoading(false);
      return coords;
    } catch (err: any) {
      console.error('Error refreshing location:', err);
      setError('Unable to refresh location.');
      setLoading(false);
      return null;
    }
  }, [permissionState, requestLocation]);

  return {
    location,
    permissionState,
    loading,
    error,
    requestLocation,
    refreshLocation,
  };
};
