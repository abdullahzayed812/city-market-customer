import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../../../services/api/catalogService';
import { VendorService } from '../../../services/api/vendorService';

export const useHomeData = () => {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['global-categories'],
    queryFn: CatalogService.getGlobalCategories,
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: VendorService.getVendors,
  });

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

  return {
    categories,
    vendors,
    groupedVendors,
    isLoading: categoriesLoading || vendorsLoading,
  };
};
