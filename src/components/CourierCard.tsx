import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Bike, Phone, Search, CheckCircle2, Star } from 'lucide-react-native';
import { DeliveryStatus } from '@city-market/shared';
import { DeliveryService, OrderCourier } from '../services/api/deliveryService';
import { RatingModal } from './RatingModal';
import { theme } from '../theme';

const STATUS_KEY: Partial<Record<DeliveryStatus, string>> = {
  [DeliveryStatus.PENDING]: 'courier.finding',
  [DeliveryStatus.ACCEPTED]: 'courier.finding',
  [DeliveryStatus.ASSIGNED]: 'courier.heading_to_store',
  [DeliveryStatus.PICKED_UP]: 'courier.picked_up',
  [DeliveryStatus.ON_THE_WAY]: 'courier.on_the_way',
  [DeliveryStatus.DELIVERED]: 'courier.delivered',
};

interface Props {
  orderId: string;
  delivery: OrderCourier;
  // "1 of 2" when the order was split across far-apart stores
  position?: { index: number; total: number };
}

export const CourierCard: React.FC<Props> = ({ orderId, delivery, position }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [ratingOpen, setRatingOpen] = useState(false);
  const { courier, status, officeName, myRating, canRate } = delivery;
  const delivered = status === DeliveryStatus.DELIVERED;
  const statusText = t(STATUS_KEY[status] ?? 'courier.finding', { count: delivery.pickupCount });
  // Office deliveries are rated for the courier and their office
  const ratedName = courier ? (officeName ? `${courier.name} · ${officeName}` : courier.name) : '';

  return (
    <View style={styles.card}>
      {position && position.total > 1 && (
        <Text style={styles.position}>{t('courier.delivery_n_of_m', { n: position.index + 1, m: position.total })}</Text>
      )}

      {courier ? (
        <View style={styles.row}>
          <View style={styles.avatar}>
            {delivered ? <CheckCircle2 size={22} color={theme.colors.success} /> : <Bike size={22} color={theme.colors.primary} />}
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {courier.name}
            </Text>
            {(officeName || courier.vehicleType || courier.licensePlate) && (
              <Text style={styles.vehicle} numberOfLines={1}>
                {[
                  officeName,
                  courier.vehicleType ? t(`courier.vehicle_${courier.vehicleType.toLowerCase()}`, courier.vehicleType) : null,
                  courier.licensePlate,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            )}
            <Text style={styles.status}>{statusText}</Text>
          </View>
          {!!courier.phone && (
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => Linking.openURL(`tel:${courier.phone}`)}
              accessibilityLabel={t('courier.call')}
            >
              <Phone size={18} color={theme.colors.white} />
              <Text style={styles.callText}>{t('courier.call')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Search size={22} color={theme.colors.textMuted} />
          </View>
          <Text style={[styles.info, styles.status]}>{statusText}</Text>
        </View>
      )}

      {/* After delivery: rate once, then show the stars given */}
      {delivered && myRating && (
        <View style={styles.ratedRow}>
          <Text style={styles.ratedLabel}>{t('courier.your_rating')}</Text>
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} size={16} color={theme.colors.accent} fill={n <= myRating.stars ? theme.colors.accent : 'transparent'} />
          ))}
        </View>
      )}
      {canRate && (
        <TouchableOpacity style={styles.rateButton} onPress={() => setRatingOpen(true)}>
          <Star size={16} color={theme.colors.white} />
          <Text style={styles.rateText}>{t('courier.rate_delivery')}</Text>
        </TouchableOpacity>
      )}

      {canRate && (
        <RatingModal
          visible={ratingOpen}
          onClose={() => setRatingOpen(false)}
          title={t('courier.rate_delivery')}
          subjectName={ratedName}
          submit={(stars, comment) => DeliveryService.rateDelivery(delivery.deliveryId, stars, comment)}
          onRated={() => queryClient.invalidateQueries({ queryKey: ['order-couriers', orderId] })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: 8,
    ...theme.shadows.soft,
  },
  position: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  vehicle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  status: { fontSize: 13, color: theme.colors.primary, marginTop: 2 },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.success,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
  },
  callText: { color: theme.colors.white, fontWeight: '700' },
  ratedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  ratedLabel: { fontSize: 13, color: theme.colors.textSecondary, marginEnd: 6 },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
  },
  rateText: { color: theme.colors.white, fontWeight: '700' },
});
