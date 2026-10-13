import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText as Text, StatusBadge, ForwardIcon, palette, radii, space, elevation } from '@city-market/mobile-ui';
import { Star, MapPin, Store, Clock } from 'lucide-react-native';
import { ShopStatus } from '@city-market/shared';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';

interface StoreHeaderProps {
  t: any;
  vendor: any;
  navigation: any;
}

export const StoreHeader = React.memo(({ t, vendor, navigation }: StoreHeaderProps) => {
  const isOpen = vendor?.status === ShopStatus.OPEN;
  const rating = Number(vendor?.averageRating) || 0;
  const totalRatings = vendor?.totalRatings ?? 0;

  return (
    <View>
      <ImageWithPlaceholder uri={vendor?.storeImage || null} style={styles.cover} fallbackIcon={Store} />

      <View style={styles.infoCard}>
        <View style={styles.titleRow}>
          <Text variant="title" color={palette.text} style={styles.shopName}>
            {vendor?.shopName}
          </Text>
          <StatusBadge
            label={isOpen ? t('home.open') : t('home.closed')}
            tone={isOpen ? 'success' : 'neutral'}
            icon={isOpen ? undefined : Clock}
          />
        </View>

        {vendor?.shopDescription ? (
          <Text variant="body" color={palette.textSecondary} numberOfLines={3}>
            {vendor.shopDescription}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Pressable
            style={({ pressed }) => [styles.reviews, pressed && styles.pressed]}
            onPress={() => navigation.navigate('VendorReviews', { vendorId: vendor?.id })}
            accessibilityRole="button"
            accessibilityLabel={`${t('store.reviews')} ${totalRatings}`}
            hitSlop={6}
          >
            <Star size={16} color={palette.accent} fill={rating > 0 ? palette.accent : 'transparent'} />
            {rating > 0 ? (
              <Text variant="label" color={palette.text}>{rating.toFixed(1)}</Text>
            ) : null}
            <Text variant="caption" color={palette.textMuted}>
              {totalRatings} {t('store.reviews')}
            </Text>
            <ForwardIcon size={16} color={palette.textMuted} />
          </Pressable>

          {vendor?.address ? (
            <View style={styles.address}>
              <MapPin size={15} color={palette.textMuted} />
              <Text variant="caption" color={palette.textMuted} numberOfLines={1} style={styles.addressText}>
                {vendor.address.split(',')[0]}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    aspectRatio: 2.2,
  },
  infoCard: {
    backgroundColor: palette.surface,
    marginHorizontal: space.lg,
    marginTop: -space.xxl,
    marginBottom: space.lg,
    borderRadius: radii.lg,
    padding: space.lg,
    gap: space.sm,
    ...elevation.raised,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  shopName: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.md,
    paddingTop: space.sm,
    marginTop: space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.borderStrong,
  },
  reviews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
  },
  pressed: {
    opacity: 0.6,
  },
  address: {
    flex: 1,
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    flexShrink: 1,
  },
});
