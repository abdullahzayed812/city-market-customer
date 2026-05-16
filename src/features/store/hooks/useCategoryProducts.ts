import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { CatalogService } from '../../../services/api/catalogService';
import { useCart } from '../../../app/CartContext';
import { MeasurementType } from '@city-market/shared';

const PAGE_SIZE = 20;

export const useCategoryProducts = (vendorId: string, categoryId: string) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['category-products', vendorId, categoryId],
    queryFn: ({ pageParam = 1 }) =>
      CatalogService.getVendorProductsByVendor(vendorId, pageParam as number, PAGE_SIZE, categoryId),
    getNextPageParam: lastPage => {
      if (!lastPage || typeof lastPage.total !== 'number') return undefined;
      const { page, limit, total } = lastPage;
      if (page * limit < total) return page + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const rows = useMemo(() => {
    const products = data?.pages.flatMap(page => page?.data || []) || [];
    const chunks: any[][] = [];
    for (let i = 0; i < products.length; i += 2) {
      chunks.push(products.slice(i, i + 2));
    }
    return chunks;
  }, [data]);

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
    },
    [vendorId, addToCart, t],
  );

  return {
    t,
    rows,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleAddToCart,
  };
};
