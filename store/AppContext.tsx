import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { User, Booking, Notification } from '../types';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  
  user: User | null;
  login: (asGuest?: boolean) => void;
  logout: () => void;
  
  favorites: string[]; // venue IDs
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
  
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['v1', 'v3']); // some mock favorites
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';

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
    } else {
      setUser({
        id: 'u1',
        name: 'Vishal Jankar',
        email: 'vishal@example.com',
        phone: '+91 9876543210',
        isVerified: true,
        points: 1250
      });
    }
  };

  const logout = () => {
    setUser(null);
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
      login,
      logout,
      favorites,
      toggleFavorite,
      isFavorite,
      bookings,
      addBooking,
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
