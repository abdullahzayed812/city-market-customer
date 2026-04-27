import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { CatalogService } from '../../../services/api/catalogService';
import { VendorService } from '../../../services/api/vendorService';
import { useCart } from '../../../app/CartContext';
import { MeasurementType } from '@city-market/shared';

export const useStoreDetails = (vendorId: string) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => VendorService.getVendorById(vendorId),
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', vendorId],
    queryFn: ({ pageParam = 1 }) =>
      CatalogService.getVendorProductsByVendor(vendorId, pageParam, 20),
    getNextPageParam: lastPage => {
      if (!lastPage || typeof lastPage.total !== 'number') return undefined;
      const { page, limit, total } = lastPage;
      if (page * limit < total) return page + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const { data: vendorCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['vendor-categories', vendorId],
    queryFn: () => CatalogService.getVendorCategories(vendorId),
  });

  const products = useMemo(
    () => productsData?.pages.flatMap(page => page?.data || []) || [],
    [productsData],
  );

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
      if (!product.isAvailable) {
        Toast.show({
          type: 'error',
          text1: t('store.product_unavailable'),
          position: 'bottom',
        });
        return;
      }

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
      // Toast.show({
      //   type: 'success',
      //   text1: t('store.added_to_cart'),
      //   position: 'bottom',
      // });
    },
    [vendorId, addToCart, t],
  );

  return {
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
  };
};
