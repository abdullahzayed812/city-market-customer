import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { AppText as Text } from '@city-market/mobile-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingCart } from 'lucide-react-native';
import { theme } from '../theme';
import QuantitySelector from '../components/common/QuantitySelector';
import { useProductDetails } from '../features/products/hooks/useProductDetails';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import { useAnimatedPress } from '../hooks/useAnimatedPress';

const { width } = Dimensions.get('window');

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
  } = useProductDetails(productId, navigation);

  const addBtnScale = useRef(new Animated.Value(1)).current;
  const { scaleValue, onPressIn, onPressOut } = useAnimatedPress(0.97);

  const triggerAddAnim = () => {
    Animated.sequence([
      Animated.spring(addBtnScale, { toValue: 0.93, useNativeDriver: true, speed: 50, bounciness: 4 }),
      Animated.spring(addBtnScale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 8 }),
    ]).start();
    handleAddToCart();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.floatingHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ChevronLeft color={theme.colors.textPrimary} size={22} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageWrapper}>
            <ImageWithPlaceholder
              uri={imageUrl}
              style={styles.heroImage}
              resizeMode="contain"
            />
            {!stockAvailable && (
              <View style={styles.outOfStockBanner}>
                <Text style={styles.outOfStockBannerText}>Out of Stock</Text>
              </View>
            )}
          </View>

          <View style={styles.infoSheet}>
            <View style={styles.titleRow}>
              <Text style={styles.productName}>{product?.name}</Text>
              <View style={styles.priceBox}>
                <Text style={styles.productPrice}>${product?.price.toFixed(2)}</Text>
                {isWeight && <Text style={styles.priceUnit}>/kg</Text>}
              </View>
            </View>

            <View style={styles.stockRow}>
              <View style={[styles.stockDot, { backgroundColor: stockAvailable ? theme.colors.success : theme.colors.error }]} />
              <Text style={[styles.stockLabel, { color: stockAvailable ? theme.colors.success : theme.colors.error }]}>
                {stockAvailable ? t('product.in_stock') || 'In Stock' : t('store.out_of_stock')}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>{t('common.description') || 'Description'}</Text>
            <Text style={styles.description}>{product?.description}</Text>

            <View style={styles.qtySection}>
              <Text style={styles.sectionLabel}>
                {isWeight ? t('product.weight') || 'Weight' : t('product.quantity') || 'Quantity'}
              </Text>
              <QuantitySelector
                quantity={amount}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                maxQuantity={maxAmount}
                minQuantity={isWeight ? 500 : 1}
                displayValue={isWeight ? `${(amount / 1000).toFixed(1)} kg` : undefined}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={stockAvailable ? triggerAddAnim : undefined}
            onPressIn={stockAvailable ? onPressIn : undefined}
            onPressOut={stockAvailable ? onPressOut : undefined}
            disabled={!stockAvailable}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.addBtn,
                !stockAvailable && styles.addBtnDisabled,
                { transform: [{ scale: stockAvailable ? scaleValue : 1 }] },
              ]}
            >
              <ShoppingCart size={20} color={theme.colors.white} />
              <Text style={styles.addBtnText}>{t('store.add_to_cart')}</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    zIndex: 10,
    flexDirection: 'row',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageWrapper: {
    width: width,
    height: width * 0.78,
    backgroundColor: theme.colors.borderLight,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockBanner: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(239,68,68,0.9)',
    padding: 10,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  outOfStockBannerText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoSheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    marginTop: -theme.radius.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  productName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: '400',
  },
  qtySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingBottom: 24,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.radius.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.medium,
  },
  addBtnDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnText: {
    color: theme.colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});

export default ProductDetailsScreen;
