import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../../../theme';
import { getBaseURL } from '../../../services/api/apiClient';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';

const { width } = Dimensions.get('window');
const VENDOR_CARD_WIDTH = width * 0.44;

enum VendorStatus {
  OPEN = 'OPEN',
}

interface VendorItemProps {
  item: any;
  onPress: (id: string) => void;
  t: any;
}

export const VendorItem = React.memo(({ item, onPress, t }: VendorItemProps) => (
  <TouchableOpacity
    style={styles.vendorCard}
    onPress={() => onPress(item.id)}
    activeOpacity={0.95}
  >
    <View style={styles.vendorImageContainer}>
      <ImageWithPlaceholder
        uri={item.storeImage ? `${getBaseURL()}${item.storeImage}` : null}
        style={styles.vendorImage}
      />
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              item.status === VendorStatus.OPEN
                ? theme.colors.success
                : theme.colors.error,
          },
        ]}
      >
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>
          {item.status === VendorStatus.OPEN
            ? t('home.open')
            : t('home.closed')}
        </Text>
      </View>
    </View>

    <View style={styles.vendorInfo}>
      <Text style={styles.vendorName} numberOfLines={1}>
        {item.shopName}
      </Text>
      <View style={styles.vendorMeta}>
        <View style={styles.ratingContainer}>
          <Star
            size={12}
            color={theme.colors.accent}
            fill={theme.colors.accent}
          />
          <Text style={styles.ratingText}>{item.averageRating}</Text>
        </View>
        <Text style={styles.vendorAddress} numberOfLines={1}>
          {item.address?.split(',')[0]}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  vendorCard: {
    width: VENDOR_CARD_WIDTH,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    ...theme.shadows.soft,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  vendorImageContainer: {
    height: 120,
    width: '100%',
  },
  vendorImage: {
    height: '100%',
    width: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
    marginRight: 4,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  vendorInfo: {
    padding: theme.spacing.sm,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  vendorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  vendorAddress: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
});
