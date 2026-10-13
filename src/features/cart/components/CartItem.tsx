import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text, IconButton, palette, radii, space } from '@city-market/mobile-ui';
import { Trash2 } from 'lucide-react-native';
import QuantitySelector from '../../../components/common/QuantitySelector';
import { MeasurementType } from '@city-market/shared';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';
import { useFormat } from '../../../hooks/useFormat';

interface CartItemProps {
  item: any;
  onRemove: (id: string) => void;
  onUpdateAmount: (item: any, increment: boolean) => void;
  t: any;
}

export const CartItem = React.memo(({ item, onRemove, onUpdateAmount, t }: CartItemProps) => {
  const { money, weight } = useFormat();
  const isWeight = item.measurementType === MeasurementType.WEIGHT;
  // Same formula as CartContext's total.
  const lineTotal = isWeight ? (item.price * (item.weightGrams || 0)) / 1000 : item.price * (item.quantity || 0);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <ImageWithPlaceholder uri={item.imageUrl || null} style={styles.image} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text variant="label" color={palette.text} numberOfLines={2}>
              {item.name}
            </Text>
            <Text variant="caption" color={palette.textMuted}>
              {money(item.price)}
              {isWeight ? ` ${t('common.per_kg')}` : ''}
            </Text>
          </View>
          <IconButton
            icon={Trash2}
            variant="plain"
            size={36}
            iconColor={palette.error}
            onPress={() => onRemove(item.id)}
            accessibilityLabel={t('cart.remove_a11y', { name: item.name })}
          />
        </View>

        <View style={styles.bottomRow}>
          <QuantitySelector
            quantity={isWeight ? item.weightGrams : item.quantity}
            onIncrement={() => onUpdateAmount(item, true)}
            onDecrement={() => onUpdateAmount(item, false)}
            minQuantity={isWeight ? 500 : 1}
            displayValue={isWeight ? weight(item.weightGrams) : undefined}
          />
          <Text variant="bodyStrong" color={palette.text} style={styles.lineTotal}>
            {money(lineTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: space.md,
    gap: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.borderStrong,
  },
  imageContainer: {
    width: 84,
    height: 84,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: palette.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: space.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
  },
  titleBlock: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  lineTotal: {
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
});
