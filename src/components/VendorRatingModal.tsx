import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { RatingService } from '../services/api/ratingService';
import { RatingModal } from './RatingModal';

interface VendorRatingModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  vendorName: string;
  vendorId: string;
}

export const VendorRatingModal: React.FC<VendorRatingModalProps> = ({ visible, onClose, orderId, vendorName, vendorId }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return (
    <RatingModal
      visible={visible}
      onClose={onClose}
      title={t('rating.rate_vendor_title')}
      subjectName={vendorName}
      submit={(stars, comment) => RatingService.rateVendor(orderId, vendorId, stars, comment)}
      onRated={() => {
        // Invalidate relevant queries so the UI updates
        queryClient.invalidateQueries({ queryKey: ['vendor-rating-summary', vendorId] });
        queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
        queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
        // Swap this vendor's "rate" button for the stars just given
        queryClient.invalidateQueries({ queryKey: ['order-vendor-ratings', orderId] });
      }}
    />
  );
};
