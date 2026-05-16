import React from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useShimmer } from '../../hooks/useShimmer';
import { theme } from '../../theme';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonBox = ({ width, height = 16, borderRadius = 8, style }: SkeletonBoxProps) => {
  const { opacity } = useShimmer();
  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export const HomeScreenSkeleton = () => (
  <View style={styles.container}>
    {/* Header skeleton */}
    <View style={styles.headerSk}>
      <View style={{ flex: 1 }}>
        <SkeletonBox width={80} height={12} borderRadius={6} style={{ marginBottom: 8 }} />
        <SkeletonBox width={140} height={22} borderRadius={8} />
      </View>
      <SkeletonBox width={44} height={44} borderRadius={22} />
    </View>

    {/* Search skeleton */}
    <SkeletonBox width="100%" height={50} borderRadius={14} style={styles.searchSk} />

    {/* Category row skeleton */}
    <View style={styles.catRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={styles.catItem}>
          <SkeletonBox width={60} height={60} borderRadius={30} />
          <SkeletonBox width={50} height={10} borderRadius={5} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>

    {/* Section title skeleton */}
    <SkeletonBox width={120} height={18} borderRadius={9} style={styles.sectionSk} />

    {/* Cards row skeleton */}
    <View style={styles.cardRow}>
      {[1, 2].map(i => (
        <View key={i} style={styles.cardSk}>
          <SkeletonBox width="100%" height={120} borderRadius={0} />
          <View style={styles.cardInfo}>
            <SkeletonBox width="70%" height={14} borderRadius={7} style={{ marginBottom: 6 }} />
            <SkeletonBox width="50%" height={11} borderRadius={5} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

export const ProductCardSkeleton = () => (
  <View style={styles.productCardSk}>
    <SkeletonBox width="100%" height={120} borderRadius={0} />
    <View style={styles.productCardInfo}>
      <SkeletonBox width="75%" height={14} borderRadius={7} style={{ marginBottom: 6 }} />
      <SkeletonBox width="50%" height={11} borderRadius={5} style={{ marginBottom: 8 }} />
      <SkeletonBox width={60} height={16} borderRadius={8} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.border,
  },
  container: {
    padding: theme.spacing.lg,
  },
  headerSk: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  searchSk: {
    marginBottom: theme.spacing.lg,
  },
  catRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  catItem: {
    alignItems: 'center',
  },
  sectionSk: {
    marginBottom: theme.spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cardSk: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  cardInfo: {
    padding: theme.spacing.sm,
  },
  productCardSk: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    flex: 1,
    margin: theme.spacing.xs,
  },
  productCardInfo: {
    padding: theme.spacing.sm,
  },
});
