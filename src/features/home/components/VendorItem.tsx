import React from 'react';
import { Pressable, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AppText as Text, StatusBadge, palette, radii, space, elevation } from '@city-market/mobile-ui';
import { Star, MapPin, Store, Clock } from 'lucide-react-native';
import { ShopStatus } from '@city-market/shared';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';

interface VendorItemProps {
  item: any;
  onPress: (id: string) => void;
  t: any;
  /** Card width; omit to fill the parent (grid cells). */
  width?: number;
  /** Small tile (square image, name, rating) so a home-screen row fits several stores. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Store card: cover image with open/closed state, name, area and rating. */
export const VendorItem = React.memo(({ item, onPress, t, width, compact, style }: VendorItemProps) => {
  const isOpen = item.status === ShopStatus.OPEN;
  const rating = Number(item.averageRating) || 0;
  const area = item.address?.split(',')[0]?.trim();

  if (compact) {
    return (
      <Pressable
        onPress={() => onPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.shopName}, ${isOpen ? t('home.open') : t('home.closed')}`}
        style={({ pressed }) => [styles.tile, width ? { width } : null, pressed && styles.pressed, style]}
      >
        <View style={styles.tileImage}>
          <ImageWithPlaceholder uri={item.storeImage || null} style={styles.image} fallbackIcon={Store} />
          {!isOpen && (
            <View style={styles.tileClosed}>
              <Text variant="micro" color={palette.white} numberOfLines={1} adjustsFontSizeToFit>
                {t('home.closed')}
              </Text>
            </View>
          )}
        </View>
        <Text variant="caption" color={palette.text} numberOfLines={2} style={styles.tileName}>
          {item.shopName}
        </Text>
        {rating > 0 ? (
          <View style={styles.tileRating}>
            <Star size={11} color={palette.accent} fill={palette.accent} />
            <Text variant="micro" color={palette.textMuted}>
              {rating.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.shopName}, ${isOpen ? t('home.open') : t('home.closed')}`}
      style={({ pressed }) => [styles.card, width ? { width } : null, pressed && styles.pressed, style]}
    >
      <View style={styles.imageContainer}>
        <ImageWithPlaceholder uri={item.storeImage || null} style={styles.image} fallbackIcon={Store} />
        {!isOpen && <View style={styles.closedVeil} />}
        <StatusBadge
          label={isOpen ? t('home.open') : t('home.closed')}
          tone={isOpen ? 'success' : 'neutral'}
          icon={isOpen ? undefined : Clock}
          size="sm"
          solid
          style={styles.statusBadge}
        />
      </View>

      <View style={styles.info}>
        <Text variant="bodyStrong" color={palette.text} numberOfLines={1}>
          {item.shopName}
        </Text>
        <View style={styles.metaRow}>
          {rating > 0 ? (
            <View style={styles.rating}>
              <Star size={13} color={palette.accent} fill={palette.accent} />
              <Text variant="caption" color={palette.text} style={styles.ratingValue}>
                {rating.toFixed(1)}
              </Text>
              {item.totalRatings ? (
                <Text variant="caption" color={palette.textMuted}>
                  {t('home.rating_count', { count: item.totalRatings })}
                </Text>
              ) : null}
            </View>
          ) : null}
          {area ? (
            <View style={styles.area}>
              <MapPin size={13} color={palette.textMuted} />
              <Text variant="caption" color={palette.textMuted} numberOfLines={1} style={styles.areaText}>
                {area}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
  },
  tileImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: palette.surface,
    ...elevation.card,
  },
  tileClosed: {
    position: 'absolute',
    start: 0,
    end: 0,
    bottom: 0,
    paddingVertical: 2,
    alignItems: 'center',
    backgroundColor: 'rgba(32, 41, 35, 0.65)',
  },
  tileName: {
    marginTop: space.xs,
    textAlign: 'center',
  },
  tileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...elevation.card,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    width: '100%',
    backgroundColor: palette.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closedVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  statusBadge: {
    position: 'absolute',
    top: space.sm,
    start: space.sm,
  },
  info: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.md,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingValue: {
    fontWeight: '700',
  },
  area: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  areaText: {
    flexShrink: 1,
  },
});
