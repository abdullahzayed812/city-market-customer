import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ProductCard } from './ProductCard';
import { theme } from '../../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

interface ProductRowProps {
  items: any[];
  navigation: any;
  onAdd: (product: any) => void;
}

export const ProductRow = React.memo(({ items, navigation, onAdd }: ProductRowProps) => (
  <View style={styles.row}>
    {items.map((product: any) => (
      <ProductCard
        key={product.id}
        item={product}
        onPress={(id) => navigation.navigate('ProductDetails', { productId: id })}
        onAdd={onAdd}
      />
    ))}
    {items.length === 1 && <View style={styles.productCardWrapper} />}
  </View>
));

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  productCardWrapper: {
    width: CARD_WIDTH,
  },
});
