import { Platform } from 'react-native';

export const typography = {
    fontFamily: Platform.select({
        ios: 'System',
        android: 'sans-serif',
    }),
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        huge: 32,
    },
    weights: {
        light: '300' as const,
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};
