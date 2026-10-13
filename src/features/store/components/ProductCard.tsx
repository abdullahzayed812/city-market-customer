import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText as Text, palette, radii, space, elevation } from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { Plus, Check } from 'lucide-react-native';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';
import { MeasurementType } from '@city-market/shared';
import { useFormat } from '../../../hooks/useFormat';

interface ProductCardProps {
  item: any;
  onPress: (id: string) => void;
  onAdd: (item: any) => void;
  /** Units (or grams for weighed items) of this product already in the cart. */
  cartAmount?: number;
}

export const ProductCard = React.memo(({ item, onPress, onAdd, cartAmount = 0 }: ProductCardProps) => {
  const { t } = useTranslation();
  const { money } = useFormat();
  const isAvailable = item.isAvailable;
  const isWeight = item.measurementType === MeasurementType.WEIGHT;
  const inCart = cartAmount > 0;

  const handleAdd = useCallback(() => {
    if (isAvailable) onAdd(item);
  }, [isAvailable, item, onAdd]);

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${money(item.price)}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrapper}>
        <ImageWithPlaceholder uri={item.imageUrl || null} style={styles.image} />
        {!isAvailable && (
          <View style={styles.unavailableVeil}>
            <View style={styles.unavailableTag}>
              <Text variant="micro" color={palette.textSecondary}>{t('store.out_of_stock')}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text variant="label" color={palette.text} numberOfLines={2} style={styles.name}>
          {item.name}
        </Text>
        <View style={styles.footer}>
          <View style={styles.priceBlock}>
            <Text variant="bodyStrong" color={isAvailable ? palette.text : palette.textMuted} numberOfLines={1}>
              {money(item.price)}
            </Text>
            {isWeight && (
              <Text variant="micro" color={palette.textMuted}>{t('common.per_kg')}</Text>
            )}
          </View>
          {isAvailable ? (
            <Pressable
              onPress={handleAdd}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('store.add_item_a11y', { name: item.name })}
              style={({ pressed }) => [styles.addButton, inCart && styles.addButtonInCart, pressed && styles.addPressed]}
            >
              {inCart && !isWeight ? (
                <Text variant="label" color={palette.white} maxFontSizeMultiplier={1}>
                  {cartAmount > 99 ? '99+' : cartAmount}
                </Text>
              ) : inCart ? (
                <Check size={18} color={palette.white} strokeWidth={3} />
              ) : (
                <Plus size={18} color={palette.white} strokeWidth={3} />
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...elevation.card,
  },
  pressed: {
    opacity: 0.9,
  },
  imageWrapper: {
    aspectRatio: 1,
    width: '100%',
    backgroundColor: palette.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  unavailableVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
    justifyContent: 'flex-end',
    padding: space.sm,
  },
  unavailableTag: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.borderStrong,
  },
  info: {
    padding: space.md,
    paddingTop: space.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    // Two lines reserved so prices align across a row.
    minHeight: 40,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.xs,
    marginTop: space.xs,
  },
  priceBlock: {
    flexShrink: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonInCart: {
    backgroundColor: palette.primaryPressed,
  },
  addPressed: {
    transform: [{ scale: 0.92 }],
  },
});
