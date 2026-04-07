import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Keyboard } from 'react-native';
import { CatalogService } from '../services/api/catalogService';

export const useSearch = (categoryId?: string) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const {
    data: productsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['search', query, categoryId],
    queryFn: () =>
      CatalogService.searchVendorProducts({
        globalCategoryId: categoryId || undefined,
        search: query.length > 2 ? query : undefined,
      }),
    enabled: !!categoryId || query.length > 2,
  });

  const products = useMemo(() => productsData?.data, [productsData]);

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
  };
};
