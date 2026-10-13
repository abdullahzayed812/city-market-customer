import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogService } from '../../../services/api/catalogService';
import { VendorService } from '../../../services/api/vendorService';

export const useStoreDetails = (vendorId: string) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { data: vendor, isLoading: vendorLoading, error: vendorError, refetch: refetchVendor } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => VendorService.getVendorById(vendorId),
  });

  const { data: vendorCategories, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
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
    vendorError,
    refetchVendor,
    refetchCategories,
  };
};
