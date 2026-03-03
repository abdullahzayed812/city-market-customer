import { Platform } from 'react-native';

export const shadows = {
    soft: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
        },
        android: {
            elevation: 2,
        },
    }),
    medium: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
        },
        android: {
            elevation: 6,
        },
    }),
    strong: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
        },
        android: {
            elevation: 12,
        },
    }),
};
