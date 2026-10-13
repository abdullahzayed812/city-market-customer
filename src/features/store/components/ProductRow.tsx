import React from 'react';
import { View, StyleSheet } from 'react-native';
import { space } from '@city-market/mobile-ui';
import { ProductCard } from './ProductCard';

interface ProductRowProps {
  items: any[];
  navigation: any;
  onAdd: (product: any) => void;
  cartAmounts: Record<string, number>;
}

export const ProductRow = React.memo(({ items, navigation, onAdd, cartAmounts }: ProductRowProps) => (
  <View style={styles.row}>
    {items.map((product: any) => (
      <ProductCard
        key={product.id}
        item={product}
        onPress={id => navigation.navigate('ProductDetails', { productId: id })}
        onAdd={onAdd}
        cartAmount={cartAmounts[product.id]}
      />
    ))}
    {items.length === 1 && <View style={styles.spacer} />}
  </View>
));

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
    marginBottom: space.md,
  },
  spacer: {
    flex: 1,
  },
});
