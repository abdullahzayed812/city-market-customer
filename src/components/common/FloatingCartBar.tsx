import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { AppText as Text, ForwardIcon, palette, radii, space, elevation } from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFormat } from '../../hooks/useFormat';

interface FloatingCartBarProps {
  itemCount: number;
  total: number;
  onPress: () => void;
}

const FloatingCartBar = ({ itemCount, total, onPress }: FloatingCartBarProps) => {
  const { t } = useTranslation();
  const { money } = useFormat();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(120)).current;
  const hasItems = itemCount > 0;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: hasItems ? 0 : 120,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [hasItems, slideAnim]);

  if (!hasItems) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: Math.max(insets.bottom, space.lg), transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${t('cart.view_cart')}, ${money(total)}`}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
      >
        <View style={styles.iconWrap}>
          <ShoppingCart size={20} color={palette.white} />
          <View style={styles.badge}>
            <Text style={styles.badgeText} maxFontSizeMultiplier={1}>
              {itemCount > 99 ? '99+' : itemCount}
            </Text>
          </View>
        </View>
        <Text variant="subheading" color={palette.white} style={styles.label} numberOfLines={1}>
          {t('cart.view_cart')}
        </Text>
        <Text variant="subheading" color={palette.white} style={styles.total}>
          {money(total)}
        </Text>
        <ForwardIcon size={20} color={palette.white} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    ...elevation.overlay,
  },
  bar: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  pressed: {
    backgroundColor: palette.primaryPressed,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    end: -8,
    backgroundColor: palette.accent,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: palette.primary,
  },
  badgeText: {
    color: palette.text,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
  },
  label: {
    flex: 1,
  },
  total: {
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});

export default FloatingCartBar;
