import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '../../../services/api/catalogService';
import { useCart } from '../../../app/CartContext';
import { getBaseURL } from '../../../services/api/apiClient';
import Toast from 'react-native-toast-message';
import { MeasurementType } from '@city-market/shared';

export const useProductDetails = (productId: string, navigation: any) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const [amount, setAmount] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => CatalogService.getVendorProductById(productId),
  });

  useEffect(() => {
    if (product) {
      if (product.measurementType === MeasurementType.WEIGHT) {
        setAmount(500); // Default 0.5kg
      } else {
        setAmount(1);
      }
    }
  }, [product]);

  const isWeight = product?.measurementType === MeasurementType.WEIGHT;

  const handleIncrement = useCallback(() => {
    if (isWeight) {
      setAmount(prev => prev + 500);
    } else {
      setAmount(prev => prev + 1);
    }
  }, [isWeight]);

  const handleDecrement = useCallback(() => {
    if (isWeight) {
      setAmount(prev => (prev > 500 ? prev - 500 : 500));
    } else {
      setAmount(prev => (prev > 1 ? prev - 1 : 1));
    }
  }, [isWeight]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const cartItem: any = {
      ...product,
      measurementType: product.measurementType,
    };

    if (isWeight) {
      cartItem.weightGrams = amount;
      cartItem.weight = amount / 1000;
    } else {
      cartItem.quantity = amount;
    }

    addToCart(cartItem);
    Toast.show({
      type: 'success',
      text1: t('store.added_to_cart'),
      position: 'bottom',
    });
    navigation.goBack();
  }, [product, isWeight, amount, addToCart, t, navigation]);

  const imageUrl = useMemo(() => product?.imageUrl
    ? `${getBaseURL()}${product.imageUrl}`
    : 'https://via.placeholder.com/400', [product?.imageUrl]);

  const stockAvailable = useMemo(() => {
      if (!product) return false;
      return isWeight ? ((product.stockWeightGrams || 0) > 0) : ((product.stockQuantity || 0) > 0);
  }, [isWeight, product]);

  const maxAmount = useMemo(() => {
      if (!product) return 0;
      return isWeight ? (product.stockWeightGrams || 0) : (product.stockQuantity || 0);
  }, [isWeight, product]);

  return {
    product,
    isLoading,
    amount,
    isWeight,
    handleIncrement,
    handleDecrement,
    handleAddToCart,
    imageUrl,
    stockAvailable,
    maxAmount,
    t,
  };
};
