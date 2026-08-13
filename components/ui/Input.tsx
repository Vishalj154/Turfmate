import React, { useState } from 'react';
import { 
  TextInput, 
  TextInputProps, 
  View, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword,
  style,
  ...props
}) => {
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const containerStyle = StyleSheet.flatten([
    styles.inputContainer,
    { 
      backgroundColor: themeColors.surface,
      borderColor: error ? themeColors.error : isFocused ? themeColors.primary : themeColors.border,
    },
    style
  ]);

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="body" weight="medium" style={styles.label}>
          {label}
        </Text>
      )}
      <View style={containerStyle}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? themeColors.primary : themeColors.textSecondary} 
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input, 
            { color: themeColors.textPrimary },
            leftIcon ? { paddingLeft: Spacing.sm } : {}
          ]}
          placeholderTextColor={themeColors.textSecondary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={themeColors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text variant="caption" color={themeColors.error} style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: Typography.sizes.md,
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing.xs,
  }
});
