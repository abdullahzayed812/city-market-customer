import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { theme } from '../../../theme';
import QuantitySelector from '../../../components/common/QuantitySelector';
import { MeasurementType } from '@city-market/shared';
import { getApiBaseURL } from '../../../utils/serverConfig';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';

interface CartItemProps {
  item: any;
  onRemove: (id: string) => void;
  onUpdateAmount: (item: any, increment: boolean) => void;
  t: any;
}

export const CartItem = React.memo(({ item, onRemove, onUpdateAmount, t }: CartItemProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 4 }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const imageUri = item.imageUrl ? `${getApiBaseURL()}${item.imageUrl}` : null;

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.imageContainer}>
        <ImageWithPlaceholder uri={imageUri} style={styles.image} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.priceGroup}>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            {item.measurementType === MeasurementType.WEIGHT && (
              <Text style={styles.unit}>/kg</Text>
            )}
          </View>
          <QuantitySelector
            quantity={
              item.measurementType === MeasurementType.WEIGHT ? item.weightGrams : item.quantity
            }
            onIncrement={() => onUpdateAmount(item, true)}
            onDecrement={() => onUpdateAmount(item, false)}
            minQuantity={item.measurementType === MeasurementType.WEIGHT ? 500 : 1}
            displayValue={
              item.measurementType === MeasurementType.WEIGHT
                ? `${(item.weightGrams / 1000).toFixed(1)}kg`
                : undefined
            }
          />
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
    gap: theme.spacing.md,
  },
  imageContainer: {
    width: 76,
    height: 76,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    lineHeight: 19,
  },
  removeBtn: {
    padding: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  unit: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
});
