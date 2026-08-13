import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../../theme';
import { useApp } from '../../store/AppContext';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress, 
  elevated = true,
  ...props 
}) => {
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const shadowStyles = isDark ? Shadows.dark : Shadows.light;

  const cardStyle = StyleSheet.flatten([
    styles.card,
    { backgroundColor: themeColors.card },
    elevated && shadowStyles,
    style
  ]);

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
  }
});
