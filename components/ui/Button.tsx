import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Text } from './Text';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  title: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  title,
  style,
  disabled,
  ...props
}) => {
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: themeColors.secondary, borderWidth: 0 },
          text: { color: Colors.light.surface } // Always light text on secondary
        };
      case 'outline':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: themeColors.primary },
          text: { color: themeColors.primary }
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 0 },
          text: { color: themeColors.primary }
        };
      case 'primary':
      default:
        return {
          button: { backgroundColor: themeColors.primary, borderWidth: 0 },
          text: { color: Colors.light.surface } // Always light text on primary
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm };
      case 'lg':
        return { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl };
      case 'md':
      default:
        return { paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.lg };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle = StyleSheet.flatten([
    styles.container,
    variantStyles.button,
    sizeStyles,
    disabled && styles.disabled,
    style,
  ]);

  return (
    <TouchableOpacity 
      style={containerStyle} 
      disabled={disabled || loading} 
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color as string} size="small" />
      ) : (
        <>
          {leftIcon && <React.Fragment>{leftIcon}</React.Fragment>}
          <Text 
            variant="button" 
            style={[styles.text, variantStyles.text, (leftIcon || rightIcon) ? { marginHorizontal: Spacing.sm } : undefined]}
          >
            {title}
          </Text>
          {rightIcon && <React.Fragment>{rightIcon}</React.Fragment>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  }
});
