import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { theme } from '../../../theme';
import { getBaseURL } from '../../../services/api/apiClient';
import QuantitySelector from '../../../components/common/QuantitySelector';
import { MeasurementType } from '@city-market/shared';

interface CartItemProps {
  item: any;
  onRemove: (id: string) => void;
  onUpdateAmount: (item: any, increment: boolean) => void;
  t: any;
}

export const CartItem = React.memo(({ item, onRemove, onUpdateAmount, t }: CartItemProps) => (
  <View style={styles.cartItem}>
    <Image
      source={{
        uri: item.imageUrl
          ? `${getBaseURL()}${item.imageUrl}`
          : 'https://via.placeholder.com/100',
      }}
      style={styles.itemImage}
    />
    <View style={styles.itemDetails}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          style={styles.removeButton}
        >
          <Trash2 size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.priceInfo}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          {item.measurementType === MeasurementType.WEIGHT && (
            <Text style={styles.unitText}>/kg</Text>
          )}
        </View>
        <QuantitySelector
          quantity={
            item.measurementType === MeasurementType.WEIGHT
              ? item.weightGrams
              : item.quantity
          }
          onIncrement={() => onUpdateAmount(item, true)}
          onDecrement={() => onUpdateAmount(item, false)}
          minQuantity={
            item.measurementType === MeasurementType.WEIGHT ? 500 : 1
          }
          displayValue={
            item.measurementType === MeasurementType.WEIGHT
              ? `${(item.weightGrams / 1000).toFixed(1)} kg`
              : undefined
          }
        />
      </View>
    </View>
  </View>
));

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
  },
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  itemPrice: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
  },
  unitText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    marginLeft: 2,
  },
});
