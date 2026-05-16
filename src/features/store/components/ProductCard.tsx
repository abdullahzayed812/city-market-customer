import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import { theme } from '../../../theme';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';
import { MeasurementType } from '@city-market/shared';

interface ProductCardProps {
  item: any;
  onPress: (id: string) => void;
  onAdd: (item: any) => void;
}

export const ProductCard = React.memo(({ item, onPress, onAdd }: ProductCardProps) => {
  const isAvailable = item.isAvailable;
  const cardScale = useRef(new Animated.Value(1)).current;
  const addScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (!isAvailable) return;
    Animated.spring(cardScale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 2 }).start();
  }, [cardScale, isAvailable]);

  const handlePressOut = useCallback(() => {
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  }, [cardScale]);

  const handleAdd = useCallback(() => {
    if (!isAvailable) return;
    Animated.sequence([
      Animated.spring(addScale, { toValue: 1.3, useNativeDriver: true, speed: 50, bounciness: 12 }),
      Animated.spring(addScale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 6 }),
    ]).start();
    onAdd(item);
  }, [addScale, isAvailable, item, onAdd]);

  return (
    <View style={[styles.wrapper, !isAvailable && styles.disabled]}>
      <TouchableOpacity
        onPress={() => isAvailable && onPress(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={!isAvailable}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
          <View style={styles.imageWrapper}>
            <ImageWithPlaceholder uri={item.imageUrl || null} style={styles.image} />
            {!isAvailable && (
              <View style={styles.outOfStockOverlay}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.addButtonWrapper}
              onPress={handleAdd}
              disabled={!isAvailable}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.addButton,
                  !isAvailable && styles.addButtonDisabled,
                  { transform: [{ scale: addScale }] },
                ]}
              >
                <Plus size={16} color={theme.colors.white} strokeWidth={3} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              {item.measurementType === MeasurementType.WEIGHT && (
                <Text style={styles.unit}>/kg</Text>
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: theme.spacing.xs,
  },
  disabled: {
    opacity: 0.55,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  imageWrapper: {
    height: 118,
    width: '100%',
    backgroundColor: theme.colors.borderLight,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: theme.colors.error,
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  addButtonWrapper: {
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  addButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  info: {
    padding: 10,
    paddingTop: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 5,
    lineHeight: 17,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  unit: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});
