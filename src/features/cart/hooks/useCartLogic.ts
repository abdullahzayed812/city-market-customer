import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../../app/CartContext';
import { MeasurementType } from '@city-market/shared';

export const useCartLogic = () => {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, updateWeight, total } = useCart();

  const handleUpdateAmount = useCallback(
    (item: any, increment: boolean) => {
      if (item.measurementType === MeasurementType.WEIGHT) {
        const currentWeight = item.weightGrams || 0;
        const newWeight = increment ? currentWeight + 500 : currentWeight - 500;
        if (newWeight > 0) {
          updateWeight(item.id, newWeight);
        }
      } else {
        const currentQty = item.quantity || 0;
        const newQty = increment ? currentQty + 1 : currentQty - 1;
        if (newQty > 0) {
          updateQuantity(item.id, newQty);
        }
      }
    },
    [updateWeight, updateQuantity],
  );

  return {
    items,
    total,
    removeFromCart,
    handleUpdateAmount,
    t,
  };
};
