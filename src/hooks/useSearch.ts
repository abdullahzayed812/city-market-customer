import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Keyboard } from 'react-native';
import { CatalogService } from '../services/api/catalogService';
import { VendorService } from '../services/api/vendorService';

export const useSearch = (categoryId?: string) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  // Requests follow the typed text after a short pause, not every keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const {
    data: productsData,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['search', debouncedQuery, categoryId],
    queryFn: ({ pageParam = 1 }) =>
      CatalogService.searchVendorProducts({
        globalCategoryId: categoryId || undefined,
        search: debouncedQuery.length > 2 ? debouncedQuery : undefined,
        page: pageParam,
        limit: 20,
      } as any),
    getNextPageParam: (lastPage) => {
      if (!lastPage || typeof lastPage.total !== 'number') return undefined;
      const { page, limit, total } = lastPage;
      if (page * limit < total) return page + 1;
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!categoryId || debouncedQuery.length > 2,
  });

  const productsRaw = useMemo(() => productsData?.pages.flatMap(page => page?.data || []) || [], [productsData]);

  const vendorIds = useMemo(() => {
    const ids = new Set(productsRaw.map((p: any) => p.vendorId));
    return Array.from(ids);
  }, [productsRaw]);

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors', vendorIds],
    queryFn: () => VendorService.getVendorsByIds(vendorIds),
    enabled: vendorIds.length > 0,
  });

  const products = useMemo(() => {
    if (!vendorsData) return productsRaw;
    const vendorMap = new Map(vendorsData.map(v => [v.id, v.shopName]));
    return productsRaw.map((p: any) => ({
      ...p,
      vendorName: vendorMap.get(p.vendorId) || t('common.vendor'),
    }));
  }, [productsRaw, vendorsData, t]);

  const { data: categories } = useQuery({
    queryKey: ['global-categories'],
    queryFn: CatalogService.getGlobalCategories,
    enabled: !!categoryId,
  });

  const selectedCategory = useMemo(
    () => categories?.find((c: any) => c.id === categoryId),
    [categories, categoryId],
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    Keyboard.dismiss();
  }, []);

  return {
    t,
    query,
    setQuery,
    products,
    isLoading,
    refetch,
    selectedCategory,
    clearSearch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    isFetching,
    // True while the user is still typing (results are about to change).
    isTyping: query.trim() !== debouncedQuery,
    submitSearch: () => setDebouncedQuery(query.trim()),
  };
};
