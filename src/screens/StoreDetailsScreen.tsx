import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Star, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { CatalogService } from '../services/api/catalogService';
import { VendorService } from '../services/api/vendorService';
import { useCart } from '../app/CartContext';
import { theme } from '../theme';
import { getBaseURL } from '../services/api/apiClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import { MeasurementType } from '@city-market/shared';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

// 1. Separate Product Card Component
const ProductCard = React.memo(({ item, navigation, onAdd }: any) => (
  <View style={styles.productCardWrapper}>
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate('ProductDetails', { productId: item.id })
      }
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        <ImageWithPlaceholder
          uri={item.imageUrl ? `${getBaseURL()}${item.imageUrl}` : null}
          style={styles.productImage}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAdd(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productDesc} numberOfLines={1}>
          {item.description}
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
));

// 2. Separate Row Component
const ProductRow = React.memo(({ items, navigation, onAdd }: any) => (
  <View style={styles.row}>
    {items.map((product: any) => (
      <ProductCard
        key={product.id}
        item={product}
        navigation={navigation}
        onAdd={onAdd}
      />
    ))}
    {items.length === 1 && <View style={styles.productCardWrapper} />}
  </View>
));

// 3. Separate Store Header Component
const StoreHeader = React.memo(({ t, vendor, navigation, insets }: any) => (
  <View>
    <View style={{ height: 200 + insets.top }}>
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft color={theme.colors.white} size={24} />
      </TouchableOpacity>
    </View>

    <View style={styles.infoCard}>
      <View style={styles.titleRow}>
        <Text style={styles.shopName}>{vendor?.shopName}</Text>
        <View style={styles.ratingBadge}>
          <Star
            size={12}
            color={theme.colors.primary}
            fill={theme.colors.accent}
          />
          <Text style={styles.ratingValue}>
            {vendor?.averageRating?.toFixed(1) || '0.0'}
          </Text>
        </View>
      </View>

      <Text style={styles.shopDescription}>{vendor?.shopDescription}</Text>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={14} color={theme.colors.accent} />
          <Text style={styles.metaText} numberOfLines={1}>
            {vendor?.address?.split(',')[0]}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.metaItem}
          onPress={() =>
            navigation.navigate('VendorReviews', { vendorId: vendor?.id })
          }
        >
          <Star size={14} color={theme.colors.accent} />
          <Text style={styles.metaText}>
            {vendor?.totalRatings || 0} {t('store.reviews')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
));

const StoreDetailsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => VendorService.getVendorById(vendorId),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', vendorId],
    queryFn: () => CatalogService.getVendorProductsByVendor(vendorId),
  });

  const { data: vendorCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['vendor-categories', vendorId],
    queryFn: () => CatalogService.getVendorCategories(vendorId),
  });

  const products = useMemo(() => productsData?.data || [], [productsData]);

  const sections = useMemo(() => {
    if (!products || !vendorCategories) return [];

    return vendorCategories
      .map(cat => {
        const catProducts = products.filter(p => p.vendorCategoryId === cat.id);
        const chunkedProducts = [];
        for (let i = 0; i < catProducts.length; i += 2) {
          chunkedProducts.push(catProducts.slice(i, i + 2));
        }
        return {
          title: cat.name,
          id: cat.id,
          data: chunkedProducts,
        };
      })
      .filter(section => section.data.length > 0);
  }, [products, vendorCategories]);

  const handleAddToCart = useCallback(
    (product: any) => {
      const item: any = {
        ...product,
        vendorId,
        measurementType: product.measurementType,
      };

      if (product.measurementType === MeasurementType.WEIGHT) {
        item.weightGrams = 500;
        item.weight = 0.5;
      } else {
        item.quantity = 1;
      }

      addToCart(item);
      Toast.show({
        type: 'success',
        text1: t('store.added_to_cart'),
        position: 'bottom',
      });
    },
    [vendorId, addToCart, t],
  );

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
      <View style={[styles.headerImageContainer, { height: 240 + insets.top }]}>
        <ImageWithPlaceholder
          uri={
            vendor?.storeImage ? `${getBaseURL()}${vendor.storeImage}` : null
          }
          style={[StyleSheet.absoluteFill, { resizeMode: 'cover' }] as any}
        />
        <View style={styles.imageOverlay} />
      </View>

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
          <StoreHeader
            t={t}
            vendor={vendor}
            navigation={navigation}
            insets={insets}
          />
        }
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: 0 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('common.no_results')}</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    borderRadius: 24,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primary,
    flex: 1,
    letterSpacing: -0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(228, 166, 48, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingValue: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  shopDescription: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  listContent: {
    paddingBottom: 40,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  productCardWrapper: {
    width: CARD_WIDTH,
  },
  productCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    height: 230,
  },
  imageWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '600',
    marginTop: -2,
  },
  productInfo: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  unitText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginLeft: 2,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
});

export default StoreDetailsScreen;
