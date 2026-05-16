import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ShoppingCart, ArrowRight } from 'lucide-react-native';
import { theme } from '../../theme';

interface FloatingCartBarProps {
  itemCount: number;
  total: number;
  onPress: () => void;
}

const FloatingCartBar = ({ itemCount, total, onPress }: FloatingCartBarProps) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 16,
        bounciness: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [itemCount > 0]);

  useEffect(() => {
    if (itemCount !== prevCount.current) {
      prevCount.current = itemCount;
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.04, useNativeDriver: true, speed: 50, bounciness: 10 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }),
      ]).start();
    }
  }, [itemCount]);

  if (itemCount === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.bar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
        </View>
        <ShoppingCart size={20} color={theme.colors.white} />
        <Text style={styles.label}>View Cart</Text>
        <Text style={styles.total}>${total.toFixed(2)}</Text>
        <ArrowRight size={18} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    ...theme.shadows.strong,
  },
  bar: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 10,
  },
  badge: {
    backgroundColor: theme.colors.accent,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    flex: 1,
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  total: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});

export default FloatingCartBar;
