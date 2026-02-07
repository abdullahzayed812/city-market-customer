import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  // Dimensions,
  // SafeAreaView,
  StatusBar,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Star, MapPin, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { CatalogService } from '../services/api/catalogService';
import { VendorService } from '../services/api/vendorService';
import { useCart } from '../app/CartContext';
import { theme } from '../theme';
import { getBaseURL } from '../services/api/apiClient';
import CustomModal from '../components/common/CustomModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// const { width } = Dimensions.get('window');

const StoreDetailsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => VendorService.getVendorById(vendorId),
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', vendorId],
    queryFn: () => CatalogService.getProductsByVendor(vendorId),
  });

  const handleAddToCart = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const confirmAddToCart = () => {
    if (selectedProduct) {
      addToCart({ ...selectedProduct, quantity: 1, vendorId });
      setModalVisible(false);
      setSelectedProduct(null);
      Toast.show({
        type: 'success',
        text1: t('store.added_to_cart'),
        position: 'bottom',
      });
    }
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        style={styles.productTouchable}
        onPress={() =>
          navigation.navigate('ProductDetails', { productId: item.id })
        }
      >
        <Image
          source={{ uri: `${getBaseURL()}${item.imageUrl}` }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  if (vendorLoading || productsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: `${getBaseURL()}${vendor?.storeImage}` }}
            style={styles.vendorHeaderImage}
          />
          <View style={styles.imageOverlay} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color={theme.colors.white} size={28} />
          </TouchableOpacity>
        </View>

        {/* Store Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Text style={styles.shopName}>{vendor?.shopName}</Text>
            <View style={styles.ratingBadge}>
              <Star
                size={14}
                color={theme.colors.accent}
                fill={theme.colors.accent}
              />
              <Text style={styles.ratingValue}>4.8</Text>
            </View>
          </View>

          <Text style={styles.shopDescription}>{vendor?.shopDescription}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={16} color={theme.colors.secondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {vendor?.address || 'City Center'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.secondary} />
              <Text style={styles.metaText}>20-30 min</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>{t('store.products')}</Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('common.no_results') || 'No products available'}
              </Text>
            </View>
          }
        />

        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
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
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerImageContainer: {
    height: 250,
    width: '100%',
  },
  vendorHeaderImage: {
    ...StyleSheet.absoluteFill,
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    marginTop: -40,
    marginHorizontal: 20,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  shopName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  ratingValue: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  shopDescription: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.colors.secondary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    marginBottom: 16,
    overflow: 'hidden',
    ...theme.shadows.soft,
  },
  productTouchable: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  productDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  addButton: {
    width: 44,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
  },
});

export default StoreDetailsScreen;
