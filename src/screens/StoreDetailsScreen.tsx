import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '../theme';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import { useStoreDetails } from '../features/store/hooks/useStoreDetails';
import { StoreHeader } from '../features/store/components/StoreHeader';
import { useCart } from '../app/CartContext';
import { getApiBaseURL } from '../utils/serverConfig';
import FloatingCartBar from '../components/common/FloatingCartBar';

const StoreDetailsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const {
    t,
    vendor,
    vendorLoading,
    categoriesLoading,
    vendorCategories,
    insets,
  } = useStoreDetails(vendorId);

  const { itemCount, total } = useCart();

  const handleCartPress = useCallback(() => {
    navigation.navigate('Main', { screen: 'Cart' });
  }, [navigation]);

  const handleCategoryPress = useCallback(
    (categoryId: string, categoryName: string) => {
      navigation.navigate('CategoryProducts', { vendorId, categoryId, categoryName });
    },
    [navigation, vendorId],
  );

  if (vendorLoading || categoriesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vendorCategories}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View>
            <View style={[styles.heroContainer, { height: 240 + insets.top }]}>
              <ImageWithPlaceholder
                uri={vendor?.storeImage ? `${getApiBaseURL()}${vendor.storeImage}` : null}
                style={[StyleSheet.absoluteFill, { resizeMode: 'cover' }] as any}
              />
              <View style={styles.heroOverlay} />
            </View>
            <StoreHeader t={t} vendor={vendor} navigation={navigation} insets={insets} />
            <Text style={styles.categorySectionLabel}>{t('store.categories')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            activeOpacity={0.8}
            onPress={() => handleCategoryPress(item.id, item.name)}
          >
            <View style={[styles.categoryColorDot, { backgroundColor: item.color || theme.colors.primary }]} />
            <Text style={styles.categoryName}>{item.name}</Text>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('store.no_categories')}</Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          itemCount > 0 && styles.listContentWithCart,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <FloatingCartBar itemCount={itemCount} total={total} onPress={handleCartPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  heroContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  categorySectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...theme.shadows.soft,
    gap: 14,
  },
  categoryColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    letterSpacing: -0.2,
  },
  listContent: {
    paddingBottom: 40,
  },
  listContentWithCart: {
    paddingBottom: 100,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default StoreDetailsScreen;
