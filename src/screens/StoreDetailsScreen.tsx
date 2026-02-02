import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../services/api/catalogService';
import { VendorService } from '../services/api/vendorService';
import { useCart } from '../app/CartContext';

const StoreDetailsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const { addToCart } = useCart();

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => VendorService.getVendorById(vendorId),
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', vendorId],
    queryFn: () => CatalogService.getProductsByVendor(vendorId),
  });

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ProductDetails', { productId: item.id })
      }
    >
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addToCart({ ...item, quantity: 1, vendorId })}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (vendorLoading || productsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{vendor?.shopName}</Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.vendorHeader}>
            <Text style={styles.vendorDesc}>{vendor?.shopDescription}</Text>
            <Text style={styles.vendorAddress}>{vendor?.address}</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products available</Text>
        }
      />
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
  vendorHeader: { padding: 20, backgroundColor: '#F2F2F7' },
  vendorDesc: { fontSize: 16, color: '#3C3C43' },
  vendorAddress: { fontSize: 14, color: '#8E8E93', marginTop: 5 },
  listContent: { padding: 15 },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  productInfo: { flex: 1, marginRight: 15 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productDesc: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 50 },
});

export default StoreDetailsScreen;
