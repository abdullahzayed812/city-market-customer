import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { ChevronLeft, Package } from 'lucide-react-native';
import { theme } from '../theme';
import { useStoreDetails } from '../features/store/hooks/useStoreDetails';
import { useCategoryProducts } from '../features/store/hooks/useCategoryProducts';
import { StoreHeader } from '../features/store/components/StoreHeader';
import { CategoryTabs } from '../features/store/components/CategoryTabs';
import { ProductRow } from '../features/store/components/ProductRow';
import { useCart } from '../app/CartContext';
import FloatingCartBar from '../components/common/FloatingCartBar';

const StoreDetailsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const {
    t,
    vendor,
    vendorLoading,
    categoriesLoading,
    vendorCategories,
    insets,
  } = useStoreDetails(vendorId);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const {
    rows,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleAddToCart,
  } = useCategoryProducts(vendorId, selectedCategoryId);

  const { itemCount, total } = useCart();

  const handleCartPress = useCallback(() => {
    navigation.navigate('Main', { screen: 'Cart' });
  }, [navigation]);

  const renderRow = useCallback(
    ({ item }: { item: any[] }) => (
      <ProductRow items={item} navigation={navigation} onAdd={handleAddToCart} />
    ),
    [navigation, handleAddToCart],
  );

  if (vendorLoading || categoriesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ChevronLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{vendor?.shopName}</Text>
        <View style={styles.headerRight} />
      </View>

      {productsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(_, index) => String(index)}
          renderItem={renderRow}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View>
              <StoreHeader t={t} vendor={vendor} navigation={navigation} />
              {vendorCategories.length > 0 && (
                <CategoryTabs
                  t={t}
                  categories={vendorCategories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />
              )}
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Package size={36} color={theme.colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyText}>{t('store.no_products')}</Text>
            </View>
          }
          contentContainerStyle={[
            styles.listContent,
            itemCount > 0 && styles.listContentWithCart,
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingCartBar itemCount={itemCount} total={total} onPress={handleCartPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  listContentWithCart: {
    paddingBottom: 100,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default StoreDetailsScreen;
