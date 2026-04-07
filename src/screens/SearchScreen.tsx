import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  Search,
  ChevronLeft,
  X,
  ShoppingBag,
  PackageSearch,
  FilterX,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { getBaseURL } from '../services/api/apiClient';
import ImageWithPlaceholder from '../components/common/ImageWithPlaceholder';
import { MeasurementType } from '@city-market/shared';
import { useSearch } from '../hooks/useSearch';

const SearchScreen = ({ navigation, route }: any) => {
  const categoryId = route.params?.categoryId;
  const {
    t,
    query,
    setQuery,
    products,
    isLoading,
    refetch,
    selectedCategory,
    clearSearch,
  } = useSearch(categoryId);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() =>
          navigation.navigate('ProductDetails', { productId: item.id })
        }
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <ImageWithPlaceholder
            uri={item.imageUrl ? `${getBaseURL()}${item.imageUrl}` : null}
            style={styles.itemImage}
          />
        </View>
        <View style={styles.itemInfo}>
          <View>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemCat}>
              {item.globalCategoryName || t('common.product')}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <View style={styles.priceInfo}>
              {item.measurementType === MeasurementType.WEIGHT && (
                <Text style={styles.unitText}>/ kg</Text>
              )}
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            {(item.measurementType === MeasurementType.UNIT
              ? item.stockQuantity < 5
              : item.stockWeightGrams < 5000) && (
              <Text style={styles.stockWarning}>
                {t('store.low_stock') || 'Low Stock'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [navigation, t],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.white} />
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.searchBarContainer}>
            <Search
              size={18}
              color={theme.colors.primary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={
                selectedCategory
                  ? `${t('common.search')} ${t('search.in')} ${
                      selectedCategory.name
                    }`
                  : t('home.search_placeholder')
              }
              value={query}
              onChangeText={setQuery}
              autoFocus={!categoryId}
              onSubmitEditing={() => refetch()}
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <X size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Badge Header */}
        {selectedCategory && !query && (
          <View style={styles.filterHeader}>
            <View style={styles.badgeContainer}>
              <Text style={styles.filterLabel}>{t('search.showing')}: </Text>
              <Text style={styles.categoryName}>{selectedCategory.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.resetFilter}
              onPress={() => navigation.setParams({ categoryId: undefined })}
            >
              <FilterX size={16} color={theme.colors.accent} />
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.loaderText}>{t('search.finding')}</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              query.length > 2 || categoryId ? (
                <View style={styles.emptyContainer}>
                  <PackageSearch size={80} color={theme.colors.surface} />
                  <Text style={styles.emptyText}>{t('common.no_results')}</Text>
                  <Text style={styles.emptySubText}>
                    {t('search.no_results_hint')}
                  </Text>
                </View>
              ) : (
                <View style={styles.initialContainer}>
                  <ShoppingBag
                    size={64}
                    color={theme.colors.surface}
                    style={{ opacity: 0.5 }}
                  />
                  <Text style={styles.initialText}>
                    {t('search.min_chars')}
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.primary,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  resetFilter: {
    padding: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.background,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  itemCat: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginRight: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  stockWarning: {
    fontSize: 10,
    color: theme.colors.error,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  initialContainer: {
    marginTop: 120,
    alignItems: 'center',
    opacity: 0.4,
  },
  initialText: {
    marginTop: 16,
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default SearchScreen;
