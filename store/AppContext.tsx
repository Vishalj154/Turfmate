import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { User, Booking, Notification } from '../types';
import { MOCK_NOTIFICATIONS } from '../data/mockData';
import { subscribeToAuthState } from '../services/authStateService';
import { logoutUser } from '../services/authService';
import { getUserProfile } from '../services/userService';

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
  const [favorites, setFavorites] = useState<string[]>(['venue_001']);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const refreshBookings = async () => {
    if (user && user.id && user.id !== 'guest') {
      try {
        const { getUserBookingsFromFirestore } = await import('../services/bookingService');
        const userBkgs = await getUserBookingsFromFirestore(user.id);
        setBookings(userBkgs);
      } catch (err) {
        console.error('Error in refreshBookings:', err);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          const u: User = {
            id: profile?.id || fbUser.uid,
            name: profile?.name || fbUser.displayName || 'TurfMate User',
            email: profile?.email || fbUser.email || '',
            phone: profile?.phone || fbUser.phoneNumber || '',
            isVerified: fbUser.emailVerified || false,
            points: profile?.rewardPoints ?? 0,
          };
          setUser(u);

          // Fetch user's bookings from Firestore
          try {
            const { getUserBookingsFromFirestore } = await import('../services/bookingService');
            const userBkgs = await getUserBookingsFromFirestore(u.id);
            setBookings(userBkgs);
          } catch (e) {
            console.error('Error fetching initial user bookings:', e);
          }
        } catch {
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || 'TurfMate User',
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '',
            isVerified: fbUser.emailVerified || false,
            points: 0,
          });
        }
      } else {
        setUser(null);
        setBookings([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
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
    setFavorites(prev => 
      prev.includes(venueId) ? prev.filter(id => id !== venueId) : [...prev, venueId]
    );
  };

  const isFavorite = (venueId: string) => favorites.includes(venueId);

  const addBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
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
