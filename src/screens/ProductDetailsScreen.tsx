import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../services/api/catalogService';
import { useCart } from '../app/CartContext';

const ProductDetailsScreen = ({ route }: any) => {
  const { productId } = route.params;
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => CatalogService.getProductById(productId),
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>Product Image</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product?.name}</Text>
          <Text style={styles.productPrice}>${product?.price.toFixed(2)}</Text>
          <Text style={styles.productDesc}>{product?.description}</Text>

          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Availability:</Text>
            <Text
              style={[
                styles.stockValue,
                { color: product?.stockQuantity > 0 ? '#34C759' : '#FF3B30' },
              ]}
            >
              {product?.stockQuantity > 0
                ? 'In Stock'
                : t('store.out_of_stock')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addButton,
            product?.stockQuantity <= 0 && styles.disabledButton,
          ]}
          onPress={() => addToCart({ ...product, quantity: 1 })}
          disabled={product?.stockQuantity <= 0}
        >
          <Text style={styles.addButtonText}>{t('store.add_to_cart')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: { marginRight: 15 },
  backButtonText: { fontSize: 24, color: '#007AFF' },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1 },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: { color: '#8E8E93', fontSize: 18 },
  infoSection: { padding: 20 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
  },
  productDesc: {
    fontSize: 16,
    color: '#3C3C43',
    marginTop: 15,
    lineHeight: 24,
  },
  stockInfo: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  stockLabel: { fontSize: 16, color: '#8E8E93', marginRight: 8 },
  stockValue: { fontSize: 16, fontWeight: '600' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#C7C7CC' },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ProductDetailsScreen;
