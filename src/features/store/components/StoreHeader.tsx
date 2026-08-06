import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { Star, MapPin, MessageSquare } from 'lucide-react-native';
import { theme } from '../../../theme';

interface StoreHeaderProps {
  t: any;
  vendor: any;
  navigation: any;
}

export const StoreHeader = React.memo(({ t, vendor, navigation }: StoreHeaderProps) => (
  <View>
    <View style={styles.infoCard}>
      <View style={styles.titleRow}>
        <Text style={styles.shopName} numberOfLines={1}>{vendor?.shopName}</Text>
        <View style={styles.ratingBadge}>
          <Star size={12} color={theme.colors.accent} fill={theme.colors.accent} />
          <Text style={styles.ratingValue}>{vendor?.averageRating?.toFixed(1) ?? '0.0'}</Text>
        </View>
      </View>

      {vendor?.shopDescription ? (
        <Text style={styles.description} numberOfLines={2}>{vendor.shopDescription}</Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={13} color={theme.colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {vendor?.address?.split(',')[0]}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.reviewsBtn}
          onPress={() => navigation.navigate('VendorReviews', { vendorId: vendor?.id })}
        >
          <MessageSquare size={13} color={theme.colors.primary} />
          <Text style={styles.reviewsBtnText}>
            {vendor?.totalRatings ?? 0} {t('store.reviews')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
));

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.4,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  description: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 19,
    marginBottom: 14,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    flex: 1,
    fontWeight: '500',
  },
  reviewsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryXLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  reviewsBtnText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
