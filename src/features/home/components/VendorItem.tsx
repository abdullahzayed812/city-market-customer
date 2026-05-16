import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Star, Clock } from 'lucide-react-native';
import { theme } from '../../../theme';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';

const { width } = Dimensions.get('window');
const VENDOR_CARD_WIDTH = width * 0.46;

enum VendorStatus {
  OPEN = 'OPEN',
}

interface VendorItemProps {
  item: any;
  onPress: (id: string) => void;
  t: any;
  style?: any;
}

export const VendorItem = React.memo(({ item, onPress, t, style }: VendorItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isOpen = item.status === VendorStatus.OPEN;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 2,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [scale]);

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.vendorCard, style, { transform: [{ scale }] }]}>
        <View style={styles.imageContainer}>
          <ImageWithPlaceholder uri={item.storeImage || null} style={styles.vendorImage} />
          <View style={styles.imageGradient} />
          <View style={[styles.statusBadge, { backgroundColor: isOpen ? theme.colors.success : theme.colors.error }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {isOpen ? t('home.open') : t('home.closed')}
            </Text>
          </View>
          {item.averageRating > 0 && (
            <View style={styles.ratingOverlay}>
              <Star size={10} color={theme.colors.accent} fill={theme.colors.accent} />
              <Text style={styles.ratingOverlayText}>{item.averageRating}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.vendorName} numberOfLines={1}>
            {item.shopName}
          </Text>
          <View style={styles.metaRow}>
            <Clock size={11} color={theme.colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.address?.split(',')[0]}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  vendorCard: {
    width: VENDOR_CARD_WIDTH,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.medium,
  },
  imageContainer: {
    height: 130,
    width: '100%',
    backgroundColor: theme.colors.border,
  },
  vendorImage: {
    height: '100%',
    width: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
    marginRight: 3,
  },
  statusText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  ratingOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingOverlayText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 10,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    flex: 1,
    fontWeight: '500',
  },
});
