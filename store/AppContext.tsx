import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { User, Booking, Notification } from '../types';
import { MOCK_NOTIFICATIONS } from '../data/mockData';
import { subscribeToAuthState } from '../services/authStateService';
import { logoutUser } from '../services/authService';
import { getUserProfile } from '../services/userService';

import { initializeAndSyncData, saveBookingDual } from '../services/syncService';
import { saveLocalFavorite, removeLocalFavorite, getLocalFavorites, saveLocalUser } from '../database/localDatabase';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  
  user: User | null;
  authLoading: boolean;
  login: (asGuest?: boolean) => void;
  logout: () => Promise<void>;
  
  favorites: string[]; // venue IDs
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
  
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  refreshBookings: () => Promise<void>;
  
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  // Initialize SQLite database and sync with Firestore on mount after auth state is resolved
  useEffect(() => {
    if (authLoading) return;

    initializeAndSyncData(user?.id).then(({ bookings: syncedBookings }) => {
      if (syncedBookings) {
        setBookings(syncedBookings);
      }
    }).catch(err => {
      console.error('[AppContext] Error in initial database sync:', err);
    });
  }, [user?.id, authLoading]);

  const refreshBookings = async () => {
    const userId = user?.id || 'guest';
    const { bookings: updatedBkgs } = await initializeAndSyncData(userId);
    setBookings(updatedBkgs);
  };

  useEffect(() => {
    // Fallback timeout to prevent blank screen if Firebase auth is slow/offline
    const safetyTimer = setTimeout(() => {
      setAuthLoading(false);
    }, 2500);

    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      clearTimeout(safetyTimer);
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          const u: User = {
            id: fbUser.uid,
            name: profile?.name || fbUser.displayName || 'TurfMate User',
            email: profile?.email || fbUser.email || '',
            phone: profile?.phone || fbUser.phoneNumber || '',
            isVerified: fbUser.emailVerified || false,
            points: profile?.rewardPoints ?? 0,
          };
          setUser(u);
          await saveLocalUser(u);

          try {
            const favs = await getLocalFavorites(u.id);
            if (favs && favs.length > 0) setFavorites(favs);
          } catch (e) {
            console.error('Error fetching local favorites:', e);
          }
        } catch {
          const fallbackUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || 'TurfMate User',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '',
            isVerified: fbUser.emailVerified || false,
            points: 0,
          };
          setUser(fallbackUser);
          await saveLocalUser(fallbackUser);
        }
      } else {
        setUser(null);
        setBookings([]);
      }
      setAuthLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const login = (asGuest = false) => {
    if (asGuest) {
      setUser({
        id: 'guest',
        name: 'Guest User',
        email: '',
        phone: '',
        isVerified: false,
        points: 0
      });
      setBookings([]);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout errors if session already expired
    } finally {
      setUser(null);
      setBookings([]);
    }
  };

  const toggleFavorite = (venueId: string) => {
    const userId = user?.id || 'guest';
    setFavorites(prev => {
      const exists = prev.includes(venueId);
      if (exists) {
        removeLocalFavorite(userId, venueId);
        return prev.filter(id => id !== venueId);
      } else {
        saveLocalFavorite(userId, venueId);
        return [...prev, venueId];
      }
    });
  };

  const isFavorite = (venueId: string) => favorites.includes(venueId);

  const addBooking = (booking: Booking) => {
    const userId = user?.id || 'guest';
    setBookings(prev => [booking, ...prev]);
    saveBookingDual(booking, userId);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  return (
    <AppContext.Provider value={{
      themeMode,
      setThemeMode,
      isDark,
      user,
      authLoading,
      login,
      logout,
      favorites,
      toggleFavorite,
      isFavorite,
      bookings,
      addBooking,
      refreshBookings,
      notifications,
      markNotificationRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
