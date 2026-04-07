import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { UserService } from '../../../services/api/userService';
import { OrderService } from '../../../services/api/orderService';
import { useCart } from '../../../app/CartContext';
import { MeasurementType } from '@city-market/shared';

export const useCheckout = (navigation: any) => {
  const { t } = useTranslation();
  const { items, total, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: UserService.getAddresses,
  });

  const orderMutation = useMutation({
    mutationFn: OrderService.createOrder,
    onSuccess: () => {
      clearCart();
      Toast.show({
        type: 'success',
        text1: t('checkout.success'),
        position: 'top',
      });
      navigation.replace('Main', { screen: 'Orders' });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2:
          error?.response?.data?.message || t('checkout.failed_to_place_order'),
        position: 'top',
      });
    },
  });

  const handleConfirmOrder = useCallback(() => {
    if (!selectedAddress) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('checkout.select_address'),
        position: 'top',
      });
      return;
    }

    const address = addresses?.find((a: any) => a.id === selectedAddress);
    if (!address) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('checkout.address_not_found'),
        position: 'top',
      });
      return;
    }

    const orderData = {
      customerId: '', // Will be added by service or backend from token
      items: items.map(item => ({
        vendorProductId: item.id,
        quantity:
          item.measurementType === MeasurementType.UNIT
            ? item.quantity
            : undefined,
        weightGrams:
          item.measurementType === MeasurementType.WEIGHT
            ? item.weightGrams
            : undefined,
      })),
      deliveryAddress: address.address,
      deliveryLatitude: address.latitude,
      deliveryLongitude: address.longitude,
    };

    orderMutation.mutate(orderData);
  }, [selectedAddress, addresses, items, orderMutation, t]);

  const deliveryFee = 15.0;
  const grandTotal = useMemo(() => total + deliveryFee, [total, deliveryFee]);

  return {
    t,
    items,
    total,
    selectedAddress,
    setSelectedAddress,
    addresses,
    addressesLoading,
    orderMutation,
    handleConfirmOrder,
    deliveryFee,
    grandTotal,
  };
};
