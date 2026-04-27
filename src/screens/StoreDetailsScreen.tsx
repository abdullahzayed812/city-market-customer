import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { theme } from '../theme';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import { useStoreDetails } from '../features/store/hooks/useStoreDetails';
import { StoreHeader } from '../features/store/components/StoreHeader';
import { ProductRow } from '../features/store/components/ProductRow';
import { useCart } from '../app/CartContext';
import { getApiBaseURL } from '../utils/serverConfig';

const StoreDetailsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const {
    t,
    vendor,
    vendorLoading,
    productsLoading,
    categoriesLoading,
    sections,
    insets,
    handleAddToCart,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStoreDetails(vendorId);

  const { itemCount, total } = useCart();

  const handleCartPress = useCallback(() => {
    navigation.navigate('Main', { screen: 'Cart' });
  }, [navigation]);

  const renderRow = useCallback(
    ({ item }: { item: any[] }) => (
      <ProductRow
        items={item}
        navigation={navigation}
        onAdd={handleAddToCart}
      />
    ),
    [navigation, handleAddToCart],
  );

  if (vendorLoading || productsLoading || categoriesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item[0].id + index}
        renderItem={renderRow}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        ListHeaderComponent={
          <View>
            <View
              style={[
                styles.headerImageContainer,
                { height: 240 + insets.top },
              ]}
            >
              <ImageWithPlaceholder
                uri={
                  vendor?.storeImage
                    ? `${getApiBaseURL()}${vendor.storeImage}`
                    : null
                }
                style={
                  [StyleSheet.absoluteFill, { resizeMode: 'cover' }] as any
                }
              />
              <View style={styles.imageOverlay} />
            </View>
            <StoreHeader
              t={t}
              vendor={vendor}
              navigation={navigation}
              insets={insets}
            />
          </View>
        }
        stickySectionHeadersEnabled={true}
        contentContainerStyle={[
          styles.listContent,
          itemCount > 0 && styles.listContentWithCart,
        ]}
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: 0 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('store.no_products')}</Text>
          </View>
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ marginVertical: 20 }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
      />

      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={handleCartPress}
          activeOpacity={0.9}
        >
          <View style={styles.floatingCartInner}>
            <View style={styles.floatingCartBadge}>
              <Text style={styles.floatingCartBadgeText}>
                {itemCount > 99 ? '99+' : itemCount}
              </Text>
            </View>
            <ShoppingCart size={22} color={theme.colors.white} />
            <Text style={styles.floatingCartTotal}>${total.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
      )}
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
  headerImageContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  listContent: {
    paddingBottom: 40,
  },
  listContentWithCart: {
    paddingBottom: 100,
  },
  sectionHeader: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    ...theme.shadows.medium,
  },
  floatingCartInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  floatingCartBadge: {
    backgroundColor: theme.colors.accent,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  floatingCartBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingCartTotal: {
    flex: 1,
    textAlign: 'right',
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StoreDetailsScreen;
