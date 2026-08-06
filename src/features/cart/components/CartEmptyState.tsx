import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { ShoppingCart } from 'lucide-react-native';
import { theme } from '../../../theme';
import { useAnimatedPress } from '../../../hooks/useAnimatedPress';
import { TouchableOpacity } from 'react-native';

interface CartEmptyStateProps {
  t: any;
  onShopPress: () => void;
}

export const CartEmptyState = ({ t, onShopPress }: CartEmptyStateProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const { scaleValue, onPressIn, onPressOut } = useAnimatedPress(0.95);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 8 }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounce, { toValue: -10, duration: 700, useNativeDriver: true }),
          Animated.timing(iconBounce, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
      ).start();
    });
  }, [fadeAnim, slideAnim, iconBounce]);

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.iconCircle}>
        <Animated.View style={{ transform: [{ translateY: iconBounce }] }}>
          <ShoppingCart size={56} color={theme.colors.primary} strokeWidth={1.5} />
        </Animated.View>
      </View>

      <Text style={styles.title}>{t('cart.empty')}</Text>
      <Text style={styles.subtitle}>
        {t('cart.empty_subtitle') || 'Browse stores and add items to get started'}
      </Text>

      <TouchableOpacity
        onPress={onShopPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Animated.View style={[styles.button, { transform: [{ scale: scaleValue }] }]}>
          <Text style={styles.buttonText}>{t('home.title')}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
    maxWidth: '80%',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 15,
    borderRadius: theme.radius.xl,
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
