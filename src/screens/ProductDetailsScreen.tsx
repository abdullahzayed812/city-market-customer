import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { theme } from '../theme';
import QuantitySelector from '../components/common/QuantitySelector';
import { useProductDetails } from '../features/products/hooks/useProductDetails';

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color={theme.colors.primary} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />

          <View style={styles.infoContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.productName}>{product?.name}</Text>
              <View style={styles.priceContainer}>
                {isWeight && <Text style={styles.priceUnit}> / kg</Text>}
                <Text style={styles.productPrice}>
                  ${product?.price.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>
              {t('common.description') || 'Description'}
            </Text>
            <Text style={styles.productDesc}>{product?.description}</Text>

            <View style={styles.stockSection}>
              <View
                style={[
                  styles.stockDot,
                  {
                    backgroundColor: stockAvailable
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              />
              <Text style={styles.stockText}>
                {stockAvailable
                  ? t('product.in_stock') || 'In Stock'
                  : t('store.out_of_stock')}
              </Text>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>
                {isWeight
                  ? t('orders.weight') || 'Weight'
                  : t('product.quantity') || 'Quantity'}
              </Text>
              <QuantitySelector
                quantity={amount}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                maxQuantity={maxAmount}
                minQuantity={isWeight ? 500 : 1}
                displayValue={
                  isWeight ? `${(amount / 1000).toFixed(1)} kg` : undefined
                }
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addButton, !stockAvailable && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={!stockAvailable}
          >
            <Text style={styles.addButtonText}>{t('store.add_to_cart')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroImage: {
    width: width,
    height: width * 0.8,
    backgroundColor: theme.colors.white,
    resizeMode: 'contain',
  },
  infoContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    marginTop: -theme.radius.xl,
    padding: theme.spacing.lg,
    minHeight: 500,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  productName: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    flex: 1,
    marginRight: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary,
  },
  priceUnit: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  productDesc: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  stockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stockText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  quantitySection: {
    marginBottom: theme.spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
    opacity: 0.6,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetailsScreen;
