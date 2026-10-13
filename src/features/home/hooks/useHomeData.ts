import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../../../services/api/catalogService';
import { VendorService } from '../../../services/api/vendorService';

export const useHomeData = () => {
  const categoriesQuery = useQuery({
    queryKey: ['global-categories'],
    queryFn: CatalogService.getGlobalCategories,
  });

  const vendorsQuery = useQuery({
    queryKey: ['vendors'],
    queryFn: VendorService.getVendors,
  });

  const vendors = vendorsQuery.data;

  const groupedVendors = useMemo(() => {
    if (!vendors) return [];

    const groups: Record<string, any[]> = {};
    vendors.forEach((v: any) => {
      const type = v.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(v);
    });
    return Object.entries(groups).map(([type, items]) => ({ type, items }));
  }, [vendors]);

  const { refetch: refetchCategories } = categoriesQuery;
  const { refetch: refetchVendors } = vendorsQuery;
  const refetch = useCallback(() => {
    refetchCategories();
    refetchVendors();
  }, [refetchCategories, refetchVendors]);

  return {
    categories: categoriesQuery.data,
    vendors,
    groupedVendors,
    isLoading: categoriesQuery.isLoading || vendorsQuery.isLoading,
    // Vendors are the core of the screen; a categories failure alone just hides that row.
    error: vendorsQuery.error,
    refetch,
    isRefetching: categoriesQuery.isRefetching || vendorsQuery.isRefetching,
  };
};
