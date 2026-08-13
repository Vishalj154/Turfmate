export const Colors = {
  light: {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    secondary: '#1565C0',
    accent: '#FFC107',
    success: '#2E7D32',
    error: '#D32F2F',
    background: '#F7F8FA',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
    tint: '#2E7D32',
  },
  dark: {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    secondary: '#1565C0',
    accent: '#FFC107',
    success: '#2E7D32',
    error: '#F87171',
    background: '#0F1115',
    surface: '#181B21',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    border: '#27272A',
    card: '#20242B',
    tint: '#4ADE80',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  }
};

export const Shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  }
};
