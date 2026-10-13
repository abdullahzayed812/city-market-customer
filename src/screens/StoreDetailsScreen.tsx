import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { ScreenHeader, EmptyState, LoadingState, palette, space } from '@city-market/mobile-ui';
import { Package } from 'lucide-react-native';
import { MeasurementType } from '@city-market/shared';
import { useStoreDetails } from '../features/store/hooks/useStoreDetails';
import { useCategoryProducts } from '../features/store/hooks/useCategoryProducts';
import { StoreHeader } from '../features/store/components/StoreHeader';
import { CategoryTabs } from '../features/store/components/CategoryTabs';
import { ProductRow } from '../features/store/components/ProductRow';
import { useCart } from '../app/CartContext';
import FloatingCartBar from '../components/common/FloatingCartBar';
import QueryError from '../components/common/QueryError';

const StoreDetailsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const {
    t,
    vendor,
    vendorLoading,
    categoriesLoading,
    vendorCategories,
    insets,
    vendorError,
    refetchVendor,
    refetchCategories,
  } = useStoreDetails(vendorId);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const {
    rows,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleAddToCart,
    error: productsError,
    refetch: refetchProducts,
    isRefetching,
  } = useCategoryProducts(vendorId, selectedCategoryId);

  const { items, itemCount, total } = useCart();

  // Amount of each product already in the cart, shown on the product cards.
  const cartAmounts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(i => {
      map[i.id] = i.measurementType === MeasurementType.WEIGHT ? i.weightGrams || 0 : i.quantity || 0;
    });
    return map;
  }, [items]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('Main', { screen: 'Cart' });
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refetchVendor();
    refetchCategories();
    refetchProducts();
  }, [refetchVendor, refetchCategories, refetchProducts]);

  const renderRow = useCallback(
    ({ item }: { item: any[] }) => (
      <ProductRow items={item} navigation={navigation} onAdd={handleAddToCart} cartAmounts={cartAmounts} />
    ),
    [navigation, handleAddToCart, cartAmounts],
  );

  const header = (
    <ScreenHeader
      title={vendor?.shopName ?? ''}
      onBack={() => navigation.goBack()}
      backLabel={t('common.back')}
      style={{ paddingTop: insets.top + space.xs }}
    />
  );

  if (vendorLoading || categoriesLoading) {
    return (
      <View style={styles.container}>
        {header}
        <LoadingState />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.container}>
        {header}
        <QueryError error={vendorError} onRetry={refetchVendor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {header}
      <FlatList
        data={productsLoading ? [] : rows}
        keyExtractor={row => row[0]?.id}
        renderItem={renderRow}
        onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={palette.primary} colors={[palette.primary]} />
        }
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
            <ActivityIndicator style={styles.footerLoader} color={palette.primary} />
          ) : null
        }
        ListEmptyComponent={
          productsLoading ? (
            <LoadingState style={styles.inlineState} />
          ) : productsError ? (
            <QueryError error={productsError} onRetry={refetchProducts} compact />
          ) : (
            <EmptyState icon={Package} title={t('store.no_products')} compact />
          )
        }
        contentContainerStyle={[
          styles.listContent,
          itemCount > 0 && styles.listContentWithCart,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <FloatingCartBar itemCount={itemCount} total={total} onPress={handleCartPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    paddingBottom: space.huge,
  },
  listContentWithCart: {
    paddingBottom: 112,
  },
  footerLoader: {
    paddingVertical: space.xl,
  },
  inlineState: {
    paddingVertical: space.huge,
  },
});

export default StoreDetailsScreen;
