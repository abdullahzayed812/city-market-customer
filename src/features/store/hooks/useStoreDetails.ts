import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogService } from '../../../services/api/catalogService';
import { VendorService } from '../../../services/api/vendorService';

export const useStoreDetails = (vendorId: string) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => VendorService.getVendorById(vendorId),
  });

  const { data: vendorCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['vendor-categories', vendorId],
    queryFn: () => CatalogService.getVendorCategories(vendorId),
  });

  return {
    t,
    vendor,
    vendorLoading,
    categoriesLoading,
    vendorCategories: vendorCategories || [],
    insets,
  };
};
