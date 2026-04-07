import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, Star, MapPin } from 'lucide-react-native';
import { theme } from '../../../theme';

interface StoreHeaderProps {
  t: any;
  vendor: any;
  navigation: any;
  insets: any;
}

export const StoreHeader = React.memo(({ t, vendor, navigation, insets }: StoreHeaderProps) => (
  <View>
    <View style={{ height: 200 + insets.top }}>
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft color={theme.colors.white} size={24} />
      </TouchableOpacity>
    </View>

    <View style={styles.infoCard}>
      <View style={styles.titleRow}>
        <Text style={styles.shopName}>{vendor?.shopName}</Text>
        <View style={styles.ratingBadge}>
          <Star
            size={12}
            color={theme.colors.primary}
            fill={theme.colors.accent}
          />
          <Text style={styles.ratingValue}>
            {vendor?.averageRating?.toFixed(1) || '0.0'}
          </Text>
        </View>
      </View>

      <Text style={styles.shopDescription}>{vendor?.shopDescription}</Text>

      <View style={styles.divider} />

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MapPin size={14} color={theme.colors.accent} />
          <Text style={styles.metaText} numberOfLines={1}>
            {vendor?.address?.split(',')[0]}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.metaItem}
          onPress={() =>
            navigation.navigate('VendorReviews', { vendorId: vendor?.id })
          }
        >
          <Star size={14} color={theme.colors.accent} />
          <Text style={styles.metaText}>
            {vendor?.totalRatings || 0} {t('store.reviews')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
));

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginTop: -60,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  shopDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
});
