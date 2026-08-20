import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './ui/Text';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors, Spacing } from '../theme';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const [showRestored, setShowRestored] = useState<boolean>(false);
  const wasOffline = useRef<boolean>(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      setShowRestored(false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      if (wasOffline.current) {
        setShowRestored(true);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowRestored(false);
            wasOffline.current = false;
          });
        }, 3000);

        return () => clearTimeout(timer);
      } else {
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [isOnline, slideAnim]);

  if (isOnline && !showRestored) {
    return null;
  }

  const backgroundColor = showRestored ? Colors.light.success : '#D97706'; // Orange-amber for offline warning
  const message = showRestored ? 'Back online' : 'No internet connection';
  const iconName = showRestored ? 'wifi' : 'wifi-outline';

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor,
          paddingTop: insets.top + 4,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name={iconName as any} size={16} color="#FFFFFF" style={styles.icon} />
      <Text variant="caption" weight="medium" color="#FFFFFF">
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  icon: {
    marginRight: 6,
  },
});
