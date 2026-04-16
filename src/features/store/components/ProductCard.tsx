import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../theme';
import { getBaseURL } from '../../../services/api/apiClient';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';
import { MeasurementType } from '@city-market/shared';

interface ProductCardProps {
  item: any;
  onPress: (id: string) => void;
  onAdd: (item: any) => void;
}

export const ProductCard = React.memo(
  ({ item, onPress, onAdd }: ProductCardProps) => {
    const isAvailable = item.isAvailable;

    return (
      <View style={[styles.productCardWrapper, !isAvailable && styles.disabled]}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => onPress(item.id)}
          activeOpacity={0.9}
          disabled={!isAvailable}
        >
          <View style={styles.imageWrapper}>
            <ImageWithPlaceholder
              uri={item.imageUrl ? `${getBaseURL()}${item.imageUrl}` : null}
              style={styles.productImage}
            />
            {!isAvailable && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.addButton, !isAvailable && styles.disabledButton]}
              onPress={() => isAvailable && onAdd(item)}
              activeOpacity={0.8}
              disabled={!isAvailable}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.productDesc} numberOfLines={1}>
              {item.description?.slice(0, 25)}
              {'...'}
            </Text>
            <View style={styles.priceInfo}>
              {item.measurementType === MeasurementType.WEIGHT && (
                <Text style={styles.unitText}>/kg</Text>
              )}
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  productCardWrapper: {
    flex: 1,
    padding: theme.spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  outOfStockText: {
    color: theme.colors.error,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  disabledButton: {
    backgroundColor: theme.colors.textMuted,
  },
  productCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    ...theme.shadows.soft,
    overflow: 'hidden',
  },
  imageWrapper: {
    height: 120,
    width: '100%',
    backgroundColor: theme.colors.background,
  },
  productImage: {
    height: '100%',
    width: '100%',
  },
  addButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -2,
  },
  productInfo: {
    padding: theme.spacing.sm,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  unitText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginRight: 2,
  },
});
