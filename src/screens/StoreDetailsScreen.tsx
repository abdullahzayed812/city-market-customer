import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { theme } from '../theme';
import { getBaseURL } from '../services/api/apiClient';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import { useStoreDetails } from '../features/store/hooks/useStoreDetails';
import { StoreHeader } from '../features/store/components/StoreHeader';
import { ProductRow } from '../features/store/components/ProductRow';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

const StoreDetailsScreen = ({ route, navigation }: any) => {
  const { vendorId } = route.params;
  const {
    t,
    vendor,
    vendorLoading,
    productsLoading,
    categoriesLoading,
    sections,
    insets,
    handleAddToCart,
  } = useStoreDetails(vendorId);

  const renderRow = useCallback(
    ({ item }: { item: any[] }) => (
      <ProductRow
        items={item}
        navigation={navigation}
        onAdd={handleAddToCart}
      />
    ),
    [navigation, handleAddToCart],
  );

  if (vendorLoading || productsLoading || categoriesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerImageContainer, { height: 240 + insets.top }]}>
        <ImageWithPlaceholder
          uri={
            vendor?.storeImage ? `${getBaseURL()}${vendor.storeImage}` : null
          }
          style={[StyleSheet.absoluteFill, { resizeMode: 'cover' }] as any}
        />
        <View style={styles.imageOverlay} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item[0].id + index}
        renderItem={renderRow}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        ListHeaderComponent={
          <StoreHeader
            t={t}
            vendor={vendor}
            navigation={navigation}
            insets={insets}
          />
        }
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: 0 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('store.no_products')}</Text>
          </View>
        }
      />
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
  headerImageContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
