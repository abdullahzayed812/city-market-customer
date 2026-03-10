import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react-native';
import { CatalogService } from '../services/api/catalogService';
import { useCart } from '../app/CartContext';
import { theme } from '../theme';
import { getBaseURL } from '../services/api/apiClient';
import QuantitySelector from '../components/common/QuantitySelector';
import CustomModal from '../components/common/CustomModal';
import Toast from 'react-native-toast-message';
import { MeasurementType } from '@city-market/shared';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const [amount, setAmount] = useState(1); // quantity or weightGrams
  const [modalVisible, setModalVisible] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => CatalogService.getVendorProductById(productId),
  });

  useEffect(() => {
    if (product) {
      if (product.measurementType === MeasurementType.WEIGHT) {
        setAmount(500); // Default 0.5kg
      } else {
        setAmount(1);
      }
    }
  }, [product]);

  const isWeight = product?.measurementType === MeasurementType.WEIGHT;

  const handleIncrement = useCallback(() => {
    if (isWeight) {
      setAmount(prev => prev + 500);
    } else {
      setAmount(prev => prev + 1);
    }
  }, [isWeight]);

  const handleDecrement = useCallback(() => {
    if (isWeight) {
      setAmount(prev => (prev > 500 ? prev - 500 : 500));
    } else {
      setAmount(prev => (prev > 1 ? prev - 1 : 1));
    }
  }, [isWeight]);

  const handleAddToCart = useCallback(() => {
    setModalVisible(true);
  }, []);

  const confirmAddToCart = useCallback(() => {
    if (!product) return;
    const cartItem: any = {
      ...product,
      measurementType: product.measurementType,
    };

    if (isWeight) {
      cartItem.weightGrams = amount;
      cartItem.weight = amount / 1000;
    } else {
      cartItem.quantity = amount;
    }

    addToCart(cartItem);
    setModalVisible(false);
    Toast.show({
      type: 'success',
      text1: t('store.added_to_cart'),
      position: 'bottom',
    });
    navigation.goBack();
  }, [product, isWeight, amount, addToCart, t, navigation]);

  const imageUrl = useMemo(() => product?.imageUrl
    ? `${getBaseURL()}${product.imageUrl}`
    : 'https://via.placeholder.com/400', [product?.imageUrl]);

  const stockAvailable = useMemo(() => {
      if (!product) return false;
      return isWeight ? ((product.stockWeightGrams || 0) > 0) : ((product.stockQuantity || 0) > 0);
  }, [isWeight, product]);

  const maxAmount = useMemo(() => {
      if (!product) return 0;
      return isWeight ? (product.stockWeightGrams || 0) : (product.stockQuantity || 0);
  }, [isWeight, product]);

  const handleCloseModal = useCallback(() => setModalVisible(false), []);

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
                <Text style={styles.productPrice}>
                  ${product?.price.toFixed(2)}
                </Text>
                {isWeight && <Text style={styles.priceUnit}> / kg</Text>}
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
                {isWeight ? (t('orders.weight') || 'Weight') : (t('product.quantity') || 'Quantity')}
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
            style={[
              styles.addButton,
              !stockAvailable && styles.disabledButton,
            ]}
            onPress={handleAddToCart}
            disabled={!stockAvailable}
          >
            <Text style={styles.addButtonText}>{t('store.add_to_cart')}</Text>
          </TouchableOpacity>
        </View>

        <CustomModal
          visible={modalVisible}
          onClose={handleCloseModal}
          title={t('common.confirm')}
          message={t('store.confirm_add')}
          confirmLabel={t('common.yes')}
          cancelLabel={t('common.no')}
          onConfirm={confirmAddToCart}
        />
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
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  productDesc: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    lineHeight: 24,
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
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
    paddingVertical: 18,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});

export default ProductDetailsScreen;
