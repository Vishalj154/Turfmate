import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography } from '../../theme';
import { useApp } from '../../store/AppContext';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: string;
  weight?: keyof typeof Typography.weights;
  align?: TextStyle['textAlign'];
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  weight,
  align = 'auto',
  style,
  children,
  ...props
}) => {
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return { fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold };
      case 'h2':
        return { fontSize: Typography.sizes.xxl, fontWeight: Typography.weights.bold };
      case 'h3':
        return { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semiBold };
      case 'button':
        return { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semiBold };
      case 'caption':
        return { fontSize: Typography.sizes.xs, color: themeColors.textSecondary };
      case 'body':
      default:
        return { fontSize: Typography.sizes.sm };
    }
  };

  const textStyle = StyleSheet.flatten([
    {
      color: color || themeColors.textPrimary,
      textAlign: align,
      fontWeight: weight ? Typography.weights[weight] : undefined,
    },
    getVariantStyle(),
    style,
  ]);

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};
