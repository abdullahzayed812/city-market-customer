import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import {
  AppText as Text,
  BackButton,
  Button,
  StatusBadge,
  LoadingState,
  palette,
  radii,
  space,
  elevation,
} from '@city-market/mobile-ui';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingCart, CircleCheck, CircleSlash } from 'lucide-react-native';
import QuantitySelector from '../components/common/QuantitySelector';
import { useProductDetails } from '../features/products/hooks/useProductDetails';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import QueryError from '../components/common/QueryError';
import { useFormat } from '../hooks/useFormat';

const ProductDetailsScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const {
    product,
    isLoading,
    amount,
    isWeight,
    handleIncrement,
    handleDecrement,
    handleAddToCart,
    imageUrl,
    stockAvailable,
    maxAmount,
    t,
    error,
    refetch,
    isRefetching,
  } = useProductDetails(productId, navigation);
  const { money, weight } = useFormat();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const backButton = (
    <BackButton
      onPress={() => navigation.goBack()}
      accessibilityLabel={t('common.back')}
      style={[styles.backBtn, { top: insets.top + space.sm }]}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState />
        {backButton}
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <QueryError error={error} onRetry={refetch} retrying={isRefetching} />
        {backButton}
      </SafeAreaView>
    );
  }

  const canAdd = stockAvailable && product.isAvailable !== false;
  const lineTotal = isWeight ? (product.price * amount) / 1000 : product.price * amount;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.imageWrapper, { height: Math.min(width, 420) + insets.top }]}>
          <ImageWithPlaceholder uri={imageUrl} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View style={styles.sheet}>
          {product.vendorName ? (
            <Text variant="caption" color={palette.primary}>
              {t('product.from_store', { store: product.vendorName })}
            </Text>
          ) : null}
          <Text variant="title" color={palette.text}>
            {product.name}
          </Text>

          <View style={styles.priceRow}>
            <Text variant="display" color={palette.text} style={styles.price}>
              {money(product.price)}
            </Text>
            {isWeight ? (
              <Text variant="body" color={palette.textMuted}>{t('common.per_kg')}</Text>
            ) : null}
          </View>

          <StatusBadge
            label={canAdd ? t('product.available') : t('store.out_of_stock')}
            tone={canAdd ? 'success' : 'neutral'}
            icon={canAdd ? CircleCheck : CircleSlash}
          />

          {product.description ? (
            <View style={styles.block}>
              <Text variant="subheading" color={palette.text}>{t('common.description')}</Text>
              <Text variant="body" color={palette.textSecondary} style={styles.description}>
                {product.description}
              </Text>
            </View>
          ) : null}

          {canAdd ? (
            <View style={[styles.block, styles.qtyRow]}>
              <Text variant="subheading" color={palette.text}>
                {isWeight ? t('product.weight') : t('product.quantity')}
              </Text>
              <QuantitySelector
                size="lg"
                quantity={amount}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                maxQuantity={maxAmount}
                minQuantity={isWeight ? 500 : 1}
                displayValue={isWeight ? weight(amount) : undefined}
              />
            </View>
          ) : null}
          {canAdd && amount >= maxAmount ? (
            <Text variant="caption" color={palette.warning}>{t('product.max_reached')}</Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        {canAdd ? (
          <View style={styles.footerTotal}>
            <Text variant="caption" color={palette.textMuted}>{t('product.line_total')}</Text>
            <Text variant="heading" color={palette.text} style={styles.tabular}>{money(lineTotal)}</Text>
          </View>
        ) : null}
        <Button
          label={canAdd ? t('store.add_to_cart') : t('store.out_of_stock')}
          icon={ShoppingCart}
          size="lg"
          disabled={!canAdd}
          onPress={handleAddToCart}
          style={styles.addBtn}
        />
      </View>

      {backButton}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingBottom: space.xxl,
  },
  backBtn: {
    position: 'absolute',
    start: space.lg,
    ...elevation.card,
  },
  imageWrapper: {
    width: '100%',
    backgroundColor: palette.surface,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  sheet: {
    marginTop: -space.xl,
    backgroundColor: palette.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
    gap: space.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  price: {
    fontVariant: ['tabular-nums'],
  },
  block: {
    marginTop: space.lg,
  },
  description: {
    marginTop: space.xs,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    padding: space.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.borderStrong,
  },
  footerTotal: {
    minWidth: 96,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  addBtn: {
    flex: 1,
  },
});

export default ProductDetailsScreen;
