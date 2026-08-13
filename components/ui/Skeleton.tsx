import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, DimensionValue } from 'react-native';
import { useApp } from '../../store/AppContext';
import { BorderRadius } from '../../theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = BorderRadius.sm,
  style 
}) => {
  const { isDark } = useApp();
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isDark 
      ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.15)']
      : ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.1)'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  }
});
